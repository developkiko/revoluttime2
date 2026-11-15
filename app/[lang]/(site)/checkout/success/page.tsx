import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CheckoutSuccess } from "@/components/checkout/CheckoutSuccess";

export async function generateMetadata(
  props: PageProps<"/[lang]/checkout/success">,
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "checkout" });
  return {
    title: t("successTitle"),
    robots: { index: false },
  };
}

export default async function CheckoutSuccessPage({
  params,
}: PageProps<"/[lang]/checkout/success">) {
  const { lang } = await params;
  setRequestLocale(lang);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      <Suspense>
        <CheckoutSuccess />
      </Suspense>
    </section>
  );
}
