import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  CalendarClockIcon,
  DumbbellIcon,
  FlameIcon,
  LanguagesIcon,
  LightbulbIcon,
  MapPinIcon,
  WindIcon,
  WavesIcon,
  ZapIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { CtaBanner } from "@/components/layout/CtaBanner";
import { SITE } from "@/lib/products";

const SERVICES = [
  { key: "breathing", icon: WindIcon },
  { key: "redlight", icon: LightbulbIcon },
  { key: "nano", icon: ZapIcon },
  { key: "vibration", icon: WavesIcon },
  { key: "strength", icon: DumbbellIcon },
  { key: "recovery", icon: FlameIcon },
] as const;

const INFO_ITEMS = [
  { key: "booking", icon: CalendarClockIcon },
  { key: "languages", icon: LanguagesIcon },
  { key: "location", icon: MapPinIcon },
] as const;

export async function generateMetadata(
  props: PageProps<"/[lang]/studio">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "meta.studio" });
  return { title: t("title"), description: t("description") };
}

export default async function StudioPage({
  params,
}: PageProps<"/[lang]/studio">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("studio");

  return (
    <>
      <section className="relative overflow-hidden bg-muted/40">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.15]"
          style={{ backgroundImage: "url('/images/wall/studio-bg-1.jpg')" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-[-10%] size-[32rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <p className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {t("hero.badge")}
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {t("hero.title")}{" "}
            <span className="text-primary">{t("hero.titleAccent")}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("hero.subtitle")}
          </p>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("servicesTitle")}
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            {t("servicesSubtitle")}
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ key, icon: Icon }) => (
              <Card key={key}>
                <CardContent className="flex flex-col gap-3 p-6">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-lg font-semibold">
                    {t(`services.${key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`services.${key}.text`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border bg-card p-6">
            <h3 className="font-semibold">{t("info.title")}</h3>
            <ul className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              {INFO_ITEMS.map(({ key, icon: Icon }) => (
                <li key={key} className="flex items-start gap-2">
                  <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  {t(`info.${key}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBanner
        title={t("cta.title")}
        text={t("cta.text")}
        buttonLabel={t("cta.button")}
        href={SITE.whatsapp}
        external
      />
    </>
  );
}
