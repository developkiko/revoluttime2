import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRightIcon,
  BeakerIcon,
  ClockIcon,
  FlaskConicalIcon,
  PillIcon,
  VideoIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CtaBanner } from "@/components/layout/CtaBanner";
import { WikiLink } from "@/components/encyclopedia/WikiLink";

const COMPOSITION = [
  { key: "magnesium", value: "57–66,7 mg", icon: PillIcon },
  { key: "citricAcid", value: "133 mg", icon: FlaskConicalIcon },
  { key: "malicAcid", value: "133 mg", icon: FlaskConicalIcon },
  { key: "cellulose", value: "66,7 mg", icon: BeakerIcon },
] as const;

const ABSORPTION = [
  { key: "dissolve", icon: ClockIcon },
  { key: "peak", icon: FlaskConicalIcon },
  { key: "drinkNow", icon: BeakerIcon },
] as const;

const COMPARISON = [
  { key: "oxide", form: "MgO", ours: false },
  { key: "citrate", form: "Mg-Citrat", ours: false },
  { key: "ours", form: "Mg + H₂", ours: true },
] as const;

export async function generateMetadata(
  props: PageProps<"/[lang]/hydrogen/tablets">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({
    locale: lang,
    namespace: "tablets.meta",
  });
  return { title: t("title"), description: t("description") };
}

export default async function TabletsPage({
  params,
}: PageProps<"/[lang]/hydrogen/tablets">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("tablets");

  return (
    <>
      <section className="relative overflow-hidden border-b bg-muted/40">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] size-[28rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              {t("badge")}
            </p>
            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
              {t.rich("subtitle", {
                mg: (chunks) => (
                  <WikiLink slug="magnesium-intake-basics">{chunks}</WikiLink>
                ),
              })}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/shop">
                  {t("heroCta")}
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="#footnotes">{t("footnoteLink")}</a>
              </Button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-sm">
            <div className="overflow-hidden rounded-3xl border bg-card shadow-lg">
              <Image
                src="/imgs/product/tabs-90.jpg"
                alt={t("title")}
                width={959}
                height={1280}
                priority
                sizes="(min-width: 1024px) 24rem, 90vw"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <PillIcon className="size-5 text-primary" />
          {t("composition.title")}
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {t("composition.subtitle")}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COMPOSITION.map(({ key, value, icon: Icon }) => (
            <Card key={key}>
              <CardContent className="p-5">
                <Icon className="size-5 text-primary" />
                <p className="mt-3 text-xl font-bold tabular-nums">{value}</p>
                <p className="text-sm text-muted-foreground">
                  {t(`composition.items.${key}`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {t("composition.perTablet")}
        </p>
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <ClockIcon className="size-5 text-primary" />
            {t("absorption.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t("absorption.subtitle")}
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {ABSORPTION.map(({ key, icon: Icon }, index) => (
              <Card key={key}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {index + 1}/3
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold">
                    {t(`absorption.items.${key}.title`)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t(`absorption.items.${key}.text`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <VideoIcon className="size-5 text-primary" />
          {t("demo.title")}
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {t("demo.subtitle")}
        </p>
        <div className="mx-auto mt-6 w-full max-w-sm">
          <div className="overflow-hidden rounded-3xl border bg-card shadow-lg">
            <video
              src="/videos/tbltv1.mp4"
              className="aspect-[9/16] w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              aria-label={t("demo.title")}
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {t("demo.caption")}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold tracking-tight">
          {t("comparison.title")}
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {t("comparison.subtitle")}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {COMPARISON.map(({ key, form, ours }) => (
            <Card
              key={key}
              className={ours ? "border-primary/50 shadow-md" : undefined}
            >
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {form}
                </p>
                <h3 className="mt-2 font-semibold">
                  {t(`comparison.items.${key}.title`)}
                  {ours && <span className="ml-1 text-primary">✓</span>}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t(`comparison.items.${key}.text`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold tracking-tight">
            {t("feel.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t("feel.subtitle")}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            {t.raw("feel.items").map((item: string, index: number) => (
              <p
                key={index}
                className="rounded-2xl border bg-card px-5 py-4 leading-relaxed text-muted-foreground"
              >
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

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
