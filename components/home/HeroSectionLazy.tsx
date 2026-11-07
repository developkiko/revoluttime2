"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

// The hero slider pulls framer-motion (~48 KB gz) into the eager set — split
// it into a lazy chunk; the static skeleton below holds the LCP slot while
// the interactive slider hydrates.
const HeroSectionInner = dynamic(
  () => import("./HeroSection").then((m) => m.HeroSection),
  {
    ssr: false,
    loading: () => <HeroSkeleton />,
  },
);

function HeroSkeleton() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative overflow-hidden" aria-hidden>
      <div className="pointer-events-none absolute -top-40 right-[-10%] size-[32rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="mx-auto w-full max-w-6xl px-4 py-14 md:py-20">
        <div className="mx-auto grid min-h-[34rem] max-w-4xl items-center gap-8 md:min-h-[30rem] md:grid-cols-2 md:gap-12">
          <div className="order-2 flex flex-col items-start gap-5 md:order-1">
            <p className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              {t("slides.hydrogen.badge")}
            </p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {t("slides.hydrogen.title")}{" "}
              <span className="text-primary">{t("slides.hydrogen.titleAccent")}</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              {t("slides.hydrogen.subtitle")}
            </p>
          </div>
          <div className="relative order-1 mx-auto w-full max-w-sm md:order-2">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border bg-card shadow-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroSectionLazy() {
  return <HeroSectionInner />;
}
