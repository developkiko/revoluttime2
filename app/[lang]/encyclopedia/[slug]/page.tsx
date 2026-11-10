import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShieldAlertIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { EvidenceBadge } from "@/components/encyclopedia/EvidenceBadge";
import { ResearchCard } from "@/components/encyclopedia/ResearchCard";
import { ENCYCLOPEDIA_ARTICLES, getResearch } from "@/lib/encyclopedia";
import { loadArticle } from "@/lib/encyclopedia-db";
import type { Locale } from "@/lib/products";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return ENCYCLOPEDIA_ARTICLES.map((article) => ({ slug: article.slug }));
}

type Props = PageProps<"/[lang]/encyclopedia/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const article = await loadArticle(lang as Locale, slug);
  if (!article) notFound();
  return {
    title: article.title[lang as "de"],
    description: article.summary[lang as "de"],
  };
}

export default async function EncyclopediaArticlePage({ params }: Props) {
  const { lang, slug } = await params;
  setRequestLocale(lang);
  const locale = lang as "de" | "ru" | "en";
  const article = await loadArticle(locale, slug);
  if (!article) notFound();

  const t = await getTranslations("encyclopedia");

  return (
    <>
      <section className="bg-muted/40">
        <div className="mx-auto w-full max-w-3xl px-4 py-14">
          <Link
            href="/encyclopedia"
            className="text-sm text-primary hover:underline"
          >
            ← {t("title")}
          </Link>
          <p className="mt-5 inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {t(`categories.${article.category}`)}
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {article.title[locale]}
          </h1>
          <p className="mt-3 text-muted-foreground">{article.summary[locale]}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            {t("meta.author")}: {article.author} ·{" "}
            {t("meta.lastReviewed")}: {article.lastReviewed}
            {article.reviewer ? ` · ${t("meta.reviewer")}: ${article.reviewer}` : ""}
          </p>
        </div>
      </section>

      <article className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="space-y-5">
          {article.body[locale].map((paragraph, index) => (
            <p key={index} className="leading-relaxed text-foreground/90">
              {paragraph}
            </p>
          ))}
        </div>

        <h2 className="mt-12 text-xl font-bold tracking-tight">
          {t("claimsTitle")}
        </h2>
        <div className="mt-5 space-y-6">
          {article.claims.map((claim) => (
            <div key={claim.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <EvidenceBadge status={claim.status} />
                <p className="text-sm font-semibold">{claim.text[locale]}</p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {claim.researchIds.map((id) => (
                  <ResearchCard key={id} paper={getResearch(id)} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* HWG / medical disclaimer */}
        <div className="mt-12 rounded-xl border border-amber-500/40 bg-amber-500/10 p-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <ShieldAlertIcon className="size-4 text-amber-600 dark:text-amber-400" />
            {t("hwgTitle")}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t("hwgText")}
          </p>
        </div>
      </article>
    </>
  );
}
