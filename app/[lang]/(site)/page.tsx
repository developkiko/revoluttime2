import { setRequestLocale } from "next-intl/server";

import { HeroSectionLazy } from "@/components/home/HeroSectionLazy";
import { DirectionsSection } from "@/components/home/DirectionsSection";
import { EncyclopediaSection } from "@/components/home/EncyclopediaSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { PartnerSection } from "@/components/home/PartnerSection";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  setRequestLocale(lang);

  return (
    <>
      <HeroSectionLazy />
      <DirectionsSection />
      <EncyclopediaSection />
      <ReviewsSection />
      <PartnerSection />
    </>
  );
}
