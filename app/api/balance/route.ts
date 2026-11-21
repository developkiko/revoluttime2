// ══════════════════════════════════════════════════════════════
// Текущий баланс сессии (владелец 22.11, №10): блок баланса в
// юзер-пилюле шапки. Источник — users.balance (реальные пополнения
// пишутся в ultra-стек). Анонимам 401.
// ══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth-session";
import { dbConfigured, dbOne } from "@/lib/ultra/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbConfigured()) {
    return NextResponse.json({ balanceCents: null, source: "unconfigured" });
  }
  try {
    const row = await dbOne<{ balance: number | null }>(
      `SELECT balance FROM users WHERE email = $1`,
      [user.email]
    );
    const balance = row?.balance;
    return NextResponse.json({
      // balance хранится в евро (double precision) → отдаём в центах.
      balanceCents: balance != null ? Math.round(Number(balance) * 100) : null,
      source: "db",
    });
  } catch (error) {
    console.error("[balance] read failed", error);
    return NextResponse.json({ balanceCents: null, source: "error" });
  }
}
