import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LegalArticle } from "@/components/legal/LegalArticle";

const LEGAL_SLUGS = ["impressum", "datenschutz", "agb", "widerruf"] as const;
type LegalSlug = (typeof LEGAL_SLUGS)[number];

function isLegalSlug(slug: string): slug is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(slug);
}

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/[lang]/legal/[slug]">
): Promise<Metadata> {
  const { lang, slug } = await props.params;
  if (!isLegalSlug(slug)) return {};
  const t = await getTranslations({
    locale: lang,
    namespace: `legal.${slug}`,
  });
  return { title: t("title") };
}

export default async function LegalPage(
  props: PageProps<"/[lang]/legal/[slug]">
) {
  const { lang, slug } = await props.params;
  if (!isLegalSlug(slug)) {
    notFound();
  }
  setRequestLocale(lang);
  return <LegalArticle slug={slug} />;
}
