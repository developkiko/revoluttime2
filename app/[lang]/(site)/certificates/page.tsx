import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  BadgeCheckIcon,
  FlaskConicalIcon,
  FileTextIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function generateMetadata(
  props: PageProps<"/[lang]/certificates">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "meta.certificates" });
  return { title: t("title"), description: t("description") };
}

/**
 * Certificates & lab analyses — the target of the clickable "Проверено
 * Eurofins" badges (owner request, 21.11.2026: badge click must lead to the
 * analysis results; certificates are added as they are issued).
 */
export default async function CertificatesPage({
  params,
}: PageProps<"/[lang]/certificates">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("certificates");

  return (
    <>
      <section className="border-b bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Eurofins analysis — the verified fact behind the badges */}
          <article className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <FlaskConicalIcon className="size-5 text-primary" />
              </span>
              <h2 className="text-lg font-semibold leading-snug">
                {t("eurofinsTitle")}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("eurofinsText")}
            </p>
            <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
              <BadgeCheckIcon className="size-3.5" />
              {t("reportId")}
            </p>
            <Button asChild className="mt-auto w-fit">
              <Link href="/#contact">
                <FileTextIcon className="size-4" />
                {t("request")}
              </Link>
            </Button>
          </article>

          {/* Certificates of conformity — placeholder until issued docs arrive */}
          <article className="flex flex-col gap-4 rounded-2xl border border-dashed bg-card/60 p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-muted">
                <ShieldCheckIcon className="size-5 text-muted-foreground" />
              </span>
              <h2 className="text-lg font-semibold leading-snug">
                {t("soonTitle")}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("soonText")}
            </p>
          </article>
        </div>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← {t("back")}
          </Link>
        </div>
      </section>
    </>
  );
}
