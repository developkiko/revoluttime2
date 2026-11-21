"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { CheckCircle2Icon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice, getPack, type Locale } from "@/lib/products";
import { getOffer, getOfferSlot } from "@/lib/catalog";
import { ReceiptPrint, type ReceiptLine } from "@/components/checkout/ReceiptPrint";

/** Deterministic order code from the session id (FNV-1a → RT-XXXXXX). */
function orderCode(sessionId: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < sessionId.length; i++) {
    hash ^= sessionId.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `RT-${(hash >>> 0).toString(36).toUpperCase().slice(0, 6).padStart(6, "0")}`;
}

interface ReceiptSnapshot {
  code: string;
  lines: ReceiptLine[];
  total: string;
}

/** Имя набора для чека: из переводов (в данных PackVariant имени нет). */
function usePackName(): (packId: string) => string {
  const t = useTranslations("variants");
  return React.useCallback(
    (packId: string) => t(`packs.${packId}.name` as never),
    [t],
  );
}

/**
 * Успех оплаты: код заказа (RT-XXXXXX из session) + «печать чека»
 * (ReceiptPrint) с позициями корзины, итогом и QR. Корзина чистится
 * после снятия снимка заказа.
 */
export function CheckoutSuccess() {
  const t = useTranslations("checkout");
  const locale = useLocale() as Locale;
  const packName = usePackName();
  const { items, totalPriceCents, clear } = useCart();
  const sessionId = useSearchParams().get("session_id");

  // Снимок заказа: строим в эффекте ДО очистки корзины и храним в state —
  // после clear() items пуст, но чек должен показать, ЧТО куплено.
  // setState — в колбэке таймера (не синхронно в эффекте: react-hooks v6).
  const [snapshot, setSnapshot] = React.useState<ReceiptSnapshot | null>(null);

  React.useEffect(() => {
    if (!sessionId || snapshot || items.length === 0) return;
    const t = setTimeout(() => {
      const lines: ReceiptLine[] = [];
      for (const item of items) {
        if (item.kind === "pack") {
          const pack = getPack(item.packId);
          lines.push({
            label: `${packName(item.packId)} · ×${item.quantity}`,
            value: formatPrice(item.quantity * (pack?.priceCents ?? 0), locale),
          });
        } else {
          const offer = getOffer(item.offerSlug);
          const slot = getOfferSlot(item.offerSlug, item.slotId);
          const title = offer?.title[locale] ?? item.offerSlug;
          const date = slot
            ? new Date(`${slot.date}T00:00:00`).toLocaleDateString(locale)
            : item.slotId;
          lines.push({
            label: `${title} · ${date} · ×${item.people}`,
            value: formatPrice(slot ? slot.priceCents * item.people : 0, locale),
          });
        }
      }
      setSnapshot({
        code: orderCode(sessionId),
        lines,
        total: formatPrice(totalPriceCents, locale),
      });
      clear();
    }, 0);
    return () => clearTimeout(t);
  }, [sessionId, snapshot, items, totalPriceCents, locale, packName, clear]);

  return (
    <div className="mx-auto max-w-xl">
      {snapshot ? (
        <>
          <div data-tilt className="order-done">
            <p className="order-done-ico">
              <CheckCircle2Icon className="size-10 text-green-600" />
            </p>
            <h2 className="mt-3 text-2xl font-bold text-green-600">{t("successTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("successText")}</p>
            <div className="order-done-card mt-6">
              <p className="order-code">{snapshot.code}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                {t("orderId")} · {snapshot.total}
              </p>
            </div>
          </div>

          {/* «Печать чека» — анимированный блок оплаты: чек с позициями,
              итогом и QR кода заказа */}
          <div className="mt-10 flex justify-center">
            <ReceiptPrint
              code={snapshot.code}
              lines={snapshot.lines}
              total={snapshot.total}
              sub={[new Date().toLocaleDateString(locale)]}
              thanks={t("receiptThanks")}
            />
          </div>

          <div className="mt-10 flex justify-center">
            <Button asChild>
              <Link href="/shop">{t("backToShop")}</Link>
            </Button>
          </div>
        </>
      ) : (
        <div data-tilt className="mx-auto max-w-xl rounded-xl border bg-card p-8 text-center">
          <CheckCircle2Icon className="mx-auto size-10 text-emerald-500" />
          <h2 className="mt-4 text-xl font-bold">{t("successTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("successText")}</p>
          {sessionId && (
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">
              {t("orderId")}: {sessionId.slice(-12).toUpperCase()}
            </p>
          )}
          <Button asChild className="mt-6">
            <Link href="/shop">{t("backToShop")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
