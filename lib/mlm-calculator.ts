import { getPack, PARTNER_MIN_PACKS, type PackId } from "@/lib/products";

/**
 * Partner plan (owner's paper sheet "Revolut Team", pinned 12.11.2026):
 * 5 levels, matrix width 5, shares of the referred purchase amount:
 * I 50 % · II 10 % · III 2 % · IV 1 % · V 1 %.
 * Partner entry: 10 packs × 60 € = 600 € (+1 pack free).
 * Full network (5^1..5^5 = 3905 partners) yields up to 27 000 €.
 * Kleinunternehmer nach § 19 UStG: no VAT, netto = gross.
 */
export const MLM_LEVELS = ["I", "II", "III", "IV", "V"] as const;
export type MlmLevel = (typeof MLM_LEVELS)[number];

/** Share of the referred purchase amount paid out at that level. */
export const LEVEL_SHARES: Record<MlmLevel, number> = {
  I: 0.5,
  II: 0.1,
  III: 0.02,
  IV: 0.01,
  V: 0.01,
};

/** Matrix width — direct partners per position (5×N deep). */
export const MATRIX_WIDTH = 5;

/** Partner entry bundle: 10 packs × partner price (+ bonus pack free). */
export const PARTNER_ENTRY_PACKS = PARTNER_MIN_PACKS;
export const PARTNER_ENTRY_CENTS =
  PARTNER_ENTRY_PACKS * getPack("pack-90").partnerPriceCents;

/** Sum of all level shares (0.5 + 0.1 + 0.02 + 0.01 + 0.01). */
export const TOTAL_FUND_RATIO = MLM_LEVELS.reduce(
  (sum, level) => sum + LEVEL_SHARES[level],
  0,
);

/**
 * Total partner fund for a purchase in euro cents — recorded as one pending
 * ledger row per order (per-level split once beneficiaries exist).
 */
export function partnerFundCents(priceCents: number): number {
  return Math.round(priceCents * TOTAL_FUND_RATIO);
}

/** Payout for one referred purchase of the given amount at the given level. */
export function levelPayoutCents(priceCents: number, level: MlmLevel): number {
  return Math.round(priceCents * LEVEL_SHARES[level]);
}

export interface PlanLevelRow {
  level: MlmLevel;
  /** Share of the referred purchase (0.5 / 0.1 / 0.02 / 0.01 / 0.01). */
  share: number;
  /** Partners in this level of a full 5-wide matrix (5^depth). */
  partners: number;
  /** Payout per referred 600 € entry at this level. */
  perPersonCents: number;
  /** perPerson × partners for a fully filled level. */
  subtotalCents: number;
}

export interface PlanTotals {
  partnersTotal: number;
  potentialCents: number;
}

/** The owner's paper plan as a table (example on the 600 € partner entry). */
export function payoutTable(baseCents: number = PARTNER_ENTRY_CENTS): {
  rows: PlanLevelRow[];
  totals: PlanTotals;
} {
  const rows: PlanLevelRow[] = MLM_LEVELS.map((level, index) => {
    const partners = MATRIX_WIDTH ** (index + 1);
    const perPersonCents = levelPayoutCents(baseCents, level);
    return {
      level,
      share: LEVEL_SHARES[level],
      partners,
      perPersonCents,
      subtotalCents: perPersonCents * partners,
    };
  });
  const totals: PlanTotals = {
    partnersTotal: rows.reduce((sum, row) => sum + row.partners, 0),
    potentialCents: rows.reduce((sum, row) => sum + row.subtotalCents, 0),
  };
  return { rows, totals };
}

export type SkuPayouts = {
  packId: PackId;
  priceCents: number;
  tablets: number;
  fundCents: number;
};

/** Fund summary for every shop SKU (kept for cabinet/webhook consumers). */
export function skuPayouts(packId: PackId): SkuPayouts {
  const { priceCents, tablets } = getPack(packId);
  return { packId, priceCents, tablets, fundCents: partnerFundCents(priceCents) };
}

export function payoutTableSkus(): SkuPayouts[] {
  // Single-SKU catalog since pricing v2.
  return [skuPayouts("pack-90")];
}
