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
  /** Referral level A–F. */
  level: "A" | "B" | "C" | "D" | "E" | "F";
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
  { id: "p1", name: "Мария П.", level: "A", joined: "2026-09-14", status: "active", earnedCents: 31200 },
  { id: "p2", name: "Игорь К.", level: "A", joined: "2026-10-02", status: "active", earnedCents: 18990 },
  { id: "p3", name: "Anna S.", level: "B", joined: "2026-10-20", status: "active", earnedCents: 9500 },
  { id: "p4", name: "Dmitry W.", level: "C", joined: "2026-10-25", status: "pending", earnedCents: 4500 },
  { id: "p5", name: "Lena M.", level: "B", joined: "2026-10-28", status: "active", earnedCents: 7800 },
];

export const DEMO_PURCHASES: DemoPurchase[] = [
  {
    id: "o1",
    date: "2026-10-12",
    title: { de: "Packung 120 Tabletten + Box", ru: "Упаковка 120 таблеток + бокс", en: "Pack of 120 tablets + box" },
    qty: 2,
    amountCents: 4998,
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
    amountCents: 1899,
    status: "delivered",
  },
];

export const DEMO_BONUSES: DemoBonus[] = [
  { id: "b1", date: "2026-10-28", fromName: "Мария П.", level: "A", amountCents: 950 },
  { id: "b2", date: "2026-10-15", fromName: "Игорь К.", level: "A", amountCents: 570 },
  { id: "b3", date: "2026-09-30", fromName: "Anna S.", level: "B", amountCents: 285 },
  { id: "b4", date: "2026-09-18", fromName: "Lena M.", level: "B", amountCents: 234 },
];

/** Internal balance, euro cents. */
export const DEMO_BALANCE_CENTS = 8450;
