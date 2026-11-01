import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  BikeIcon,
  DropletsIcon,
  HourglassIcon,
  MountainIcon,
  ShieldCheckIcon,
  TrophyIcon,
} from "lucide-react";

import { ContactWidget } from "@/components/contact/ContactWidget";
import { LevelsCascade } from "@/components/partner/LevelsCascade";
import { PartnerSteps } from "@/components/partner/PartnerSteps";
import { ReferralDiagram } from "@/components/home/ReferralDiagram";
import { UsageSection } from "@/components/home/UsageSection";
import { AdminDemoButton } from "@/components/admin/AdminDemoButton";
import { getOffer } from "@/lib/catalog";
import { BookingWidget } from "@/components/booking/BookingWidget";

export async function generateMetadata(
  props: PageProps<"/[lang]/dummy">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "dummy" });
  return {
    title: t("title"),
    robots: { index: false },
  };
}

export default async function DummyPage({
  params,
}: PageProps<"/[lang]/dummy">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("dummy");
  const badminton = getOffer("badminton")!;

  return (
    <>
      <section className="border-b bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <p className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheckIcon className="size-3.5 text-primary" />
            {t("badge")}
          </p>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {[
              { icon: DropletsIcon, label: t("pieceLogo") },
              { icon: TrophyIcon, label: t("pieceSteps") },
              { icon: HourglassIcon, label: t("pieceLevels") },
              { icon: MountainIcon, label: t("pieceBooking") },
              { icon: BikeIcon, label: t("pieceContact") },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1"
              >
                <Icon className="size-3.5 text-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Contact widget */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <h2 className="text-xl font-bold tracking-tight">{t("contactTitle")}</h2>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          {t("contactSubtitle")}
        </p>
        <ContactWidget />
      </section>

      {/* Admin demo sign-in */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-4">
        <AdminDemoButton />
      </section>

      {/* Partner steps + pentagon */}
      <section className="border-y bg-muted/40">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {t("stepsTitle")}
            </h2>
            <div className="mt-6">
              <PartnerSteps />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold tracking-tight">
              {t("diagramTitle")}
            </h2>
            <ReferralDiagram />
          </div>
        </div>
      </section>

      {/* Levels cascade + booking widget */}
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {t("levelsTitle")}
          </h2>
          <div className="mt-6">
            <LevelsCascade />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {t("bookingTitle")}
          </h2>
          <div className="mt-6">
            <BookingWidget offer={badminton} />
          </div>
        </div>
      </section>

      <UsageSection />
    </>
  );
}
