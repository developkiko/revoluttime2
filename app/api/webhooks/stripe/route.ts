import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getPack, PACK_VARIANTS, type PackId } from "@/lib/products";
import {
  CASHBACK_CENTS,
  CASHBACK_HOLDING_DAYS,
  CASHBACK_TARGET_TOPUP_CENTS,
  partnerFundCents,
} from "@/lib/mlm-calculator";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { notifyAdminChat } from "@/lib/telegram";
import { db, dbConfigured } from "@/lib/ultra/db";

/** Widerrufsfrist — partner ledger entries unlock 14 days after the sale. */
const HOLDING_DAYS = 14;

interface WebhookCartLine {
  packId: PackId;
  quantity: number;
}

interface OrderInsert {
  stripe_session_id: string;
  customer_email: string | null;
  total_gross: number;
  currency: string;
  /** Cart lines, or a balance-topup marker (items[0].kind = "balance_topup"). */
  items: unknown;
  shipping_address: unknown;
  ref_code: string | null;
  status: string;
}

interface LedgerInsert {
  source_order_id: string | null;
  amount: number;
  status: "pending";
  unlocks_at: string;
  /** 'fund' — фонд 64 % (уровни I–V); 'cashback' — 300 € за приведённого. */
  kind?: "fund" | "cashback";
  ref_code?: string | null;
  beneficiary_email?: string | null;
}

/**
 * Кеш-бэк 300 € (владелец 21.11): ref-код → партнёр (auth_links.ref_code,
 * проставляется при входе). Холдинг CASHBACK_HOLDING_DAYS под возвраты
 * Stripe — статус pending, разморозка по unlocks_at (lazy, без крона).
 */
async function resolveRefPartner(
  refCode: string
): Promise<{ email: string | null; db: "resolved" | "skipped" }> {
  if (!dbConfigured()) return { email: null, db: "skipped" };
  try {
    const rows = await db<{ email: string }>(
      `SELECT email FROM auth_links WHERE ref_code = $1 LIMIT 1`,
      [refCode]
    );
    return { email: rows[0]?.email ?? null, db: "resolved" };
  } catch {
    return { email: null, db: "skipped" };
  }
}

async function recordCashback(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  orderId: string | null,
  refCode: string
): Promise<"inserted" | "no_partner" | "skipped"> {
  const partner = await resolveRefPartner(refCode);
  if (!partner.email) return "no_partner";
  const unlocksAt = new Date(
    Date.now() + CASHBACK_HOLDING_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  const { error } = await supabase.from("financial_ledger").insert({
    source_order_id: orderId,
    amount: CASHBACK_CENTS / 100,
    status: "pending",
    unlocks_at: unlocksAt,
    kind: "cashback",
    ref_code: refCode,
    beneficiary_email: partner.email,
  });
  if (error) {
    console.error("stripe webhook: cashback insert failed", error);
    return "skipped";
  }
  return "inserted";
}

function parseCartLines(raw: string | undefined): WebhookCartLine[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const knownIds = new Set(PACK_VARIANTS.map((variant) => variant.id));
    return parsed.flatMap((line) => {
      const { packId, quantity } = (line ?? {}) as { packId?: unknown; quantity?: unknown };
      const qty = Math.floor(Number(quantity));
      if (typeof packId !== "string" || !knownIds.has(packId as PackId) || !Number.isFinite(qty) || qty < 1) {
        return [];
      }
      return [{ packId: packId as PackId, quantity: Math.min(qty, 99) }];
    });
  } catch {
    return [];
  }
}

function formatEuros(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

/**
 * Balance top-up: store the payment as an order with a topup marker
 * (items.kind = "balance_topup" — the future balance API reads this) and
 * ping the admin chat. No partner-fund ledger entry: a top-up is not a sale.
 */
async function handleTopupSession(session: Stripe.Checkout.Session, paid: boolean) {
  const order: OrderInsert = {
    stripe_session_id: session.id,
    customer_email: session.metadata?.user_email ?? session.customer_details?.email ?? null,
    total_gross: (session.amount_total ?? 0) / 100,
    currency: (session.currency ?? "eur").toUpperCase(),
    items: [
      {
        kind: "balance_topup",
        amountCents: session.amount_total ?? 0,
      },
    ],
    shipping_address: null,
    ref_code: session.metadata?.ref || session.client_reference_id || null,
    status: paid ? "paid" : "processing",
  };

  const supabase = getSupabaseAdminClient();
  let db: "inserted" | "skipped" = "skipped";
  let cashback: "inserted" | "no_partner" | "skipped" | null = null;
  if (supabase) {
    const { error } = await supabase
      .from("orders")
      .upsert(order, { onConflict: "stripe_session_id" });
    if (error) {
      // Make Stripe retry so no top-up is lost.
      console.error("stripe webhook: topup order insert failed", error);
      return NextResponse.json({ error: "db_order_failed" }, { status: 500 });
    }
    db = "inserted";
    // Кеш-бэк 300 €: целевое пополнение приведённого (≥ 600 €) по ref-ссылке.
    if (
      paid &&
      order.ref_code &&
      (session.amount_total ?? 0) >= CASHBACK_TARGET_TOPUP_CENTS
    ) {
      cashback = await recordCashback(supabase, null, order.ref_code);
    }
  }

  const delivered = await notifyAdminChat(
    [
      paid ? "💳 <b>Пополнение баланса (оплачено)</b>" : "💳 <b>Пополнение баланса (ожидает оплаты)</b>",
      "",
      // amount_total — в центах, formatEuros делит на 100 сама (фикс ×100)
      `Сумма: <b>${formatEuros(session.amount_total ?? 0)}</b>`,
      order.customer_email ? `E-mail: ${order.customer_email}` : null,
      order.ref_code ? `Ref: ${order.ref_code}` : null,
      cashback === "inserted"
        ? `🪙 Кеш-бэк ${formatEuros(CASHBACK_CENTS)} (pending, холдинг ${CASHBACK_HOLDING_DAYS} дн.) → партнёру по ${order.ref_code}`
        : null,
      `Session: ${session.id}`,
      `БД: ${db === "inserted" ? "✅ записано" : "⚠️ пропущено (нет ключа БД)"}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return NextResponse.json({ received: true, kind: "balance_topup", db, cashback, notified: delivered });
}

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecret || !webhookSecret) {
    // Owner has not added the keys yet — tell Stripe to retry later.
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  const stripe = new Stripe(stripeSecret);
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);
  } catch (error) {
    console.error("stripe webhook: signature verification failed", error);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const paid = session.payment_status === "paid";

  // Balance top-up is a direct payment (no cart, no partner fund): record the
  // order with a topup marker and notify — then stop, the order path below
  // (partner fund ledger) must not run for it.
  if (session.metadata?.purpose === "balance_topup") {
    return handleTopupSession(session, paid);
  }

  const lines = parseCartLines(session.metadata?.items);
  const refCode = session.metadata?.ref || session.client_reference_id || null;

  const order: OrderInsert = {
    stripe_session_id: session.id,
    customer_email: session.customer_details?.email ?? session.customer_email ?? null,
    total_gross: (session.amount_total ?? 0) / 100,
    currency: (session.currency ?? "eur").toUpperCase(),
    items: lines,
    shipping_address: session.customer_details?.address ?? null,
    ref_code: refCode,
    status: paid ? "paid" : "processing",
  };

  // Partner fund per catalog prices (server-side truth), § 19 UStG: netto = gross.
  const fundCents = lines.reduce((sum, line) => {
    const pack = getPack(line.packId);
    return sum + partnerFundCents(pack.priceCents) * line.quantity;
  }, 0);

  const unlocksAt = new Date(Date.now() + HOLDING_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const supabase = getSupabaseAdminClient();
  let db: "inserted" | "skipped" = "skipped";
  let orderId: string | null = null;
  let cashback: "inserted" | "no_partner" | "skipped" | null = null;
  if (supabase) {
    const { data: insertedOrder, error: orderError } = await supabase
      .from("orders")
      .upsert(order, { onConflict: "stripe_session_id" })
      .select("id")
      .single();
    if (orderError) {
      // Make Stripe retry so no order is lost.
      console.error("stripe webhook: order insert failed", orderError);
      return NextResponse.json({ error: "db_order_failed" }, { status: 500 });
    }
    orderId = insertedOrder?.id ?? null;

    // Pending ledger row keeps the money trail (фонд 64 %); beneficiary is
    // backfilled once profiles/auth exist (see referral_tree).
    const ledger: LedgerInsert = {
      source_order_id: orderId,
      amount: fundCents / 100,
      status: "pending",
      unlocks_at: unlocksAt,
      kind: "fund",
    };
    const { error: ledgerError } = await supabase.from("financial_ledger").insert(ledger);
    if (ledgerError) {
      console.error("stripe webhook: ledger insert failed", ledgerError);
    } else {
      db = "inserted";
    }

    // Кеш-бэк 300 €: партнёрский набор приведённого (metadata partner_bundle).
    if (paid && refCode && session.metadata?.partner_bundle) {
      cashback = await recordCashback(supabase, orderId, refCode);
    }
  }

  const itemsText = lines.length
    ? lines.map((line) => `${line.packId} ×${line.quantity}`).join(", ")
    : "(нет позиций в metadata)";
  const delivered = await notifyAdminChat(
    [
      paid ? "💰 <b>Новый оплаченный заказ</b>" : "🧾 <b>Новый заказ (ожидает оплаты)</b>",
      "",
      // amount_total — в центах, formatEuros делит на 100 сама (фикс ×100)
      `Сумма: <b>${formatEuros(session.amount_total ?? 0)}</b>`,
      order.customer_email ? `E-mail: ${order.customer_email}` : null,
      refCode ? `Ref: ${refCode}` : null,
      `Позиции: ${itemsText}`,
      `Фонд 64% (уровни I–V, холдинг до ${unlocksAt.slice(0, 10)}): ${formatEuros(fundCents)}`,
      cashback === "inserted"
        ? `🪙 Кеш-бэк ${formatEuros(CASHBACK_CENTS)} (pending, холдинг ${CASHBACK_HOLDING_DAYS} дн.) → партнёру по ${refCode}`
        : cashback === "no_partner"
          ? `⚠️ Кеш-бэк не начислен: партнёр по ${refCode} не найден`
          : null,
      `Session: ${session.id}`,
      `БД: ${db === "inserted" ? "✅ записано" : "⚠️ пропущено (нет ключа БД)"}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return NextResponse.json({ received: true, db, order_id: orderId, cashback, notified: delivered });
}
