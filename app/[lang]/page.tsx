import { setRequestLocale } from "next-intl/server";

import { HeroSection } from "@/components/home/HeroSection";
import { ProductVariants } from "@/components/home/ProductVariants";
import { UsageSection } from "@/components/home/UsageSection";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  setRequestLocale(lang);

  return (
    <>
      <HeroSection />
      <ProductVariants />
      <UsageSection />
    </>
  );
}
