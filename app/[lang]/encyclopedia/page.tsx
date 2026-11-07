import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { EncyclopediaCatalog } from "@/components/encyclopedia/EncyclopediaCatalog";

export async function generateMetadata(
  props: PageProps<"/[lang]/encyclopedia">,
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "encyclopedia" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function EncyclopediaPage({
  params,
}: PageProps<"/[lang]/encyclopedia">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("encyclopedia");

  return (
    <>
      <section className="bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <p className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {t("badge")}
          </p>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <EncyclopediaCatalog />
      </section>
    </>
  );
}
