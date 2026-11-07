import { getPack, PACK_VARIANTS, type PackId } from "@/lib/products";

/**
 * Partner fund math (blueprint § 2) pinned to the real shop SKUs.
 * Kleinunternehmer nach § 19 UStG: no VAT is charged, so netto = gross.
 */
export const PARTNER_FUND_RATIO = 0.3; // max 30% of netto goes to the network

export const MLM_LEVELS = ["A", "B", "C", "D", "E", "F"] as const;
export type MlmLevel = (typeof MLM_LEVELS)[number];

/** Share of the partner fund per level (A 12% … F 2% — sums to 30%). */
export const LEVEL_SHARES: Record<MlmLevel, number> = {
  A: 0.12,
  B: 0.06,
  C: 0.04,
  D: 0.03,
  E: 0.03,
  F: 0.02,
};

/** 30% partner fund for a given gross price in cents (= netto under § 19 UStG). */
export function partnerFundCents(priceCents: number): number {
  return Math.round(priceCents * PARTNER_FUND_RATIO);
}

/** Euro-cent payout for one level from one sale of the given price. */
export function levelPayoutCents(priceCents: number, level: MlmLevel): number {
  return Math.round(partnerFundCents(priceCents) * LEVEL_SHARES[level]);
}

export interface SkuPayouts {
  packId: PackId;
  /** Gross (= netto) retail price of the SKU in cents. */
  priceCents: number;
  tablets: number;
  /** 30% partner fund in cents. */
  fundCents: number;
  /** Per-level payout in cents. */
  payouts: Record<MlmLevel, number>;
}

export function skuPayouts(packId: PackId): SkuPayouts {
  const { priceCents, tablets } = getPack(packId);
  const fundCents = partnerFundCents(priceCents);
  const payouts = Object.fromEntries(
    MLM_LEVELS.map((level) => [level, levelPayoutCents(priceCents, level)]),
  ) as Record<MlmLevel, number>;
  return { packId, priceCents, tablets, fundCents, payouts };
}

/** Payout table for every shop SKU, ready for the /partner grid. */
export function payoutTable(): SkuPayouts[] {
  return PACK_VARIANTS.map((variant) => skuPayouts(variant.id));
}
