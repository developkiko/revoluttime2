import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

import { OfferDetail } from "@/components/sections/OfferDetail";
import { getOffer, offersBySection } from "@/lib/catalog";
import type { Locale } from "@/lib/products";

export function generateStaticParams() {
  return offersBySection("sport").map((slug) => ({ slug: slug.slug }));
}

export async function generateMetadata(
  props: PageProps<"/[lang]/sport/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const offer = getOffer(slug);
  const locale = (await getLocale()) as Locale;
  return offer?.section === "sport"
    ? { title: offer.title[locale], description: offer.summary[locale] }
    : {};
}

export default async function SportOfferPage(
  props: PageProps<"/[lang]/sport/[slug]">
) {
  const { lang, slug } = await props.params;
  return <OfferDetail section="sport" slug={slug} lang={lang} />;
}
