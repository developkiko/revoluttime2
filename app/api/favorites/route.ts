// ══════════════════════════════════════════════════════════════
// Избранное (Фаза G): синк для авторизованных.
//   GET                    → { favorites: [id, …] } своей сессии
//   POST {id, action}      → add | remove (id — идентификатор записи,
//                            например uuid видео из site_videos)
// Хранение: users.favorites (jsonb, self-heal DDL). Неавторизованных
// держит клиент в localStorage — сюда они не ходят.
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth-session";
import { db, dbConfigured, dbOne } from "@/lib/ultra/db";

async function readFavorites(email: string): Promise<string[]> {
  const row = await dbOne<{ favorites: string[] | null }>(
    `SELECT favorites FROM users WHERE email = $1`,
    [email]
  );
  const list = row?.favorites;
  return Array.isArray(list) ? list.map(String) : [];
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbConfigured()) {
    return NextResponse.json({ favorites: [], source: "unconfigured" });
  }
  try {
    return NextResponse.json({ favorites: await readFavorites(user.email) });
  } catch (error) {
    console.error("[favorites] read failed", error);
    return NextResponse.json({ favorites: [], source: "error" });
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbConfigured()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  let body: { id?: string; action?: string } = {};
  try {
    body = (await request.json()) as { id?: string; action?: string };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const id = (body.id ?? "").trim();
  if (!id || id.length > 128) {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }
  if (body.action !== "add" && body.action !== "remove") {
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  }

  try {
    const current = await readFavorites(user.email);
    const next =
      body.action === "add"
        ? [...new Set([...current, id])]
        : current.filter((entry) => entry !== id);
    await db(`UPDATE users SET favorites = $1::jsonb WHERE email = $2`, [
      JSON.stringify(next),
      user.email,
    ]);
    return NextResponse.json({ ok: true, favorites: next });
  } catch (error) {
    console.error("[favorites] write failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
