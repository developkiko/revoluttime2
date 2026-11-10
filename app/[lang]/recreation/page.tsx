import type { Metadata } from "next";
import { BikeIcon } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { OffersGrid } from "@/components/sections/SectionOffers";
import {
  offersBySection,
  type SectionKey,
} from "@/lib/catalog";

/** All actively sports recreation offers: sport, nature recovery, tourism. */
const RECREATION_SECTIONS: SectionKey[] = ["sport", "recreation", "tourism"];

export async function generateMetadata(
  props: PageProps<"/[lang]/recreation">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "recreation.hero" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function RecreationPage({
  params,
}: PageProps<"/[lang]/recreation">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("recreation.hero");

  const offers = RECREATION_SECTIONS.flatMap((section) =>
    offersBySection(section)
  );

  return (
    <>
      <section className="relative overflow-hidden border-b bg-muted/40">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.12]"
          style={{ backgroundImage: "url('/images/wall/recreation-bg-1.jpg')" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background"
        />
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <OffersGrid offers={offers} icon={BikeIcon} />
      </section>
    </>
  );
}
