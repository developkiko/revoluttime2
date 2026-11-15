import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CheckoutView } from "@/components/checkout/CheckoutView";

export async function generateMetadata(
  props: PageProps<"/[lang]/checkout">,
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "checkout" });
  return {
    title: t("title"),
    robots: { index: false },
  };
}

export default async function CheckoutPage({
  params,
}: PageProps<"/[lang]/checkout">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("checkout");

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
      <div className="mt-8">
        <CheckoutView />
      </div>
    </section>
  );
}
