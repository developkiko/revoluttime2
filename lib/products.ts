import { routing, type Locale } from "@/i18n/routing";

export type { Locale };

export type PackId = "pack-90";

/** Brand-wide contacts (from the RevolutTIME business card). */
export const SITE = {
  phoneDisplay: "+49 175 9590916",
  phoneHref: "tel:+491759590916",
  whatsapp: "https://wa.me/491759590916",
  // TODO(auth API): replace with the real Telegram bot/channel link.
  telegram: "https://t.me/revoluttime",
} as const;

export interface PackVariant {
  id: PackId;
  /** Number of effervescent tablets in the pack. */
  tablets: number;
  /** Retail price in euro cents (end customers). */
  priceCents: number;
  /** Partner price in euro cents (min. PARTNER_MIN_PACKS packs per order). */
  partnerPriceCents: number;
  /** True for the flagship format shown first. */
  featured?: boolean;
  image: string;
}

/** Partner condition: partner price applies from this many packs per order. */
export const PARTNER_MIN_PACKS = 10;
/** Free bonus packs shipped with a qualifying partner order. */
export const PARTNER_BONUS_PACKS = 1;

export const PACK_VARIANTS: PackVariant[] = [
  {
    id: "pack-90",
    tablets: 90,
    priceCents: 7000,
    partnerPriceCents: 6000,
    featured: true,
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
