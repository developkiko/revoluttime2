import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { CATALOG_OFFERS } from "@/lib/catalog";

const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://revolut-time.vercel.app"
);

const STATIC_PATHS = [
  "",
  "/shop",
  "/hydrogen",
  "/hydrogen/tablets",
  "/studio",
  "/equipment",
  "/recreation",
  "/partner",
  "/legal/impressum",
  "/legal/datenschutz",
  "/legal/agb",
  "/legal/widerruf",
];

const OFFER_PATHS = CATALOG_OFFERS.map((offer) => `/recreation/${offer.slug}`);

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const path of [...STATIC_PATHS, ...OFFER_PATHS]) {
      entries.push({
        url: `${BASE}/${locale}${path}`,
        changeFrequency: "monthly",
        priority: path === "" ? 1 : 0.7,
      });
    }
  }
  return entries;
}
