import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeCheckIcon, PackageIcon, TruckIcon } from "lucide-react";

import { ProductVariants } from "@/components/shop/ProductVariants";
import { UsageSection } from "@/components/home/UsageSection";

const PERKS = [
  { key: "perk1", icon: BadgeCheckIcon },
  { key: "perk2", icon: PackageIcon },
  { key: "perk3", icon: TruckIcon },
] as const;

export async function generateMetadata(
  props: PageProps<"/[lang]/shop">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "meta.shop" });
  return { title: t("title"), description: t("description") };
}

export default async function ShopPage({
  params,
}: PageProps<"/[lang]/shop">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("shop.hero");

  return (
    <>
      <section className="border-b bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t("subtitle")}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {PERKS.map(({ key, icon: Icon }) => (
              <li
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                <Icon className="size-3.5 text-primary" />
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ProductVariants />
      <UsageSection />
    </>
  );
}
