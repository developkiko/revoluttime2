"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  CalendarDaysIcon,
  ClockIcon,
  HourglassIcon,
  MapPinIcon,
  TicketIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { offerHref, type CatalogOffer } from "@/lib/catalog";
import type { Locale } from "@/lib/products";

/**
 * Товарные карточки бронирования (порт со старого дамми: .week/.day +
 * .slot-card) — для предложений с датами (бадминтон, термы, походы):
 * лента ближайших дат с точками занятости и карточка слота на каждое
 * предложение с ближайшей датой, вместимостью и CTA. CSS в port.css.
 * Клиентский: «сегодня» считается на клиенте — пререндер (cacheComponents)
 * запрещает доступ к текущему времени на сервере.
 */
export function OfferSlots({ offers }: { offers: CatalogOffer[] }) {
  const t = useTranslations("section");
  const ts = useTranslations("recreation.slots");
  const locale = useLocale() as Locale;

  const bookable = offers.filter((offer) => !offer.comingSoon && offer.slots.length > 0);

  // Лента ближайших дат: до 7 уникальных дат всех предложений, начиная с today
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const todayKey = now.toDateString();
  const dateMap = new Map<string, number>(); // iso → свободно мест суммарно
  for (const offer of bookable) {
    for (const slot of offer.slots) {
      if (slot.date < todayIso) continue;
      dateMap.set(slot.date, (dateMap.get(slot.date) ?? 0) + slot.maxPeople);
    }
  }
  const week = [...dateMap.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(0, 7);
  const dowFmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const numFmt = new Intl.DateTimeFormat(locale, { day: "numeric" });
  const dateFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", weekday: "long" });
  const firstBusyIso = week.find(([, free]) => free > 0)?.[0];

  return (
    <div>
      {week.length > 0 && (
        <div className="week" aria-label={ts("weekLabel")}>
          {week.map(([iso, free]) => {
            const date = new Date(`${iso}T00:00:00`);
            const isToday = date.toDateString() === todayKey;
            const isFirst = iso === firstBusyIso;
            const cls = isFirst
              ? "day day--on"
              : isToday
                ? "day day--today day--busy"
                : "day day--idle day--busy";
            return (
              <div key={iso} className={cls}>
                <span className="day-dow">{dowFmt.format(date)}</span>
                <span className="day-num">{numFmt.format(date)}</span>
                <span className="day-dot" />
              </div>
            );
          })}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {offers.map((offer) => {
          const openSlots = offer.slots.length;
          const nextSlot = bookable.includes(offer)
            ? offer.slots.filter((s) => s.date >= todayIso).sort((a, b) => a.date.localeCompare(b.date))[0]
            : undefined;
          const freePlaces = nextSlot?.maxPeople ?? 0;
          return (
            <div key={offer.slug} className="slot-card" data-tilt>
              <h3 className="slot-name">{offer.title[locale]}</h3>
              <span className="slot-addr">
                <MapPinIcon aria-hidden="true" />
                {offer.summary[locale]}
                </span>
              {nextSlot ? (
                <>
                  <p className="slot-time">
                    <ClockIcon aria-hidden="true" />
                    {ts("nextDate", { date: dateFmt.format(new Date(`${nextSlot.date}T00:00:00`)) })}
                  </p>
                  <p className="slot-cap">
                    {ts("capacity", { count: freePlaces })} ·{" "}
                    {ts("datesCount", { count: openSlots })}
                  </p>
                  <div className="slot-buy flex items-center justify-between gap-3">
                    <Link
                      href={offerHref(offer)}
                      className="inline-flex items-center gap-1.5 justify-center rounded-[10px] bg-[var(--primary)] py-2.5 px-5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary-hover)] whitespace-nowrap"
                    >
                      <TicketIcon className="size-4" aria-hidden="true" />
                      {ts("book")}
                    </Link>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDaysIcon className="size-3.5" aria-hidden="true" />
                      {t("datesAvailable", { count: openSlots })}
                    </span>
                  </div>
                </>
              ) : (
                <p className="slot-cap inline-flex items-center gap-1.5">
                  <HourglassIcon className="size-3.5" aria-hidden="true" />
                  {t("comingSoon")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
