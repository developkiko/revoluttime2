// ══════════════════════════════════════════════════════════════
// CRUD галереи (владелец 22.11 №6): альбомы + элементы (фото/видео).
//   GET                    → { albums, items } — всё для админки
//   POST                   → создать: album {title, slug?, description?}
//                             или item {albumId, type, url, title?, poster?}
//   PATCH                  → {id, kind, …поля}
//   DELETE {id, kind}      → удалить album (каскад) или item
// Slug-файлы (Blob) грузятся через /api/admin/videos/upload (videos/ и
// теперь images/). Auth: Bearer adm_api или админ-сессия сайта.
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { corsHeaders } from "@/lib/ultra/cors";
import { db, dbConfigured, dbOne } from "@/lib/ultra/db";

const KINDS = new Set(["album", "item"]);
const TYPES = new Set(["photo", "video"]);

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || `album-${Date.now()}`
  );
}

export async function OPTIONS(request: NextRequest) {
  const headers = corsHeaders(request);
  headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type";
  return new NextResponse(null, { status: 200, headers });
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbConfigured()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
  try {
    const albums = await db(
      `SELECT * FROM gallery_albums ORDER BY sort, created_at DESC LIMIT 100`
    );
    const items = await db(
      `SELECT * FROM gallery_items ORDER BY sort, created_at DESC LIMIT 500`
    );
    return NextResponse.json({ albums, items });
  } catch (error) {
    console.error("[admin/gallery] read failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbConfigured()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  let body: {
    kind?: string;
    title?: string;
    slug?: string;
    description?: string;
    albumId?: string;
    type?: string;
    url?: string;
    poster?: string;
    cover?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    if (body.kind === "album") {
      const title = (body.title ?? "").trim();
      if (title.length < 2) {
        return NextResponse.json({ error: "title_required" }, { status: 400 });
      }
      const slug = slugify(body.slug?.trim() || title);
      const inserted = await dbOne<{ id: string }>(
        `INSERT INTO gallery_albums (title, slug, description, cover)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
         RETURNING id`,
        [title, slug, body.description?.trim() || null, body.cover ?? null]
      );
      return NextResponse.json({ ok: true, id: inserted?.id ?? null });
    }

    if (body.kind === "item") {
      if (!body.albumId || !body.url || !TYPES.has(body.type ?? "photo")) {
        return NextResponse.json({ error: "item_fields_required" }, { status: 400 });
      }
      const inserted = await dbOne<{ id: string }>(
        `INSERT INTO gallery_items (album_id, title, type, url, poster)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          body.albumId,
          body.title?.trim() || null,
          body.type ?? "photo",
          body.url,
          body.poster ?? null,
        ]
      );
      return NextResponse.json({ ok: true, id: inserted?.id ?? null });
    }

    return NextResponse.json({ error: "kind_required" }, { status: 400 });
  } catch (error) {
    console.error("[admin/gallery] write failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbConfigured()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  let body: {
    id?: string;
    kind?: string;
    title?: string;
    description?: string;
    active?: boolean;
    sort?: number;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!body.id || !KINDS.has(body.kind ?? "")) {
    return NextResponse.json({ error: "id_kind_required" }, { status: 400 });
  }
  const table = body.kind === "album" ? "gallery_albums" : "gallery_items";

  const sets: string[] = [];
  const values: unknown[] = [];
  let n = 1;
  const push = (clause: string, value: unknown) => {
    sets.push(`${clause} = $${n++}`);
    values.push(value);
  };
  if (body.title !== undefined) push("title", body.title.trim());
  if (body.description !== undefined) push("description", body.description?.trim() || null);
  if (body.active !== undefined) push("active", body.active);
  if (body.sort !== undefined) push("sort", Math.max(0, Math.round(body.sort)));
  if (sets.length === 0) {
    return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
  }

  try {
    await db(`UPDATE ${table} SET ${sets.join(", ")} WHERE id = $${n}`, [
      ...values,
      body.id,
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/gallery] update failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbConfigured()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  let body: { id?: string; kind?: string } = {};
  try {
    body = (await request.json()) as { id?: string; kind?: string };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!body.id || !KINDS.has(body.kind ?? "")) {
    return NextResponse.json({ error: "id_kind_required" }, { status: 400 });
  }
  const table = body.kind === "album" ? "gallery_albums" : "gallery_items";

  try {
    await db(`DELETE FROM ${table} WHERE id = $1`, [body.id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/gallery] delete failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
