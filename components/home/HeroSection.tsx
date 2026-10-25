"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CupSodaIcon,
  LeafIcon,
  TruckIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const CHIPS = [
  { key: "hydrogen", icon: CupSodaIcon },
  { key: "magnesium", icon: BadgeCheckIcon },
  { key: "kcal", icon: LeafIcon },
  { key: "shipping", icon: TruckIcon },
] as const;

export function HeroSection() {
  const t = useTranslations("hero");

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
            <BadgeCheckIcon className="size-3.5 text-primary" />
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
              <a href="#variants">
                {t("ctaBuy")}
                <ArrowRightIcon data-icon="inline-end" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#usage">{t("ctaUsage")}</a>
            </Button>
          </div>

          <ul className="mt-2 grid w-full gap-2 sm:grid-cols-2">
            {CHIPS.map(({ key, icon: Icon }) => (
              <li
                key={key}
                className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground"
              >
                <Icon className="size-4 shrink-0 text-primary" />
                {t(`chips.${key}`)}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="overflow-hidden rounded-3xl border bg-card shadow-lg">
            <Image
              src="/imgs/product/tabs-hero.jpg"
              alt={t("title")}
              width={959}
              height={1280}
              priority
              sizes="(min-width: 1024px) 28rem, 90vw"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <motion.div
            aria-hidden
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-4 -left-4 rounded-2xl border bg-card px-4 py-3 shadow-md"
          >
            <p className="text-2xl font-bold text-primary">H₂</p>
            <p className="text-xs text-muted-foreground">1,6 ppm</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
