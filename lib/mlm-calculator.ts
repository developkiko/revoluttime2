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

/* ── Кеш-бэк за приведённого (владелец 21.11) ──────────────────────────────
   Партнёр получает 300 € за каждого приведённого по его ссылке, который:
   • пополнил счёт на 600 €, или
   • заказал партнёрский набор (партнёрский вход ≥ 10 пачек).
   Зачисление — НЕ сразу: Stripe может вернуть платёж уже после success, поэтому
   кеш-бэк фиксируется в ledger со статусом pending и «размораживается» по
   истечении холдинга (lazy-проверка unlocks_at при чтении — без крона). */
export const CASHBACK_CENTS = 30_000; // 300 €
/** Целевое пополнение счёта приведённого. */
export const CASHBACK_TARGET_TOPUP_CENTS = 60_000; // 600 €
/** Холдинг кеш-бэка (дни) — окно возврата/спора Stripe. */
export const CASHBACK_HOLDING_DAYS = 14;

/**
 * Детерминированный партнёрский код по якорю (FNV-1a): RT-XXXXXX.
 * Один источник правды — компонент кабинета импортирует отсюда же,
 * вебхук по коду находит партнёра (auth_links.ref_code).
 */
export function referralCodeFor(email: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < email.length; i++) {
    hash ^= email.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `RT-${(hash >>> 0).toString(16).toUpperCase().slice(0, 6).padStart(6, "0")}`;
}

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
