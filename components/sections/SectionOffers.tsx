import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  HourglassIcon,
  type LucideIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { SECTION_META, type CatalogOffer } from "@/lib/catalog";
import type { Locale } from "@/lib/products";

export function offerHref(offer: CatalogOffer): string {
  return `${SECTION_META[offer.section].href}/${offer.slug}`;
}

/** Grid of the section's bookable offers (admin-managed rows later). */
export async function OffersGrid({
  offers,
  icon: Icon,
}: {
  offers: CatalogOffer[];
  icon: LucideIcon;
}) {
  const t = await getTranslations("section");
  const locale = (await getLocale()) as Locale;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {offers.map((offer) => {
        const openSlots = offer.slots.length;
        return (
          <Card key={offer.slug} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col gap-4 p-6">
              {offer.images[0] ? (
                <div className="overflow-hidden rounded-xl border bg-muted">
                  <Image
                    src={offer.images[0]}
                    alt={offer.title[locale]}
                    width={1200}
                    height={800}
                    sizes="(min-width: 768px) 40vw, 90vw"
                    className="aspect-[3/2] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-[3/1] items-center justify-center rounded-xl border bg-gradient-to-br from-[#056ea8]/15 via-muted to-primary/10">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-card/70 text-primary shadow-sm">
                    <Icon className="size-7" />
                  </span>
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-xl font-semibold">{offer.title[locale]}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {offer.summary[locale]}
                </p>
              </div>

              <div className="flex items-center justify-between">
                {offer.comingSoon || openSlots === 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground">
                    <HourglassIcon className="size-3.5" />
                    {t("comingSoon")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground">
                    <CalendarDaysIcon className="size-3.5" />
                    {t("datesAvailable", { count: openSlots })}
                  </span>
                )}
                <Link
                  href={offerHref(offer)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t("openOffer")}
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
