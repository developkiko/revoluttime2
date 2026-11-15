"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  CalendarDaysIcon,
  GiftIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  TicketIcon,
  Trash2Icon,
  TruckIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cartItemKey, useCart, type CartItem } from "@/components/cart/CartProvider";
import { formatPrice, getPack, type Locale } from "@/lib/products";
import { pricePacks } from "@/lib/pricing";
import { getOffer } from "@/lib/catalog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

function offerTitle(offerSlug: string, locale: Locale): string {
  const offer = getOffer(offerSlug);
  return offer ? offer.title[locale] : offerSlug;
}

function formatDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`));
}

function Stepper({
  count,
  minLabel,
  plusLabel,
  removeLabel,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  count: number;
  minLabel: string;
  plusLabel: string;
  removeLabel: string;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={minLabel}
        disabled={count <= 1}
        onClick={onDecrease}
      >
        <MinusIcon />
      </Button>
      <span className="w-8 text-center font-medium tabular-nums">{count}</span>
      <Button variant="outline" size="icon-sm" aria-label={plusLabel} onClick={onIncrease}>
        <PlusIcon />
      </Button>
      {/* Always visible: one click drops the whole line, no matter the count. */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-red-500"
        aria-label={removeLabel}
        onClick={onRemove}
      >
        <Trash2Icon />
      </Button>
    </div>
  );
}

function CartLine({ item, locale }: { item: CartItem; locale: Locale }) {
  const t = useTranslations("cart");
  const tVariants = useTranslations("variants");
  const { addPack, addTicket, setQuantity, remove } = useCart();
  const key = cartItemKey(item);

  if (item.kind === "pack") {
    const pack = getPack(item.packId);
    const pricing = pricePacks(pack, item.quantity);
    return (
      <li className="flex gap-3 p-4">
        <div className="size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pack.image} alt="" className="size-full object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium">
                {tVariants(`packs.${item.packId}.name` as never)}
              </p>
              <div className="flex items-baseline gap-1.5 text-sm">
                {pricing.qualifies && (
                  <s className="text-muted-foreground decoration-red-400/70">
                    {formatPrice(pack.priceCents, locale)}
                  </s>
                )}
                <span className={pricing.qualifies ? "font-medium text-primary" : "text-muted-foreground"}>
                  {formatPrice(
                    pricing.qualifies ? pack.partnerPriceCents : pack.priceCents,
                    locale
                  )}
                </span>
              </div>
              {pricing.qualifies && (
                <p className="mt-1 inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                  <GiftIcon className="size-3" />
                  {t("bonus", { count: pricing.bonusPacks })}
                </p>
              )}
            </div>
            <p className="shrink-0 font-semibold tabular-nums">
              {formatPrice(pricing.totalCents, locale)}
            </p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Stepper
              count={item.quantity}
              minLabel="−"
              plusLabel="+"
              removeLabel={t("remove")}
              onDecrease={() => setQuantity(key, item.quantity - 1)}
              onIncrease={() => addPack(item.packId)}
              onRemove={() => remove(key)}
            />
          </div>
        </div>
      </li>
    );
  }

  const slot = getOffer(item.offerSlug)?.slots.find((s) => s.id === item.slotId);
  const unit = slot?.priceCents ?? 0;

  return (
    <li className="flex gap-3 p-4">
      <div className="flex size-16 shrink-0 items-center justify-center rounded-md border bg-primary/10 text-primary">
        <TicketIcon className="size-6" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{offerTitle(item.offerSlug, locale)}</p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarDaysIcon className="size-3.5" />
              {slot ? formatDate(slot.date, locale) : item.slotId}
            </p>
          </div>
          <p className="shrink-0 font-semibold tabular-nums">
            {formatPrice(unit * item.people, locale)}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Stepper
            count={item.people}
            minLabel="−"
            plusLabel="+"
            removeLabel={t("remove")}
            onDecrease={() => setQuantity(key, item.people - 1)}
            onIncrease={() => addTicket(item.offerSlug, item.slotId, item.people + 1)}
            onRemove={() => remove(key)}
          />
        </div>
      </div>
    </li>
  );
}

export function CartDrawer() {
  const t = useTranslations("cart");
  const tVariants = useTranslations("variants");
  const locale = useLocale() as Locale;
  const { items, isOpen, closeCart, totalPriceCents } = useCart();

  const cartItems = items ?? [];
  const isEmpty = cartItems.length === 0;

  // Partner-condition savings across all pack lines (retail − charged).
  const { savedCents, bonusPacks } = cartItems.reduce(
    (acc, item) => {
      if (item.kind === "pack") {
        const pricing = pricePacks(getPack(item.packId), item.quantity);
        acc.savedCents += pricing.savedCents;
        acc.bonusPacks += pricing.bonusPacks;
      }
      return acc;
    },
    { savedCents: 0, bonusPacks: 0 }
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : closeCart())}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingBagIcon className="size-5" />
            {t("title")}
          </SheetTitle>
          {!isEmpty && <SheetDescription>{t("shippingNote")}</SheetDescription>}
        </SheetHeader>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <ShoppingBagIcon className="size-10 text-muted-foreground/40" />
            <p className="font-medium">{t("empty")}</p>
            <p className="text-sm text-muted-foreground">{t("emptyHint")}</p>
            <Button className="mt-4" onClick={closeCart}>
              {tVariants("cta")}
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto">
              {cartItems.map((item) => (
                <CartLine key={cartItemKey(item)} item={item} locale={locale} />
              ))}
            </ul>

            <SheetFooter className="border-t">
              {savedCents > 0 && (
                <p className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-primary">
                  <GiftIcon className="size-3.5 shrink-0" />
                  {t("savings", { amount: formatPrice(savedCents, locale) })}
                  {bonusPacks > 0 && ` · ${t("bonus", { count: bonusPacks })}`}
                </p>
              )}
              <div className="flex items-center justify-between text-base font-semibold">
                <span>{t("total")}</span>
                <span className="tabular-nums">
                  {formatPrice(totalPriceCents, locale)}
                </span>
              </div>
              <Button size="lg" className="w-full" asChild>
                <Link href="/checkout" onClick={closeCart}>
                  {t("checkout")}
                </Link>
              </Button>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TruckIcon className="size-3.5 shrink-0" />
                {t("shippingNote")}
              </p>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
