import { setRequestLocale } from "next-intl/server";

import { HeroSection } from "@/components/home/HeroSection";
import { DirectionsSection } from "@/components/home/DirectionsSection";
import { PartnerSection } from "@/components/home/PartnerSection";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  setRequestLocale(lang);

  return (
    <>
      <HeroSection />
      <DirectionsSection />
      <PartnerSection />
    </>
  );
}
