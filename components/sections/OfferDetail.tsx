import { ArrowLeftIcon, CalendarDaysIcon, UsersIcon } from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { BookingWidget, OfferCover } from "@/components/booking/BookingWidget";
import { SECTION_META, getOffer, offersBySection, type SectionKey } from "@/lib/catalog";
import { offerHref } from "@/components/sections/SectionOffers";
import type { Locale } from "@/lib/products";

interface OfferDetailProps {
  section: SectionKey;
  slug: string;
  lang: string;
}

export async function OfferDetail({ section, slug, lang }: OfferDetailProps) {
  setRequestLocale(lang);
  const t = await getTranslations("section");
  const locale = (await getLocale()) as Locale;
  const offer = getOffer(slug);

  if (!offer || offer.section !== section) {
    return null;
  }

  const others = offersBySection(section).filter((o) => o.slug !== slug);

  return (
    <>
      <section className="border-b bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <Button variant="ghost" size="sm" className="-ml-2 mb-4" asChild>
            <Link href={SECTION_META[section].href}>
              <ArrowLeftIcon data-icon="inline-start" />
              {t("backToSection")}
            </Link>
          </Button>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            {offer.title[locale]}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {offer.summary[locale]}
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-6">
          <OfferCover
            offer={offer}
            className="aspect-[16/10] [&>img]:aspect-[16/10]"
            icon={<CalendarDaysIcon className="size-8" />}
          />
          <div className="flex flex-col gap-4">
            {offer.description[locale]
              .split("\n\n")
              .map((paragraph, index) => (
                <p key={index} className="leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {offer.slots.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground">
                <CalendarDaysIcon className="size-3.5" />
                {t("datesAvailable", { count: offer.slots.length })}
              </span>
            )}
            {offer.slots[0] && (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground">
                <UsersIcon className="size-3.5" />
                {t("maxPeoplePerDate", { count: Math.max(...offer.slots.map((s) => s.maxPeople)) })}
              </span>
            )}
          </div>
        </div>

        <div className="self-start lg:sticky lg:top-20">
          <BookingWidget offer={offer} />
        </div>
      </section>

      {others.length > 0 && (
        <section className="border-t bg-muted/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-12">
            <h2 className="text-xl font-bold tracking-tight">{t("alsoInSection")}</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {others.map((other) => (
                <Button key={other.slug} variant="outline" asChild>
                  <Link href={offerHref(other)}>{other.title[locale]}</Link>
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
