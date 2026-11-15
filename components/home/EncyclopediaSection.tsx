import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRightIcon, BookOpenIcon, FileTextIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ENCYCLOPEDIA_ARTICLES } from "@/lib/encyclopedia";
import type { Locale } from "@/lib/products";

/** Editorial picks — one per main topic area. */
const FEATURED_SLUGS = [
  "molecular-hydrogen-basics",
  "h2-exercise-recovery",
  "magnesium-intake-basics",
] as const;

export async function EncyclopediaSection() {
  const t = await getTranslations("home.encyclopedia");
  const locale = (await getLocale()) as Locale;

  const featured = FEATURED_SLUGS.map((slug) =>
    ENCYCLOPEDIA_ARTICLES.find((article) => article.slug === slug),
  ).filter((article): article is (typeof ENCYCLOPEDIA_ARTICLES)[number] =>
    Boolean(article),
  );

  return (
    <section className="border-y bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="flex flex-col items-center gap-4">
          <p className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <BookOpenIcon className="size-3.5 text-primary" />
            {t("badge")}
          </p>
          <h2 className="text-[1.5rem] font-bold tracking-tight text-foreground sm:text-[2rem] text-center">
            {t("title")}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground sm:text-base max-w-[600px] mx-auto">{t("subtitle")}</p>
          <Button
            asChild
            variant="outline"
            className="rounded-[10px] border-primary/25 bg-primary/12 px-8 py-[0.7rem] text-primary hover:bg-primary/20"
          >
            <Link href="/encyclopedia">
              {t("cta")}
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
          {featured.map((article) => (
            <Card key={article.slug} className="group transition-shadow hover:shadow-md">
              <CardContent className="flex h-full flex-col gap-2 p-5">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <FileTextIcon className="size-3.5 text-primary" />
                  {t(`categories.${article.category}`)}
                </p>
                <h3 className="font-semibold leading-snug">
                  {article.title[locale] ?? article.title.de}
                </h3>
                <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {article.summary[locale] ?? article.summary.de}
                </p>
                <Link
                  href={`/encyclopedia/${article.slug}`}
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t("readMore")}
                  <ArrowRightIcon className="size-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
