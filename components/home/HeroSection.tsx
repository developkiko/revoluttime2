"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CupSodaIcon,
  DumbbellIcon,
  LeafIcon,
  MountainIcon,
  TruckIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";
import * as React from "react";

import { Link } from "@/i18n/navigation";
import { WikiLink } from "@/components/encyclopedia/WikiLink";

const SLIDE_INTERVAL_MS = 7000;
/** Horizontal drag distance (px) that counts as a swipe. */
const SWIPE_THRESHOLD_PX = 48;
/** Minimum gap between slide transitions (ms). */
const NAV_LOCK_MS = 500;

const SLIDE_KEYS = [
  "hydrogen",
  "studio",
  "equipment",
  "recreation",
  "partner",
] as const;
type SlideKey = (typeof SLIDE_KEYS)[number];

const SLIDE_MEDIA: Record<SlideKey, { image?: string }> = {
  hydrogen: { image: "/imgs/product/tabs-hero.jpg" },
  studio: { image: "/imgs/brand/add-life.jpg" },
  equipment: {},
  recreation: {},
  partner: {},
};

const SLIDE_ICONS: Record<SlideKey, React.ReactNode> = {
  hydrogen: <CupSodaIcon className="size-16" />,
  studio: <DumbbellIcon className="size-16" />,
  equipment: <WrenchIcon className="size-16" />,
  recreation: <MountainIcon className="size-16" />,
  partner: <UsersIcon className="size-16" />,
};

const SLIDE_HREF: Record<SlideKey, string> = {
  hydrogen: "/shop",
  studio: "/studio",
  equipment: "/equipment",
  recreation: "/recreation",
  partner: "/partner",
};

const HYDROGEN_CHIPS = [
  { key: "hydrogen", icon: CupSodaIcon },
  { key: "magnesium", icon: BadgeCheckIcon },
  { key: "kcal", icon: LeafIcon },
  { key: "shipping", icon: TruckIcon },
] as const;

function SlideMedia({ slideKey, title }: { slideKey: SlideKey; title: string }) {
  const image = SLIDE_MEDIA[slideKey].image;
  if (image) {
    return (
      <Image
        src={image}
        alt={title}
        width={959}
        height={1280}
        priority
        sizes="(min-width: 1024px) 28rem, 90vw"
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#056ea8]/20 via-muted to-primary/10">
      <span className="flex size-32 items-center justify-center rounded-3xl bg-card/70 text-primary shadow-lg backdrop-blur-sm">
        {SLIDE_ICONS[slideKey as Exclude<SlideKey, "hydrogen">]}
      </span>
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations("home.hero");
  const [[index, direction], setSlide] = React.useState<[number, number]>([0, 0]);

  // Rapid navigation (fast swipes / arrow spam + auto-timer) would queue
  // multiple enter/exit animations — slides then linger half-faded. A short
  // lock keeps one transition at a time.
  const navLockRef = React.useRef(0);
  const navLocked = React.useCallback(() => {
    const now = Date.now();
    if (now - navLockRef.current < NAV_LOCK_MS) return true;
    navLockRef.current = now;
    return false;
  }, []);

  const go = React.useCallback(
    (next: number) => {
      if (navLocked()) return;
      setSlide(([current]) => [
        (next + SLIDE_KEYS.length) % SLIDE_KEYS.length,
        next > current ? 1 : -1,
      ]);
    },
    [navLocked],
  );

  const nextSlide = React.useCallback(() => {
    setSlide(([current]) => [(current + 1) % SLIDE_KEYS.length, 1]);
  }, []);

  // The interval restarts on every slide change: manual navigation gets a
  // full 7 s before the timer fires again (no mid-transition hijacks).
  React.useEffect(() => {
    const timer = window.setInterval(nextSlide, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [nextSlide, index, direction]);

  // Swipe support: touch (pan-y keeps vertical scrolling native) and mouse
  // drag on desktop. A drag past the threshold suppresses the trailing click
  // so swiping over a CTA does not navigate.
  const dragStart = React.useRef<{ x: number; y: number } | null>(null);
  const dragDistance = React.useRef(0);

  const onPointerDown = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragStart.current = { x: event.clientX, y: event.clientY };
    dragDistance.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const distance = Math.hypot(
      event.clientX - dragStart.current.x,
      event.clientY - dragStart.current.y,
    );
    dragDistance.current = Math.max(dragDistance.current, distance);
  }, []);

  const onPointerUp = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const start = dragStart.current;
      dragStart.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) return;
      if (navLocked()) return;
      navLockRef.current = Date.now();
      if (dx < 0) {
        nextSlide();
      } else {
        setSlide(([current]) => [
          (current - 1 + SLIDE_KEYS.length) % SLIDE_KEYS.length,
          -1,
        ]);
      }
    },
    [nextSlide, navLocked],
  );

  const onClickCapture = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (dragDistance.current >= SWIPE_THRESHOLD_PX) {
      event.preventDefault();
      event.stopPropagation();
    }
    dragDistance.current = 0;
  }, []);

  const key = SLIDE_KEYS[index];
  const isHydrogen = key === "hydrogen";

  return (
    <section
      className="relative flex flex-col overflow-hidden text-center md:h-[calc(100dvh-var(--header-height))] md:min-h-[42rem]"
      style={{
        background:
          "radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in oklab, var(--primary) 12%, transparent), transparent)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.07] bg-fixed"
        style={{ backgroundImage: "url('/images/wall/hero-bg-1.jpg')" }}
      />

      {/* side arrows — Ultra tinted buttons, pinned to the screen edges */}
      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label="←"
        className="absolute left-4 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-[10px] border border-primary/25 bg-primary/12 text-primary transition-colors hover:bg-primary/20 md:flex"
      >
        <ChevronLeftIcon className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label="→"
        className="absolute right-4 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-[10px] border border-primary/25 bg-primary/12 text-primary transition-colors hover:bg-primary/20 md:flex"
      >
        <ChevronRightIcon className="size-5" />
      </button>

      <div className="relative mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col px-6 pt-[120px] pb-[60px] sm:pt-[160px] sm:pb-[100px] md:pt-14 md:pb-8">

        {/* Slider area — one uniform height for every slide: desktop fills the
            remaining viewport (section is h-screen minus header), mobile is a
            fixed box tall enough for the heaviest slide; the media block flexes
            on desktop to absorb per-slide content variance. */}
        <div
          className="flex h-[46rem] w-full touch-pan-y select-none flex-col justify-center overflow-y-auto sm:h-[48rem] md:h-auto md:min-h-0 md:flex-1 md:overflow-visible"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={onClickCapture}
        >
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={key}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex min-h-full flex-col items-center justify-center gap-3 sm:gap-5 md:gap-6"
            >
              <p className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground sm:px-3 sm:text-xs">
                <BadgeCheckIcon className="size-3.5 text-primary" />
                {t(`slides.${key}.badge`)}
              </p>

              <h1 className="text-[1.7rem] font-extrabold leading-tight text-foreground sm:text-[2.5rem] md:text-[3rem]">
                {t(`slides.${key}.title`)}{" "}
                <span className="text-primary">
                  {t(`slides.${key}.titleAccent`)}
                </span>
              </h1>

              <p className="mx-auto max-w-[600px] text-sm leading-relaxed text-muted-foreground sm:text-lg">
                {t.rich(`slides.${key}.subtitle`, {
                  mgh2: (chunks) => (
                    <WikiLink slug="magnesium-h2-synergy">{chunks}</WikiLink>
                  ),
                  water: (chunks) => (
                    <WikiLink slug="h2-water-production">{chunks}</WikiLink>
                  ),
                })}
              </p>

              {isHydrogen && (
                <ul className="flex flex-wrap justify-center gap-2">
                  {HYDROGEN_CHIPS.map(({ key: chipKey, icon: Icon }) => (
                    <li
                      key={chipKey}
                      className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2 py-1 text-xs text-muted-foreground sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
                    >
                      <Icon className="size-3.5 shrink-0 text-primary sm:size-4" />
                      {t(`chips.${chipKey}`)}
                    </li>
                  ))}
                </ul>
              )}

              {/* slide media below centered copy — desktop flexes to fill the
                  uniform slide height (object-cover crops); mobile fixed box */}
              <div className="relative mx-auto h-40 w-full max-w-sm flex-none sm:h-48 md:h-auto md:min-h-[10rem] md:flex-1">
                <div className="h-full w-full overflow-hidden rounded-3xl border bg-card shadow-lg">
                  <SlideMedia slideKey={key} title={t(`slides.${key}.title`)} />
                </div>
                {isHydrogen && (
                  <motion.div
                    aria-hidden
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -bottom-4 -left-4 rounded-2xl border bg-card px-4 py-3 shadow-md"
                  >
                    <p className="text-2xl font-bold text-primary">H₂</p>
                    <p className="text-xs text-muted-foreground">1,6 ppm</p>
                  </motion.div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <Link
                  href={SLIDE_HREF[key]}
                  className="inline-flex items-center gap-2 justify-center rounded-[10px] bg-primary py-3 px-5 text-sm font-semibold text-white transition-all hover:bg-primary/85 whitespace-nowrap sm:py-[0.85rem] sm:px-8 sm:text-base"
                >
                  {t(`slides.${key}.cta`)}
                  <ArrowRightIcon className="size-4" />
                </Link>
                <a
                  href="#directions"
                  className="inline-flex items-center gap-2 justify-center rounded-[10px] border border-primary/25 bg-primary/12 py-3 px-5 text-sm font-semibold text-primary transition-all hover:bg-primary/20 whitespace-nowrap sm:py-[0.85rem] sm:px-8 sm:text-base"
                >
                  {t("explore")}
                  <ChevronDownIcon className="size-4" />
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* mobile arrows + dots */}
        <div className="mt-6 flex items-center justify-center gap-4 md:hidden">
          <button
            type="button"
            aria-label="←"
            onClick={() => go(index - 1)}
            className="inline-flex size-10 items-center justify-center rounded-[10px] border border-primary/25 bg-primary/12 text-primary transition-colors hover:bg-primary/20"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <div className="flex items-center gap-2">
            {SLIDE_KEYS.map((slideKey, i) => (
              <button
                key={slideKey}
                type="button"
                onClick={() => go(i)}
                aria-label={`${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? "w-7 bg-primary" : "w-2.5 bg-foreground/25 hover:bg-foreground/40"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="→"
            onClick={() => go(index + 1)}
            className="inline-flex size-10 items-center justify-center rounded-[10px] border border-primary/25 bg-primary/12 text-primary transition-colors hover:bg-primary/20"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>

        <div className="mt-6 hidden items-center justify-center gap-3 md:flex">
          <div className="flex items-center gap-2">
            {SLIDE_KEYS.map((slideKey, i) => (
              <button
                key={slideKey}
                type="button"
                onClick={() => go(i)}
                aria-label={`${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? "w-7 bg-primary" : "w-2.5 bg-foreground/25 hover:bg-foreground/40"
                }`}
              />
            ))}
          </div>
          <p className="text-sm font-medium tabular-nums text-muted-foreground">
            {String(index + 1).padStart(2, "0")} / {String(SLIDE_KEYS.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}
