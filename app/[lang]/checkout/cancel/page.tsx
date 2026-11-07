import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Undo2Icon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function generateMetadata(
  props: PageProps<"/[lang]/checkout/cancel">,
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "checkout" });
  return {
    title: t("cancelTitle"),
    robots: { index: false },
  };
}

export default async function CheckoutCancelPage({
  params,
}: PageProps<"/[lang]/checkout/cancel">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("checkout");

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mx-auto max-w-xl rounded-xl border bg-card p-8 text-center">
        <Undo2Icon className="mx-auto size-10 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-bold">{t("cancelTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("cancelText")}</p>
        <Button asChild className="mt-6">
          <Link href="/checkout">{t("backToCart")}</Link>
        </Button>
      </div>
    </section>
  );
}
