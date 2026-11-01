import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AtomIcon, DropletsIcon, HeartPulseIcon, SparklesIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UsageSection } from "@/components/home/UsageSection";
import { CtaBanner } from "@/components/layout/CtaBanner";

const SCIENCE_CARDS = [
  { key: "antioxidant", icon: AtomIcon, asterisk: true },
  { key: "heart", icon: HeartPulseIcon, asterisk: true },
  { key: "blood", icon: DropletsIcon, asterisk: true },
  { key: "magnesium", icon: SparklesIcon, asterisk: false },
] as const;

export async function generateMetadata(
  props: PageProps<"/[lang]/hydrogen">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "meta.hydrogen" });
  return { title: t("title"), description: t("description") };
}

export default async function HydrogenPage({
  params,
}: PageProps<"/[lang]/hydrogen">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("hydrogen");

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] size-[32rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-6">
            <p className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <DropletsIcon className="size-3.5 text-primary" />
              {t("hero.badge")}
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {t("hero.title")}{" "}
              <span className="text-primary">{t("hero.titleAccent")}</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/shop">{t("hero.ctaShop")}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#usage">{t("hero.ctaUsage")}</a>
              </Button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-3xl border bg-card shadow-lg">
              <Image
                src="/imgs/product/tabs-90.jpg"
                alt={t("hero.title")}
                width={959}
                height={1280}
                priority
                sizes="(min-width: 1024px) 28rem, 90vw"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("science.title")}
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            {t("science.subtitle")}
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {SCIENCE_CARDS.map(({ key, icon: Icon, asterisk }) => (
              <Card key={key}>
                <CardContent className="flex flex-col gap-3 p-6">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-lg font-semibold">
                    {t(`science.cards.${key}.title`)}
                    {asterisk && (
                      <a
                        href="#footnotes"
                        aria-label={t("footnotes.title")}
                        className="align-super text-sm text-primary underline-offset-4 hover:underline"
                      >
                        *
                      </a>
                    )}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`science.cards.${key}.text`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <UsageSection />

      <CtaBanner
        title={t("cta.title")}
        text={t("cta.text")}
        buttonLabel={t("cta.button")}
        href="/shop"
      />

      <section id="footnotes" className="scroll-mt-16 border-t bg-muted/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("footnotes.title")}
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-xs leading-relaxed text-muted-foreground">
            {t.raw("footnotes.items").map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
