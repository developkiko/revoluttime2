import type { Metadata } from "next";
import { BikeIcon } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { OffersGrid } from "@/components/sections/SectionOffers";
import { offersBySection } from "@/lib/catalog";

export async function generateMetadata(
  props: PageProps<"/[lang]/tourism">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "tourism.hero" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function TourismPage({
  params,
}: PageProps<"/[lang]/tourism">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("tourism.hero");

  return (
    <>
      <section className="border-b bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <OffersGrid offers={offersBySection("tourism")} icon={BikeIcon} />
      </section>
    </>
  );
}
