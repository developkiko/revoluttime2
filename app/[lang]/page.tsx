import { setRequestLocale } from "next-intl/server";

import { HeroSection } from "@/components/home/HeroSection";
import { DirectionsSection } from "@/components/home/DirectionsSection";
import { ProductTeaser } from "@/components/home/ProductTeaser";
import { PartnerTeaser } from "@/components/home/PartnerTeaser";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  setRequestLocale(lang);

  return (
    <>
      <HeroSection />
      <DirectionsSection />
      <ProductTeaser />
      <PartnerTeaser />
    </>
  );
}
