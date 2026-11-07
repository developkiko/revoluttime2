import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import Stripe from "stripe";
import { PACK_VARIANTS, type PackId } from "@/lib/products";
import { routing } from "@/i18n/routing";

interface CheckoutItemBody {
  kind: "pack";
  packId: PackId;
  quantity: number;
}

const MAX_QUANTITY_PER_LINE = 20;

async function siteOrigin(): Promise<string> {
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  if (envOrigin) return envOrigin.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function POST(request: Request) {
  let body: { items?: unknown; locale?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    // No Stripe key configured yet (owner has to add it in Vercel env) — the UI
    // shows a friendly notice instead of a broken payment attempt.
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const items = Array.isArray(body.items) ? (body.items as CheckoutItemBody[]) : [];
  const lines = items.filter((item) => item?.kind === "pack");
  if (lines.length === 0) {
    return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  }

  const locale = routing.locales.includes(body.locale as never) ? String(body.locale) : "de";
  const origin = await siteOrigin();

  // Prices are taken from the server catalogue only — the client cannot set them.
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const line of lines) {
    const pack = PACK_VARIANTS.find((variant) => variant.id === line.packId);
    if (!pack) {
      return NextResponse.json({ error: "unknown_product" }, { status: 400 });
    }
    const quantity = Math.floor(Number(line.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      return NextResponse.json({ error: "invalid_quantity" }, { status: 400 });
    }
    lineItems.push({
      quantity,
      price_data: {
        currency: "eur",
        unit_amount: pack.priceCents, // 18,99 € / 24,99 € — Kleinunternehmer §19 UStG (net = gross)
        product_data: {
          name: `RevolutTIME Magnesium + H₂ — ${pack.tablets} Tabletten`,
          images: [`${origin}${pack.image}`],
        },
      },
    });
  }

  const refCookie = (await cookies()).get("rt_ref")?.value ?? "";
  const stripe = new Stripe(secret);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Stripe Checkout has no "ru" UI locale — fall back to English for ru users.
      locale: locale === "de" ? "de" : "en",
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ["DE", "AT", "CH"] },
      customer_creation: "always", // so the order can be attributed to an email
      client_reference_id: refCookie || undefined,
      metadata: {
        items: JSON.stringify(lines),
        ref: refCookie,
      },
      success_url: `${origin}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/checkout/cancel`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("stripe checkout failed", error);
    return NextResponse.json({ error: "stripe_error" }, { status: 502 });
  }
}
