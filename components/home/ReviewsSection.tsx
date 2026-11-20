"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRightIcon, StarIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { REVIEWS } from "@/lib/reviews";
import type { Locale } from "@/lib/products";

/** Autoplay speed, px per second (owner: «плавно движутся»). */
const AUTO_SPEED_PX_PER_S = 45;
/** Pointer distance (px) before a drag is treated as a swipe, not a click. */
const DRAG_THRESHOLD_PX = 6;

/**
 * Reviews marquee — ported from the Ultra template review wall, re-styled
 * with the site palette. JS-driven loop (rAF): autoplay scrolls left, hover
 * pauses, pointer drag scrolls left/right with the cursor/finger (owner
 * 21.11). Cards carry the shared data-tilt / section data-spotlight FX.
 */
export function ReviewsSection() {
  const t = useTranslations("home.reviews");
  const locale = useLocale() as Locale;

  // Double the row for a seamless half-width translate loop.
  const doubled = React.useMemo(() => [...REVIEWS, ...REVIEWS], []);

  const slideRef = React.useRef<HTMLDivElement>(null);
  const offsetRef = React.useRef(0);
  const halfWidthRef = React.useRef(0);
  const pausedRef = React.useRef(false);
  const draggingRef = React.useRef(false);
  const dragStartRef = React.useRef<{ x: number; offset: number } | null>(null);
  const dragDistanceRef = React.useRef(0);
  const lastTsRef = React.useRef<number | null>(null);

  // Half of the doubled row = one full loop; re-measure on resize (fonts, imgs).
  React.useEffect(() => {
    const measure = () => {
      const el = slideRef.current;
      if (el) halfWidthRef.current = el.scrollWidth / 2;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const apply = () => {
      const el = slideRef.current;
      if (!el) return;
      const half = halfWidthRef.current;
      let off = offsetRef.current;
      if (half > 0) off = ((off % half) + half) % half;
      el.style.transform = `translateX(${-off}px)`;
    };

    let raf = 0;
    const tick = (ts: number) => {
      const dt = lastTsRef.current ? ts - lastTsRef.current : 16;
      lastTsRef.current = ts;
      if (!reduced && !pausedRef.current && !draggingRef.current) {
        offsetRef.current -= (dt / 1000) * AUTO_SPEED_PX_PER_S;
      }
      apply();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onPointerDown = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    draggingRef.current = true;
    dragDistanceRef.current = 0;
    dragStartRef.current = { x: e.clientX, offset: offsetRef.current };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    dragDistanceRef.current = Math.max(dragDistanceRef.current, Math.abs(dx));
    // Drag left → content moves forward (same direction as autoplay).
    offsetRef.current = dragStartRef.current.offset - dx;
  }, []);

  const endDrag = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    dragStartRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  // Swiping over a card must not trigger a click (cards are inert anyway,
  // but the CTA row sits outside the track — this is a pure guard).
  const onClickCapture = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (dragDistanceRef.current >= DRAG_THRESHOLD_PX) {
      e.preventDefault();
      e.stopPropagation();
    }
    dragDistanceRef.current = 0;
  }, []);

  return (
    <section id="reviews" className="border-t bg-muted/30 py-16 sm:py-20" data-spotlight>
      <div className="mx-auto mb-10 w-full max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div
        className="reviews-track cursor-grab touch-pan-y select-none active:cursor-grabbing"
        onPointerEnter={() => {
          pausedRef.current = true;
        }}
        onPointerLeave={() => {
          pausedRef.current = false;
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        <div className="reviews-slide" ref={slideRef}>
          {doubled.map((review, i) => (
            <figure
              key={`${review.name}-${i}`}
              data-tilt
              className="review-card flex w-[320px] max-w-[85vw] shrink-0 flex-col rounded-2xl border bg-card p-5 transition-colors hover:border-primary/30 sm:max-w-none"
            >
              <div
                aria-label={`${review.stars}/5`}
                className="flex items-center gap-0.5 text-amber-400"
              >
                {Array.from({ length: 5 }).map((_, star) => (
                  <StarIcon
                    key={star}
                    className={`size-4 ${star < review.stars ? "fill-amber-400" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {review.text[locale]}
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- tiny static avatar, no next/image config needed */}
                <img
                  src={review.avatar}
                  alt={review.name}
                  loading="lazy"
                  className="size-9 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{review.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {review.role[locale]}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 justify-center rounded-[10px] bg-primary py-3 px-5 text-sm font-semibold text-white transition-all hover:bg-primary/85 whitespace-nowrap sm:py-[0.85rem] sm:px-8 sm:text-base"
        >
          {t("cta")}
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>

      <style jsx>{`
        .reviews-track {
          width: 100%;
          overflow: hidden;
          mask: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
        }
        .reviews-slide {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          will-change: transform;
        }
        .review-card,
        .review-card img {
          -webkit-user-drag: none;
          user-select: none;
        }
      `}</style>
    </section>
  );
}
