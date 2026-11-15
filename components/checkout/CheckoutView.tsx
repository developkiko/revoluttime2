"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { CreditCardIcon, GiftIcon, ShoppingCartIcon, TicketIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  cartItemKey,
  useCart,
  type PackCartItem,
} from "@/components/cart/CartProvider";
import { formatPrice, getPack, type Locale } from "@/lib/products";
import { pricePacks } from "@/lib/pricing";
import { AnalyticsEvents, track } from "@/lib/analytics/events";
import { useNotice } from "@/components/ui/notice";

/**
 * Order summary + hand-off to Stripe Checkout (server session in /api/checkout).
 * Only tablet packs are payable online; booked tickets stay in the cart and are
 * confirmed manually via WhatsApp/Telegram.
 */
export function CheckoutView() {
  const { items, totalPriceCents } = useCart();
  const locale = useLocale() as Locale;
  const t = useTranslations("checkout");
  const { notice } = useNotice();
  const [pending, setPending] = React.useState(false);

  const packs = items.filter((item): item is PackCartItem => item.kind === "pack");
  const tickets = items.filter((item) => item.kind === "ticket");

  const { savedCents, bonusPacks } = packs.reduce(
    (acc, item) => {
      const pricing = pricePacks(getPack(item.packId), item.quantity);
      acc.savedCents += pricing.savedCents;
      acc.bonusPacks += pricing.bonusPacks;
      return acc;
    },
    { savedCents: 0, bonusPacks: 0 }
  );

  async function startPayment() {
    if (pending) return;
    setPending(true);
    track(AnalyticsEvents.CHECKOUT_START, { total_cents: totalPriceCents, lines: packs.length });
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: packs, locale }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (response.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      if (response.status === 503) {
        notice({ text: t("notConfigured"), variant: "error" });
      } else {
        notice({ text: t("error"), variant: "error" });
      }
    } catch {
      notice({ text: t("error"), variant: "error" });
    } finally {
      setPending(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <ShoppingCartIcon className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">{t("empty")}</p>
        <Button asChild className="mt-5">
          <Link href="/shop">{t("backToShop")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Order lines */}
      <div className="rounded-xl border bg-card">
        <h2 className="border-b px-5 py-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("itemsTitle")}
        </h2>
        <ul className="divide-y">
          {packs.map((item) => {
            const pack = getPack(item.packId);
            const pricing = pricePacks(pack, item.quantity);
            return (
              <li key={cartItemKey(item)} className="flex items-center gap-4 px-5 py-4">
                <div className="size-14 shrink-0 overflow-hidden rounded-md border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pack.image} alt="" className="size-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    RevolutTIME Magnesium + H₂ — {pack.tablets}
                  </p>
                  <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                  {pricing.qualifies && (
                    <p className="mt-1 inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                      <GiftIcon className="size-3" />
                      {t("bonus", { count: pricing.bonusPacks })}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  {pricing.qualifies && (
                    <s className="text-xs text-muted-foreground decoration-red-400/70">
                      {formatPrice(pack.priceCents * item.quantity, locale)}
                    </s>
                  )}
                  <p className="text-sm font-semibold">
                    {formatPrice(pricing.totalCents, locale)}
                  </p>
                </div>
              </li>
            );
          })}
          {tickets.length > 0 && (
            <li className="flex items-start gap-3 px-5 py-4 text-xs text-muted-foreground">
              <TicketIcon className="mt-0.5 size-4 shrink-0" />
              <p>{t("ticketsNote")}</p>
            </li>
          )}
        </ul>
      </div>

      {/* Payment */}
      <div className="h-fit rounded-xl border bg-card p-5">
        {savedCents > 0 && (
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-primary">
            <GiftIcon className="size-3.5 shrink-0" />
            {t("savings", { amount: formatPrice(savedCents, locale) })}
            {bonusPacks > 0 && ` · ${t("bonus", { count: bonusPacks })}`}
          </p>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("total")}</span>
          <span className="text-lg font-bold">{formatPrice(totalPriceCents, locale)}</span>
        </div>
        <Button
          size="lg"
          className="mt-5 w-full gap-2"
          onClick={startPayment}
          disabled={pending || packs.length === 0}
        >
          <CreditCardIcon className="size-4" />
          {pending ? t("paying") : t("pay")}
        </Button>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t("note")}</p>
      </div>
    </div>
  );
}
