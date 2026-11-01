import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

import { OfferDetail } from "@/components/sections/OfferDetail";
import { getOffer, offersBySection } from "@/lib/catalog";
import type { Locale } from "@/lib/products";

export function generateStaticParams() {
  return offersBySection("recreation").map((slug) => ({ slug: slug.slug }));
}

export async function generateMetadata(
  props: PageProps<"/[lang]/recreation/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const offer = getOffer(slug);
  const locale = (await getLocale()) as Locale;
  return offer?.section === "recreation"
    ? { title: offer.title[locale], description: offer.summary[locale] }
    : {};
}

export default async function RecreationOfferPage(
  props: PageProps<"/[lang]/recreation/[slug]">
) {
  const { lang, slug } = await props.params;
  return <OfferDetail section="recreation" slug={slug} lang={lang} />;
}
