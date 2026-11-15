"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRightIcon, StarIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { REVIEWS } from "@/lib/reviews";
import type { Locale } from "@/lib/products";

/**
 * Reviews marquee — ported from the Ultra template review wall, re-styled
 * with the site palette. Two copies of the row slide left; hover pauses.
 */
export function ReviewsSection() {
  const t = useTranslations("home.reviews");
  const locale = useLocale() as Locale;

  // Double the row for a seamless -50% translate loop.
  const doubled = React.useMemo(() => [...REVIEWS, ...REVIEWS], []);

  return (
    <section id="reviews" className="overflow-hidden border-t bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto mb-10 w-full max-w-6xl px-4">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="reviews-track">
        <div className="reviews-slide">
          {doubled.map((review, i) => (
            <figure
              key={`${review.name}-${i}`}
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
          animation: reviews-marquee 60s linear infinite;
        }
        .reviews-track:hover .reviews-slide {
          animation-play-state: paused;
        }
        .review-card,
        .review-card img {
          -webkit-user-drag: none;
          user-select: none;
        }
        @keyframes reviews-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @media (max-width: 640px) {
          .reviews-slide {
            animation-duration: 35s;
          }
        }
      `}</style>
    </section>
  );
}
