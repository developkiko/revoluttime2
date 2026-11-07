"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { CreditCardIcon, ShoppingCartIcon, TicketIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  cartItemKey,
  useCart,
  type PackCartItem,
} from "@/components/cart/CartProvider";
import { formatPrice, getPack, type Locale } from "@/lib/products";
import { AnalyticsEvents, track } from "@/lib/analytics/events";

/**
 * Order summary + hand-off to Stripe Checkout (server session in /api/checkout).
 * Only tablet packs are payable online; booked tickets stay in the cart and are
 * confirmed manually via WhatsApp/Telegram.
 */
export function CheckoutView() {
  const { items, totalPriceCents } = useCart();
  const locale = useLocale() as Locale;
  const t = useTranslations("checkout");
  const [pending, setPending] = React.useState(false);

  const packs = items.filter((item): item is PackCartItem => item.kind === "pack");
  const tickets = items.filter((item) => item.kind === "ticket");

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
        toast.error(t("notConfigured"));
      } else {
        toast.error(t("error"));
      }
    } catch {
      toast.error(t("error"));
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
                </div>
                <p className="text-sm font-semibold">
                  {formatPrice(pack.priceCents * item.quantity, locale)}
                </p>
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
