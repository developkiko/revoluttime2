/**
 * Demo data for the partner cabinet.
 *
 * TODO(cabinet API): replace every export below with Supabase queries
 * (tables: partners, orders, bonus_transactions, balances) once the
 * account/billing API arrives. Shapes already match the intended rows.
 */

export interface DemoPartner {
  id: string;
  name: string;
  /** Referral level I–V (owner paper plan). */
  level: "I" | "II" | "III" | "IV" | "V";
  joined: string;
  status: "active" | "pending";
  /** Earned from this partner, euro cents. */
  earnedCents: number;
}

export interface DemoPurchase {
  id: string;
  date: string;
  title: { de: string; ru: string; en: string };
  /** Quantity or people. */
  qty: number;
  amountCents: number;
  status: "delivered" | "confirmed" | "processing";
}

export interface DemoBonus {
  id: string;
  date: string;
  fromName: string;
  level: DemoPartner["level"];
  amountCents: number;
}

export const DEMO_PARTNERS: DemoPartner[] = [
  { id: "p1", name: "Мария П.", level: "I", joined: "2026-09-14", status: "active", earnedCents: 31200 },
  { id: "p2", name: "Игорь К.", level: "I", joined: "2026-10-02", status: "active", earnedCents: 18990 },
  { id: "p3", name: "Anna S.", level: "II", joined: "2026-10-20", status: "active", earnedCents: 9500 },
  { id: "p4", name: "Dmitry W.", level: "III", joined: "2026-10-25", status: "pending", earnedCents: 4500 },
  { id: "p5", name: "Lena M.", level: "II", joined: "2026-10-28", status: "active", earnedCents: 7800 },
];

export const DEMO_PURCHASES: DemoPurchase[] = [
  {
    id: "o1",
    date: "2026-10-12",
    title: { de: "10 Packungen 90 Tabletten (Partner-Bundle + 1 gratis)", ru: "10 пачек по 90 таблеток (партнёрский набор + 1 в подарок)", en: "10 packs of 90 tablets (partner bundle + 1 free)" },
    qty: 10,
    amountCents: 60000,
    status: "delivered",
  },
  {
    id: "o2",
    date: "2026-10-03",
    title: { de: "Badminton — 04.12.2026", ru: "Бадминтон — 04.12.2026", en: "Badminton — 04.12.2026" },
    qty: 3,
    amountCents: 4500,
    status: "confirmed",
  },
  {
    id: "o3",
    date: "2026-09-21",
    title: { de: "Packung 90 Tabletten", ru: "Упаковка 90 таблеток", en: "Pack of 90 tablets" },
    qty: 1,
    amountCents: 7000,
    status: "delivered",
  },
];

export const DEMO_BONUSES: DemoBonus[] = [
  { id: "b1", date: "2026-10-28", fromName: "Мария П.", level: "I", amountCents: 950 },
  { id: "b2", date: "2026-10-15", fromName: "Игорь К.", level: "I", amountCents: 570 },
  { id: "b3", date: "2026-09-30", fromName: "Anna S.", level: "II", amountCents: 285 },
  { id: "b4", date: "2026-09-18", fromName: "Lena M.", level: "II", amountCents: 234 },
];

/** Internal balance, euro cents. */
export const DEMO_BALANCE_CENTS = 8450;

/** Referral-tree demo data (code_artifact.md spec): direct partners per node.
 *  p1 → 2 subs (one with its own sub), p3 → 1 sub; p2/p4/p5 are leaves —
 *  drilling down reaches an empty bottom row at the chain end. */
export const DEMO_NETWORK_CHILDREN: Record<
  string,
  { id: string; name: string; joined: string; badge?: string }[]
> = {
  you: [
    { id: "p1", name: "Мария П.", joined: "2026-09-14", badge: "I" },
    { id: "p2", name: "Игорь К.", joined: "2026-10-02", badge: "I" },
    { id: "p3", name: "Anna S.", joined: "2026-10-20", badge: "II" },
    { id: "p4", name: "Dmitry W.", joined: "2026-10-25", badge: "III" },
    { id: "p5", name: "Lena M.", joined: "2026-10-28", badge: "II" },
  ],
  p1: [
    { id: "p1a", name: "Sophie R.", joined: "2026-10-30", badge: "I" },
    { id: "p1b", name: "Tom H.", joined: "2026-11-04", badge: "I" },
  ],
  p1a: [
    { id: "p1a1", name: "Nina K.", joined: "2026-11-09", badge: "I" },
  ],
  p3: [
    { id: "p3a", name: "Oleg V.", joined: "2026-11-06", badge: "I" },
  ],
};

export interface DemoOwnOp {
  id: string;
  date: string;
  kind: "topup" | "withdraw";
  amountCents: number;
  status: "completed" | "pending" | "cancelled";
}

/** Собственные пополнения и выводы (вкладка «Платежи» кабинета партнёра). */
export const DEMO_OWN_OPS: DemoOwnOp[] = [
  { id: "op1", date: "2026-11-18", kind: "withdraw", amountCents: 30000, status: "pending" },
  { id: "op2", date: "2026-11-02", kind: "topup", amountCents: 60000, status: "completed" },
  { id: "op3", date: "2026-10-21", kind: "withdraw", amountCents: 15000, status: "completed" },
  { id: "op4", date: "2026-09-30", kind: "topup", amountCents: 120000, status: "completed" },
  { id: "op5", date: "2026-09-12", kind: "topup", amountCents: 60000, status: "cancelled" },
];
