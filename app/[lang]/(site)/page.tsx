import { setRequestLocale } from "next-intl/server";

import { HeroSectionLazy } from "@/components/home/HeroSectionLazy";
import { DirectionsSection } from "@/components/home/DirectionsSection";
import { OnlineSection } from "@/components/home/OnlineSection";
import { LiveNowSection } from "@/components/home/LiveNowSection";
import { EncyclopediaSection } from "@/components/home/EncyclopediaSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { PartnerSection } from "@/components/home/PartnerSection";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  setRequestLocale(lang);

  return (
    <>
      <HeroSectionLazy />
      {/* Фаза C (владелец 21.11) + №11 (владелец 22.11): онлайн-видео и
          общая секция «Прямо сейчас» + «Зарабатывают уже сейчас» (две
          колонки) — рантайм-секции в Suspense (PPR). */}
      <OnlineSection lang={lang} />
      <DirectionsSection />
      <LiveNowSection lang={lang} />
      <EncyclopediaSection />
      <ReviewsSection />
      <PartnerSection />
    </>
  );
}
