import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getPack, PACK_VARIANTS, type PackId } from "@/lib/products";
import { partnerFundCents } from "@/lib/mlm-calculator";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { notifyAdminChat } from "@/lib/telegram";

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
  items: WebhookCartLine[];
  shipping_address: unknown;
  ref_code: string | null;
  status: string;
}

interface LedgerInsert {
  source_order_id: string | null;
  amount: number;
  status: "pending";
  unlocks_at: string;
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

    // Pending ledger row keeps the money trail; beneficiary is backfilled once
    // profiles/auth exist (see referral_tree).
    const ledger: LedgerInsert = {
      source_order_id: orderId,
      amount: fundCents / 100,
      status: "pending",
      unlocks_at: unlocksAt,
    };
    const { error: ledgerError } = await supabase.from("financial_ledger").insert(ledger);
    if (ledgerError) {
      console.error("stripe webhook: ledger insert failed", ledgerError);
    } else {
      db = "inserted";
    }
  }

  const itemsText = lines.length
    ? lines.map((line) => `${line.packId} ×${line.quantity}`).join(", ")
    : "(нет позиций в metadata)";
  const delivered = await notifyAdminChat(
    [
      paid ? "💰 <b>Новый оплаченный заказ</b>" : "🧾 <b>Новый заказ (ожидает оплаты)</b>",
      "",
      `Сумма: <b>${formatEuros((session.amount_total ?? 0) / 100)}</b>`,
      order.customer_email ? `E-mail: ${order.customer_email}` : null,
      refCode ? `Ref: ${refCode}` : null,
      `Позиции: ${itemsText}`,
      `Фонд 30% (холдинг до ${unlocksAt.slice(0, 10)}): ${formatEuros(fundCents)}`,
      `Session: ${session.id}`,
      `БД: ${db === "inserted" ? "✅ записано" : "⚠️ пропущено (нет ключа БД)"}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return NextResponse.json({ received: true, db, order_id: orderId, notified: delivered });
}
