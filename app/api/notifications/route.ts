// ══════════════════════════════════════════════════════════════
// Уведомления (владелец 22.11 №9):
//   GET                       → { items, unread } своей сессии
//   POST {action: 'read'|'read_all', id?} → отметить прочитанным
// Категории: order/payment/friend/withdraw/system; статусы
// info/success/warning/danger. Таблица notifications (self-heal DDL).
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";

import { getSessionUser } from "@/lib/auth-session";
import { db, dbConfigured } from "@/lib/ultra/db";

export async function GET() {
  await connection();
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbConfigured()) {
    return NextResponse.json({ items: [], unread: 0, source: "unconfigured" });
  }
  try {
    const rows = await db<{
      id: string;
      category: string;
      status: string;
      title: string;
      body: string | null;
      href: string | null;
      read: boolean;
      created_at: string;
    }>(
      `SELECT id, category, status, title, body, href, read, created_at
       FROM notifications
       WHERE user_email = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [user.email]
    );
    const unread = rows.filter((row) => !row.read).length;
    return NextResponse.json({
      items: rows.map((row) => ({
        id: row.id,
        category: row.category,
        status: row.status,
        title: row.title,
        body: row.body,
        href: row.href,
        read: row.read,
        createdAt: row.created_at,
      })),
      unread,
      source: "db",
    });
  } catch (error) {
    console.error("[notifications] read failed", error);
    return NextResponse.json({ items: [], unread: 0, source: "error" });
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbConfigured()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  let body: { action?: string; id?: string } = {};
  try {
    body = (await request.json()) as { action?: string; id?: string };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    if (body.action === "read_all") {
      await db(`UPDATE notifications SET read = true WHERE user_email = $1`, [user.email]);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "read" && body.id) {
      await db(`UPDATE notifications SET read = true WHERE id = $1 AND user_email = $2`, [
        body.id,
        user.email,
      ]);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  } catch (error) {
    console.error("[notifications] write failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
