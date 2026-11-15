// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — API route: /api/payment/init
// Создание запроса на оплату + уведомление админов
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { broadcastMessage, formatPaymentRequest } from "@/lib/ultra/telegram";
import { kvGetJson } from "@/lib/ultra/kv";
import { sessionFromRequest } from "@/lib/ultra/session";

const ADMIN_API = process.env.ADMIN_API_URL || "https://admin.ultra-proxy.pro";
const INTERNAL_API_SECRET = (process.env.INTERNAL_API_SECRET || "").trim();

// Cryptographically strong session id (Math.random is predictable).
function generateSessionId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

async function getAdminIds(): Promise<string[]> {
  const list = await kvGetJson<(string | number)[]>("admin_chat_ids", []);
  return list.map(String);
}

export async function POST(request: NextRequest) {
  try {
    // Платёж создаётся только для владельца серверной сессии
    const session = await sessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Требуется вход в аккаунт" }, { status: 401 });
    }
    const email = session.email.toLowerCase();

    const body = await request.json();
    const { amount } = body;

    if (typeof amount !== "number" || amount < 10 || amount > 100000) {
      return NextResponse.json(
        { error: "Сумма должна быть от 10 до 100 000 USDT" },
        { status: 400 }
      );
    }

    const session_id = generateSessionId();
    const validityHours = 24;
    const expires_at = new Date(Date.now() + validityHours * 3600 * 1000).toISOString();

    // Create payment request in admin (same CF KV)
    const res = await fetch(`${ADMIN_API}/api/payment/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_API_SECRET ? { "x-internal-secret": INTERNAL_API_SECRET } : {}),
      },
      body: JSON.stringify({
        session_id,
        email: email.toLowerCase(),
        amount,
        expires_at,
      }),
    });

    if (!res.ok) {
      let errText = "Admin API returned " + res.status;
      try {
        const err = await res.json();
        errText = err.error || errText;
      } catch {}
      return NextResponse.json({ error: errText }, { status: 502 });
    }

    let adminRecord: any = {};
    try {
      adminRecord = await res.json();
    } catch {
      return NextResponse.json({ error: "Invalid admin response" }, { status: 502 });
    }

    // Admin already sets url from default_url config → go straight to "ready"
    const record = adminRecord.record || {};
    const url = record.url || null;
    const status = record.status || "pending";

    // Notify all admins via Telegram (тот же admin_chat_ids в KV)
    const adminIds = await getAdminIds();
    if (adminIds.length > 0) {
      const msg = formatPaymentRequest({
        email: email.toLowerCase(),
        amount,
        session_id,
      });
      await broadcastMessage(adminIds, msg);
    }

    return NextResponse.json({
      success: true,
      session_id,
      expires_at,
      url,
      status,
    });
  } catch (err: any) {
    console.error("[payment/init] Error:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
