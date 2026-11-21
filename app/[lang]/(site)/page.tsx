import { setRequestLocale } from "next-intl/server";

import { HeroSectionLazy } from "@/components/home/HeroSectionLazy";
import { DirectionsSection } from "@/components/home/DirectionsSection";
import { OnlineSection } from "@/components/home/OnlineSection";
import { EventsSection } from "@/components/home/EventsSection";
import { IncomeSection } from "@/components/home/IncomeSection";
import { EncyclopediaSection } from "@/components/home/EncyclopediaSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { PartnerSection } from "@/components/home/PartnerSection";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  setRequestLocale(lang);

  return (
    <>
      <HeroSectionLazy />
      {/* Фаза C (владелец 21.11): онлайн-видео, события «Прямо сейчас» и
          блок «Зарабатывают уже сейчас» — рантайм-секции в Suspense (PPR),
          сами скрывают себя, когда данных нет. */}
      <OnlineSection lang={lang} />
      <DirectionsSection />
      <EventsSection lang={lang} />
      <IncomeSection />
      <EncyclopediaSection />
      <ReviewsSection />
      <PartnerSection />
    </>
  );
}
