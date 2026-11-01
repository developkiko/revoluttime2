"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon, UsersIcon } from "lucide-react";
import * as React from "react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/**
 * Hero slides. One entry per brand direction today — swap this array for the
 * partner-program "complexes" feed when the registration API is available.
 */
const SLIDE_KEYS = ["hydrogen", "studio", "partner"] as const;
const SLIDE_INTERVAL_MS = 6000;

const SLIDE_MEDIA: Record<
  (typeof SLIDE_KEYS)[number],
  { image?: string; href: string }
> = {
  hydrogen: { image: "/imgs/product/tabs-hero.jpg", href: "/shop" },
  studio: { image: "/imgs/brand/add-life.jpg", href: "/studio" },
  partner: { href: "/partner" },
};

function PartnerSlidePanel() {
  const t = useTranslations("home.directions.items.partner");
  return (
    <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary to-primary/60 p-8 text-center text-primary-foreground">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-foreground/15">
        <UsersIcon className="size-8" />
      </span>
      <p className="text-5xl font-black tracking-tight">30%</p>
      <p className="text-lg font-semibold">{t("title")}</p>
      <p className="text-sm text-primary-foreground/85">{t("text")}</p>
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations("home.hero");
  const tDirections = useTranslations("home.directions.items");
  const [active, setActive] = React.useState(0);

  const next = React.useCallback(
    () => setActive((i) => (i + 1) % SLIDE_KEYS.length),
    []
  );
  const prev = React.useCallback(
    () =>
      setActive((i) => (i - 1 + SLIDE_KEYS.length) % SLIDE_KEYS.length),
    []
  );

  React.useEffect(() => {
    const timer = window.setInterval(next, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [next]);

  const activeKey = SLIDE_KEYS[active];
  const media = SLIDE_MEDIA[activeKey];

  return (
    <section className="relative overflow-hidden">
      {/* Decorative hydrogen glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] size-[32rem] rounded-full bg-primary/10 blur-3xl"
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-start gap-6"
        >
          <p className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <SparklesIcon className="size-3.5 text-primary" />
            {t("badge")}
          </p>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {t("title")}{" "}
            <span className="text-primary">{t("titleAccent")}</span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/partner">{t("ctaPartner")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#directions">{t("ctaDirections")}</a>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="mx-auto w-full max-w-md"
        >
          <div className="relative overflow-hidden rounded-3xl border bg-card shadow-lg">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {media.image ? (
                  <Link href={media.href} aria-label={tDirections(`${activeKey}.title`)}>
                    <Image
                      src={media.image}
                      alt={tDirections(`${activeKey}.title`)}
                      width={959}
                      height={1280}
                      priority
                      sizes="(min-width: 1024px) 28rem, 90vw"
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </Link>
                ) : (
                  <Link href={media.href} aria-label={tDirections(`${activeKey}.title`)}>
                    <PartnerSlidePanel />
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>

            <p className="absolute top-4 left-4 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
              {t("slideKicker")} {active + 1}/{SLIDE_KEYS.length} ·{" "}
              {tDirections(`${activeKey}.title`)}
            </p>

            <button
              type="button"
              onClick={prev}
              aria-label="←"
              className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="→"
              className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
            >
              <ChevronRightIcon className="size-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {SLIDE_KEYS.map((key, index) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`${index + 1}`}
                  className={`size-2.5 rounded-full transition-colors ${
                    index === active
                      ? "bg-primary"
                      : "bg-foreground/25 hover:bg-foreground/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
