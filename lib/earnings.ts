/**
 * Лента «Зарабатывают уже сейчас» (Фаза C, решение владельца 21.11).
 *
 * Dummy-режим: детерминированная генерация по seed — и сервер (начальный
 * фид при SSR), и клиент (тиканье раз в 2–15 мин) получают ОДИНАКОВЫЕ
 * записи для одного seed, записи не дублируются между визитами одного
 * пользователя и выглядят живой лентой. Пауза — вес `pause` из
 * income_weights (шаг пропускается — в окне просто нет поступления).
 * Недозаполненный остаток весов (< 100 %) распределяется равномерно
 * между cashback и percent (правило владельца из админки).
 *
 * Real-режим: записи читаются из financial_ledger (kind fund/cashback),
 * персональные данные анонимизируются: маска имени + аватар из того же
 * пула, что и отзывы («тот же пул для живых оплат» — владелец).
 */

export type EarningType = "percent" | "cashback";

export interface EarningEntry {
  /** Монотонный индекс шага ленты (0 = самый свежий, растёт назад во времени). */
  index: number;
  type: EarningType;
  /** Сумма в центах евро. */
  amountCents: number;
  /** Маска имени: «A. W.» (анонимизация, решение владельца). */
  maskedName: string;
  /** Аватар из пула отзывов (/imgs/avas/ava1..8.jpg). */
  avatar: string;
  /** Epoch ms появления записи. */
  ts: number;
}

export interface EarningsConfig {
  /** Границы интервала поступлений, минуты (админ: 1–300). */
  minMinutes: number;
  maxMinutes: number;
  /** Веса типов из owner_settings.income_weights (pause = пропуск шага). */
  weights: Record<string, number>;
}

/** Аватары отзывов — тот же пул для живых выплат (владелец 21.11). */
export const EARNINGS_AVATARS = [
  "/imgs/avas/ava1.jpg",
  "/imgs/avas/ava2.jpg",
  "/imgs/avas/ava3.jpg",
  "/imgs/avas/ava4.jpg",
  "/imgs/avas/ava5.jpg",
  "/imgs/avas/ava6.jpg",
  "/imgs/avas/ava7.jpg",
  "/imgs/avas/ava8.jpg",
] as const;

/** Демо-имена (не настоящие пользователи); выводятся как маска «И. Ф.».
 *  Микс DE/EU-имён — под немецкую аудиторию. */
const FIRST_NAMES = [
  "Anna", "Markus", "Elena", "Thomas", "Sofia", "Ivan", "Julia", "Peter",
  "Nina", "Dmitri", "Laura", "Felix", "Katharina", "Andreas", "Olga", "Jonas",
] as const;
const LAST_INITIALS = ["W.", "K.", "M.", "S.", "B.", "H.", "R.", "T.", "L.", "D."] as const;

/** Уровневые проценты партнёрского плана I–V от пакета/пополнения:
 *  50/10/2/1/1 % — реальные суммы с продажи 70 € и пополнений от 600 €. */
const PERCENT_AMOUNTS_CENTS = [70, 140, 350, 700, 1400, 3500, 4480] as const;
/** Кеш-бэк — фиксированные 300 € (механика Фазы A). */
const CASHBACK_CENTS = 30000;

/* ── Детерминированный RNG ─────────────────────────────────────────────── */

function hash32(n: number): number {
  let x = n | 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  return (x ^ (x >>> 16)) >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stepRng(baseSeed: number, index: number): () => number {
  return mulberry32(hash32(baseSeed * 0x9e3779b1 + (index + 1) * 0x85ebca6b));
}

/** Публичный seed для рандома baseSeed — чтобы фид не совпадал между
 *  сессиями целиком, но был стабилен внутри одной. */
export function randomEarningsSeed(): number {
  return (Math.floor(Math.random() * 0x7fffffff) | 1) >>> 0;
}

/* ── Типы и суммы ──────────────────────────────────────────────────────── */

/** Нормализованные вероятности: остаток до 100 % делится поровну между
 *  cashback и percent; pause остаётся как задан. */
function typeProbabilities(weights: Record<string, number>): {
  percent: number;
  cashback: number;
  pause: number;
} {
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : 0);
  const cashback = Math.max(0, num(weights.cashback));
  const percent = Math.max(0, num(weights.percent));
  const pause = Math.max(0, num(weights.pause));
  const rest = Math.max(0, 100 - cashback - percent - pause);
  const even = rest / 2;
  const total = cashback + even + percent + even + pause || 1;
  return {
    percent: (percent + even) / total,
    cashback: (cashback + even + percent + even) / total,
    pause: 1,
  };
}

function maskedNameOf(rng: () => number): string {
  const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
  const last = LAST_INITIALS[Math.floor(rng() * LAST_INITIALS.length)];
  return `${first[0]}. ${last}`;
}

/** Демо-имена для цепочки партнёров на главной (детерминированные маски
 *  «И. Ф.» + аватары из пула отзывов — решение владельца 21.11). */
export function demoPartner(index: number): { maskedName: string; avatar: string } {
  const rng = mulberry32(hash32(0xc0ffee + (index + 1) * 0x5bd1e995));
  return {
    maskedName: maskedNameOf(rng),
    avatar: EARNINGS_AVATARS[index % EARNINGS_AVATARS.length],
  };
}

/** Анонимизация реальной записи: beneficiary_email → «И. Ф.» + аватар по
 *  стабильному хэшу (один и тот же email всегда выглядит одинаково). */
export function anonymizeLedgerEmail(email: string | null): {
  maskedName: string;
  avatar: string;
} {
  const local = (email ?? "").split("@")[0] ?? "";
  const seed = hash32([...local].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 7));
  const rng = mulberry32(seed);
  const name = local.length > 0 ? maskedNameOf(rng) : "Партнёр";
  return { maskedName: name, avatar: EARNINGS_AVATARS[seed % EARNINGS_AVATARS.length] };
}

/* ── Dummy-генерация ───────────────────────────────────────────────────── */

/** Длительность шага index (мс) — детерминирована seed-ом. */
export function stepGapMs(baseSeed: number, index: number, cfg: EarningsConfig): number {
  const rng = stepRng(baseSeed, index);
  const lo = Math.max(1, cfg.minMinutes);
  const hi = Math.max(lo, cfg.maxMinutes);
  return Math.round((lo + rng() * (hi - lo)) * 60_000);
}

/** Запись шага index (или null, если шаг = пауза). ts передаёт вызывающий. */
export function entryForStep(
  baseSeed: number,
  index: number,
  cfg: EarningsConfig
): Omit<EarningEntry, "ts" | "index"> | null {
  const rng = stepRng(baseSeed, index);
  const probs = typeProbabilities(cfg.weights);
  const roll = rng();
  if (roll > probs.percent && roll > probs.cashback) return null; // пауза
  const type: EarningType = roll <= probs.percent ? "percent" : "cashback";
  const amountCents =
    type === "cashback"
      ? CASHBACK_CENTS
      : PERCENT_AMOUNTS_CENTS[Math.floor(rng() * PERCENT_AMOUNTS_CENTS.length)];
  return {
    type,
    amountCents,
    maskedName: maskedNameOf(rng),
    avatar: EARNINGS_AVATARS[Math.floor(rng() * EARNINGS_AVATARS.length)],
  };
}

/**
 * Начальный фид: `count` шагов назад от anchorTs, новейший сверху.
 * Паузные шаги пропускаются (в ленте их нет) — поэтому записей может
 * выйти меньше `count`.
 */
export function generateEarningsFeed(
  baseSeed: number,
  anchorTs: number,
  count: number,
  cfg: EarningsConfig
): EarningEntry[] {
  const entries: EarningEntry[] = [];
  let ts = anchorTs;
  for (let i = 0; i < count * 3 && entries.length < count; i += 1) {
    const step = entryForStep(baseSeed, i, cfg);
    if (step) entries.push({ ...step, index: i, ts });
    ts -= stepGapMs(baseSeed, i, cfg);
  }
  return entries;
}
