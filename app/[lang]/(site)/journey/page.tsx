import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CompassIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { JourneyQuizLazy } from "@/components/journey/JourneyQuizLazy";

export async function generateMetadata(
  props: PageProps<"/[lang]/journey">,
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "journey.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function JourneyPage({
  params,
}: PageProps<"/[lang]/journey">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("journey");

  return (
    <>
      <section className="relative overflow-hidden border-b bg-muted/40">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] size-[28rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div className="mx-auto w-full max-w-6xl px-4 py-14 text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <CompassIcon className="size-3.5 text-primary" />
            {t("badge")}
          </p>
          <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <JourneyQuizLazy />
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 text-center">
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t("encyclopediaHint")}
          </p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/encyclopedia">{t("encyclopediaLink")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
