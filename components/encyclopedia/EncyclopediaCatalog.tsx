"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { BookOpenIcon, SearchIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import {
  ARTICLE_CATEGORIES,
  ENCYCLOPEDIA_ARTICLES,
  type ArticleCategory,
} from "@/lib/encyclopedia";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EvidenceBadge } from "@/components/encyclopedia/EvidenceBadge";

export function EncyclopediaCatalog() {
  const t = useTranslations("encyclopedia");
  const locale = useLocale() as "de" | "ru" | "en";
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<ArticleCategory | "all">("all");

  const articles = ENCYCLOPEDIA_ARTICLES.filter((article) => {
    const inCategory = category === "all" || article.category === category;
    const q = query.trim().toLowerCase();
    const inQuery =
      q === "" ||
      article.title[locale].toLowerCase().includes(q) ||
      article.summary[locale].toLowerCase().includes(q);
    return inCategory && inQuery;
  });

  return (
    <div>
      {/* Search + category filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            aria-label={t("searchPlaceholder")}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              category === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("categories.all")}
          </button>
          {ARTICLE_CATEGORIES.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                category === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(`categories.${key}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Article grid */}
      {articles.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          {t("noResults")}
        </p>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <Card key={article.slug} className="flex flex-col">
              <CardHeader className="gap-2">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <BookOpenIcon className="size-3 text-primary" />
                  {t(`categories.${article.category}`)}
                </span>
                <h3 className="text-lg font-semibold leading-snug">
                  {article.title[locale]}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {article.summary[locale]}
                </p>
              </CardHeader>
              <CardContent className="mt-auto flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {article.claims.slice(0, 2).map((claim) => (
                    <EvidenceBadge key={claim.id} status={claim.status} />
                  ))}
                </div>
                <Link
                  href={`/encyclopedia/${article.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t("readMore")} →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
