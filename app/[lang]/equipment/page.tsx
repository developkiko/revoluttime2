import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRightIcon,
  GlassWaterIcon,
  MailIcon,
  WrenchIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactWidget } from "@/components/contact/ContactWidget";
import { CtaBanner } from "@/components/layout/CtaBanner";
import { offersBySection } from "@/lib/catalog";

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
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <Card key={item.slug} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <GlassWaterIcon className="size-5" />
                </span>
                <h2 className="text-lg font-semibold">{item.title.ru}</h2>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {item.summary.ru}
                </p>
                <p className="mt-auto inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {t("onRequest")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

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
