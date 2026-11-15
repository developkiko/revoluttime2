import {
  PARTNER_BONUS_PACKS,
  PARTNER_MIN_PACKS,
  type PackVariant,
} from "@/lib/products";

export interface PackPricing {
  /** Packs the customer actually pays for. */
  billedQuantity: number;
  /** Extra packs shipped for free with a qualifying partner order. */
  bonusPacks: number;
  /** Cents actually charged (billedQuantity × qualifying unit price). */
  totalCents: number;
  /** Cents saved vs. retail unit price — drives the strike-through delta. */
  savedCents: number;
  /** Partner condition (≥ PARTNER_MIN_PACKS per order) is met. */
  qualifies: boolean;
  /** Packs shipped: paid + bonus. */
  deliveredPacks: number;
}

/**
 * Partner pricing: from PARTNER_MIN_PACKS packs per order every pack drops to
 * the partner price and PARTNER_BONUS_PACKS extra packs ride along for free
 * (10 × 60 € = 600 € for 11 packs). Below the threshold retail price applies.
 */
export function pricePacks(pack: PackVariant, quantity: number): PackPricing {
  const qualifies = quantity >= PARTNER_MIN_PACKS;
  const unitCents = qualifies ? pack.partnerPriceCents : pack.priceCents;
  const bonusPacks = qualifies ? PARTNER_BONUS_PACKS : 0;
  return {
    billedQuantity: quantity,
    bonusPacks,
    totalCents: unitCents * quantity,
    savedCents: (pack.priceCents - unitCents) * quantity,
    qualifies,
    deliveredPacks: quantity + bonusPacks,
  };
}
