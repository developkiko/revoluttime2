import { routing, type Locale } from "@/i18n/routing";

export type { Locale };

export type PackId = "pack-90" | "pack-120";

export interface PackVariant {
  id: PackId;
  /** Number of effervescent tablets in the pack. */
  tablets: number;
  /** Price in euro cents. */
  priceCents: number;
  /** True for the flagship format shown first. */
  featured?: boolean;
  image: string;
}

export const PACK_VARIANTS: PackVariant[] = [
  {
    id: "pack-120",
    tablets: 120,
    priceCents: 2499,
    featured: true,
    image: "/imgs/product/tabs-120.jpg",
  },
  {
    id: "pack-90",
    tablets: 90,
    priceCents: 1899,
    image: "/imgs/product/tabs-90.jpg",
  },
];

export function getPack(id: PackId): PackVariant {
  const pack = PACK_VARIANTS.find((variant) => variant.id === id);
  if (!pack) throw new Error(`Unknown pack variant: ${id}`);
  return pack;
}

const intlLocale: Record<Locale, string> = {
  de: "de-DE",
  ru: "ru-RU",
  en: "en-IE",
};

export function formatPrice(cents: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

/** Locale label used in the header language switcher. */
export const localeLabels: Record<Locale, string> = {
  de: "DE",
  ru: "RU",
  en: "EN",
};

export { routing };
