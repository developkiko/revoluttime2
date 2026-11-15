// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — API route: /api/payment/status/[session_id]
// Проверка статуса платёжной сессии
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

const WORKER_URL = process.env.CF_WORKER_URL || process.env.ADMIN_API_URL || "https://admin.ultra-proxy.pro";
const INTERNAL_API_SECRET = (process.env.INTERNAL_API_SECRET || "").trim();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ session_id: string }> }
) {
  try {
    const { session_id } = await params;

    if (!session_id) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const res = await fetch(`${WORKER_URL}/api/payment/request?session_id=${encodeURIComponent(session_id)}`, {
      cache: "no-store",
      headers: INTERNAL_API_SECRET ? { "x-internal-secret": INTERNAL_API_SECRET } : undefined,
    });

    // Missing/expired session: 200 so client polling doesn't spam console 404
    if (!res.ok) {
      let status = "expired";
      try {
        const err = await res.json();
        status = err.status || err.error || "expired";
      } catch { /* */ }
      return NextResponse.json({ status: typeof status === "string" ? status : "expired" });
    }

    const record = await res.json();

    return NextResponse.json({
      status: record.status || "pending",
      url: record.url,
      amount: record.amount,
      expires_at: record.expires_at,
    });
  } catch (err: any) {
    console.error("[payment/status] Error:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
