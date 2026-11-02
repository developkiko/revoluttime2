import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRightIcon,
  CheckIcon,
  MailIcon,
  WrenchIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactWidget } from "@/components/contact/ContactWidget";
import { CtaBanner } from "@/components/layout/CtaBanner";
import { offersBySection } from "@/lib/catalog";

const STARTER_ITEMS = [
  { key: "ems" },
  { key: "redLight" },
  { key: "inhaler" },
  { key: "ownTablets" },
] as const;

const STARTER_TAGS = [
  "Recovery",
  "Longevity",
  "Biohacking",
  "Anti-Aging",
  "Performance",
] as const;

export async function generateMetadata(
  props: PageProps<"/[lang]/equipment">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "equipment.hero" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function EquipmentPage({
  params,
}: PageProps<"/[lang]/equipment">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("equipment");

  const items = offersBySection("equipment");

  return (
    <>
      <section className="border-b bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
          <ul className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {items.map((item) => (
              <li
                key={item.slug}
                className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5"
              >
                <WrenchIcon className="size-3.5 text-primary" />
                {item.title.ru}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.slug} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <WrenchIcon className="size-5" />
                </span>
                <h2 className="text-lg font-semibold">{item.title.ru}</h2>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {item.summary.ru}
                </p>
                {item.suppliers && item.suppliers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.suppliers.map((supplier) => (
                      <a
                        key={supplier.url}
                        href={supplier.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        {supplier.name}
                        <ArrowUpRightIcon className="size-3" />
                      </a>
                    ))}
                  </div>
                )}
                <p className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {t("onRequest")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Minimal studio starter */}
        <section className="mt-12 rounded-3xl border bg-card p-6 md:p-8">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            {t("starter.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t("starter.subtitle")}
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {STARTER_ITEMS.map(({ key }, index) => (
              <li
                key={key}
                className="flex items-start gap-3 rounded-xl border bg-background p-4"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <CheckIcon className="size-4" />
                </span>
                <p className="text-sm font-medium">{t(`starter.items.${key}`)}</p>
                <span className="ml-auto text-xs font-bold tabular-nums text-muted-foreground">
                  {index + 1}/4
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {STARTER_TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gradient-to-r from-[#056ea8]/15 to-primary/10 px-3 py-1 text-xs font-semibold text-foreground"
              >
                ✓ {tag}
              </span>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            {t("starter.area")}
          </p>
        </section>

        {/* OEM tablets block */}
        <section className="mt-10 grid gap-6 rounded-3xl border bg-muted/40 p-6 md:grid-cols-[1.2fr_1fr] md:p-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {t("oem.title")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("oem.text")}
            </p>
            <Button className="mt-4" asChild>
              <a href="#contact">
                {t("oem.cta")}
                <ArrowRightIcon data-icon="inline-end" />
              </a>
            </Button>
          </div>
          <div className="flex items-center justify-center rounded-2xl border bg-background p-6 text-center">
            <p className="text-4xl font-black tracking-tight text-primary">
              OEM
            </p>
          </div>
        </section>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6">
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {t("consultNote")}
          </p>
          <Button asChild>
            <a href="#contact">
              {t("consultCta")}
              <ArrowRightIcon data-icon="inline-end" />
            </a>
          </Button>
        </div>
      </section>

      <section id="contact" className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 pb-12">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold tracking-tight">
          <MailIcon className="size-5 text-primary" />
          {t("formTitle")}
        </h2>
        <ContactWidget />
      </section>

      <CtaBanner
        title={t("cta.title")}
        text={t("cta.text")}
        buttonLabel={t("cta.button")}
        href="/partner"
      />
    </>
  );
}
