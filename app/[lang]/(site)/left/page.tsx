import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LeftRedirect } from "@/components/layout/LeftRedirect";

/** Посредник внешних ссылок: отсчёт и переход (или экран блокировки). */
export async function generateMetadata(
  props: PageProps<"/[lang]/left">,
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "left" });
  return { title: t("metaTitle"), robots: { index: false } };
}

export default async function LeftPage({
  params,
}: PageProps<"/[lang]/left">) {
  const { lang } = await params;
  setRequestLocale(lang);

  return (
    <section className="mx-auto grid min-h-[60vh] w-full max-w-6xl content-center px-4 py-16">
      <Suspense fallback={null}>
        <LeftRedirect />
      </Suspense>
    </section>
  );
}
