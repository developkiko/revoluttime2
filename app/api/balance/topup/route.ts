import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import Stripe from "stripe";
import { routing } from "@/i18n/routing";
import { getSessionUser } from "@/lib/auth-session";
import { isBalanceTopupAmount } from "@/lib/pricing";

/**
 * Direct internal-balance top-up (bypasses the cart): the user picks a fixed
 * amount (see BALANCE_TOPUP_AMOUNTS_CENTS) and lands on Stripe Checkout.
 * The webhook (metadata.purpose = "balance_topup") records the payment.
 *
 * Security posture for a money endpoint: session auth, server-side amount
 * whitelist (the client cannot name its own sum), fixed product metadata,
 * and every fallible step wrapped — failures return typed JSON, never throw.
 */
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
    }

    let body: { amountCents?: unknown; locale?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    // Whitelist check — anything but the fixed 600/700 € options is rejected.
    if (!isBalanceTopupAmount(body.amountCents)) {
      return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
    }
    const amountCents = body.amountCents;

    const locale = routing.locales.includes(body.locale as never)
      ? String(body.locale)
      : "de";
    const origin = await siteOrigin();

    const refCookie = (await cookies()).get("rt_ref")?.value ?? "";
    const stripe = new Stripe(secret);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Stripe Checkout has no "ru" UI locale — fall back to English for ru users.
      locale: locale === "de" ? "de" : "en",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            // § 19 UStG (Kleinunternehmer) — netto = gross.
            unit_amount: amountCents,
            product_data: {
              name: "RevolutTIME — внутренний баланс",
              description: "Пополнение внутреннего счёта партнёра",
            },
          },
        },
      ],
      customer_creation: "always", // attribute the payment to an email
      client_reference_id: refCookie || undefined,
      metadata: {
        purpose: "balance_topup",
        topup_amount: String(amountCents),
        user_email: user.email,
        ref: refCookie,
      },
      success_url: `${origin}/${locale}/cabinet?topup=success`,
      cancel_url: `${origin}/${locale}/cabinet?topup=cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("balance topup failed", error);
    return NextResponse.json({ error: "stripe_error" }, { status: 502 });
  }
}

async function siteOrigin(): Promise<string> {
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  if (envOrigin) return envOrigin.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
