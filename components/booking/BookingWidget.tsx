"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDaysIcon, MinusIcon, PlusIcon, TicketIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import * as React from "react";

import { useCart } from "@/components/cart/CartProvider";
import { formatPrice, type Locale } from "@/lib/products";
import type { CatalogOffer } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

function groupLabel(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(`${isoDate}T00:00:00`)
  );
}

function dayLabel(isoDate: string, locale: Locale): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const day = new Intl.DateTimeFormat(locale, { day: "numeric" }).format(date);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
  return `${day}, ${weekday}`;
}

export function BookingWidget({ offer }: { offer: CatalogOffer }) {
  const t = useTranslations("booking");
  const tCart = useTranslations("cart");
  const locale = useLocale() as Locale;
  const { addTicket, openCart } = useCart();

  const [slotId, setSlotId] = React.useState(offer.slots[0]?.id ?? null);
  const [people, setPeople] = React.useState(1);

  const slot = offer.slots.find((s) => s.id === slotId) ?? null;
  const maxPeople = slot?.maxPeople ?? 1;
  const total = slot ? slot.priceCents * people : 0;

  // group slots by month for a compact calendar-like listing
  const groups = React.useMemo(() => {
    const map = new Map<string, typeof offer.slots>();
    for (const s of offer.slots) {
      const label = groupLabel(s.date, locale);
      const list = map.get(label) ?? [];
      list.push(s);
      map.set(label, list);
    }
    return [...map.entries()];
  }, [offer, locale]);

  function handleBook() {
    if (!slot) return;
    addTicket(offer.slug, slot.id, people);
    toast.success(t("addedToast", { title: offer.title[locale] }), {
      action: { label: tCart("title"), onClick: () => openCart() },
    });
  }

  if (offer.comingSoon || offer.slots.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center">
        <CalendarDaysIcon className="mx-auto size-8 text-muted-foreground/50" />
        <p className="mt-3 font-medium">{t("comingSoon")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("comingSoonHint")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <h3 className="flex items-center gap-2 font-semibold">
        <CalendarDaysIcon className="size-4 text-primary" />
        {t("pickDate")}
      </h3>

      <div className="mt-4 flex flex-col gap-4">
        {groups.map(([label, slots]) => (
          <div key={label}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {slots.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSlotId(s.id);
                    setPeople((p) => Math.min(Math.max(p, 1), s.maxPeople));
                  }}
                  aria-pressed={slotId === s.id}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    slotId === s.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background hover:border-primary/50"
                  }`}
                >
                  {dayLabel(s.date, locale)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-4">
        <div className="flex items-center gap-3">
          <UsersIcon className="size-4 text-primary" />
          <span className="text-sm text-muted-foreground">{t("people")}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="−"
              disabled={people <= 1}
              onClick={() => setPeople((p) => p - 1)}
            >
              <MinusIcon />
            </Button>
            <span className="w-8 text-center font-medium tabular-nums">{people}</span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="+"
              disabled={people >= maxPeople}
              onClick={() => setPeople((p) => p + 1)}
            >
              <PlusIcon />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">
            {t("maxPeople", { count: maxPeople })}
          </span>
        </div>
        <div className="text-right">
          {slot && (
            <p className="text-xs text-muted-foreground">
              {t("perPerson", { price: formatPrice(slot.priceCents, locale) })}
            </p>
          )}
          <p className="text-xl font-bold tabular-nums">
            {formatPrice(total, locale)}
          </p>
        </div>
      </div>

      <Button size="lg" className="mt-4 w-full" onClick={handleBook}>
        <TicketIcon />
        {t("cta")}
      </Button>
    </div>
  );
}

/** Branded cover: admin photos when present, gradient + icon otherwise. */
export function OfferCover({
  offer,
  className,
  icon,
}: {
  offer: CatalogOffer;
  className?: string;
  icon: React.ReactNode;
}) {
  if (offer.images.length > 0) {
    return (
      <div className={`overflow-hidden rounded-xl border bg-muted ${className ?? ""}`}>
        <Image
          src={offer.images[0]}
          alt={offer.title.en}
          width={1200}
          height={800}
          sizes="(min-width: 768px) 45vw, 90vw"
          className="aspect-[3/2] w-full object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br from-[#056ea8]/15 via-muted to-primary/10 ${className ?? ""}`}
    >
      <span className="flex size-16 items-center justify-center rounded-2xl bg-card/70 text-primary shadow-sm">
        {icon}
      </span>
    </div>
  );
}
