// ══════════════════════════════════════════════════════════════
// CRUD видеозаписей site_videos для админки adm-rt (Фаза B):
//   GET              → все видео и записи стримов (новые сверху)
//   POST             → создать вручную {title, url, provider?, kind?, …} —
//                      для YouTube-ссылок и Blob-URL, загруженных мимо
//                      upload-роута (сам файл грузится через
//                      /api/admin/videos/upload, который сам создаёт запись)
//   PATCH            → обновить {id, title?, description?, kind?, on_home?,
//                      home_until?, poster?, active?, …}
//   DELETE {id}      → удалить запись (сам Blob-файл остаётся в сторе —
//                      чистится через dashboard/CLI при необходимости)
// Auth: Bearer adm_api-токен (бридж /api/admin/ticket) или админ-сессия сайта.
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { corsHeaders } from "@/lib/ultra/cors";
import { db, dbConfigured, dbOne } from "@/lib/ultra/db";
import { youtubeIdFromUrl } from "@/lib/videos";

const PROVIDERS = new Set(["blob", "youtube"]);
const KINDS = new Set(["video", "stream"]);

/** YouTube-ссылку нормализуем сразу до canonical /embed/<id>. */
function normalizeVideoUrl(
  url: string,
  provider: string
): { ok: true; url: string } | { ok: false; error: string } {
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 2048) return { ok: false, error: "bad_url" };
  if (provider === "youtube") {
    const id = youtubeIdFromUrl(trimmed);
    if (!id) return { ok: false, error: "bad_youtube_url" };
    return { ok: true, url: `https://www.youtube.com/embed/${id}` };
  }
  // Blob-ссылки должны вести на *.blob.vercel-storage.com (защита от
  // произвольных ссылок в плеере сайта).
  if (!/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(trimmed)) {
    return { ok: false, error: "bad_blob_url" };
  }
  return { ok: true, url: trimmed };
}

interface VideoFields {
  title?: string;
  description?: string;
  provider?: string;
  url?: string;
  kind?: string;
  on_home?: boolean;
  home_until?: string | null;
  poster?: string | null;
  duration_seconds?: number | null;
  active?: boolean;
}

/** Валидация общих полей записи (title/kind/duration/home_until). */
function validateFields(
  body: VideoFields
): { ok: false; error: string } | { ok: true } {
  if (body.title !== undefined) {
    const title = body.title.trim();
    if (title.length < 2 || title.length > 200) {
      return { ok: false, error: "title_required" };
    }
  }
  if (body.kind !== undefined && !KINDS.has(body.kind)) {
    return { ok: false, error: "bad_kind" };
  }
  if (body.duration_seconds !== undefined && body.duration_seconds !== null) {
    if (
      !Number.isInteger(body.duration_seconds) ||
      body.duration_seconds < 0 ||
      body.duration_seconds > 86400
    ) {
      return { ok: false, error: "bad_duration" };
    }
  }
  if (body.home_until !== undefined && body.home_until !== null) {
    const d = new Date(body.home_until);
    if (Number.isNaN(d.getTime())) {
      return { ok: false, error: "bad_home_until" };
    }
  }
  return { ok: true };
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
    const rows = await db(
      `SELECT id, title, description, provider, url, kind, on_home, home_until,
              poster, duration_seconds, size_bytes, content_type, active, created_at
       FROM site_videos ORDER BY created_at DESC LIMIT 200`
    );
    return NextResponse.json({ videos: rows });
  } catch (error) {
    console.error("[admin/videos] read failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbConfigured()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  let body: VideoFields = {};
  try {
    body = (await request.json()) as VideoFields;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const provider = body.provider ?? "youtube";
  const kind = body.kind ?? "video";
  if (title.length < 2) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }
  if (!PROVIDERS.has(provider) || !KINDS.has(kind)) {
    return NextResponse.json({ error: "bad_provider" }, { status: 400 });
  }
  if (!body.url) {
    return NextResponse.json({ error: "url_required" }, { status: 400 });
  }

  const url = normalizeVideoUrl(body.url, provider);
  if (!url.ok) {
    return NextResponse.json({ error: url.error }, { status: 400 });
  }

  const check = validateFields(body);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  try {
    const inserted = await dbOne(
      `INSERT INTO site_videos (title, description, provider, url, kind,
                                on_home, home_until, poster, duration_seconds, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, title`,
      [
        title,
        body.description?.trim() || null,
        provider,
        url.url,
        kind,
        body.on_home ?? false,
        body.home_until ? new Date(body.home_until).toISOString() : null,
        body.poster ?? null,
        body.duration_seconds ?? null,
        body.active ?? true,
      ]
    );
    return NextResponse.json({ ok: true, id: inserted?.id ?? null });
  } catch (error) {
    console.error("[admin/videos] insert failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbConfigured()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  let body: VideoFields & { id?: string } = {};
  try {
    body = (await request.json()) as VideoFields & { id?: string };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id_required" }, { status: 400 });

  const check = validateFields(body);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  // URL меняется только вместе с провайдером, чтобы не смешивать типы ссылок.
  let urlValue: string | undefined;
  if (body.url !== undefined) {
    let provider = body.provider;
    if (!provider) {
      const current = await dbOne<{ provider: string }>(
        `SELECT provider FROM site_videos WHERE id = $1`,
        [body.id]
      );
      if (!current) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      provider = current.provider;
    }
    if (!PROVIDERS.has(provider)) {
      return NextResponse.json({ error: "bad_provider" }, { status: 400 });
    }
    const url = normalizeVideoUrl(body.url, provider);
    if (!url.ok) {
      return NextResponse.json({ error: url.error }, { status: 400 });
    }
    urlValue = url.url;
  }

  const sets: string[] = [];
  const values: unknown[] = [];
  let n = 1;
  const push = (clause: string, value: unknown) => {
    sets.push(`${clause} = $${n++}`);
    values.push(value);
  };

  if (body.title !== undefined) push("title", body.title.trim());
  if (body.description !== undefined) push("description", body.description?.trim() || null);
  if (body.kind !== undefined) push("kind", body.kind);
  if (urlValue !== undefined) push("url", urlValue);
  if (body.on_home !== undefined) push("on_home", body.on_home);
  if (body.home_until !== undefined) {
    push("home_until", body.home_until ? new Date(body.home_until).toISOString() : null);
  }
  if (body.poster !== undefined) push("poster", body.poster?.trim() || null);
  if (body.duration_seconds !== undefined) push("duration_seconds", body.duration_seconds);
  if (body.active !== undefined) push("active", body.active);
  push("updated_at", new Date().toISOString());

  if (sets.length === 1) {
    // Только updated_at — нечего менять.
    return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
  }

  try {
    await db(`UPDATE site_videos SET ${sets.join(", ")} WHERE id = $${n}`, [
      ...values,
      body.id,
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/videos] update failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbConfigured()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  let body: { id?: string } = {};
  try {
    body = (await request.json()) as { id?: string };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id_required" }, { status: 400 });

  try {
    await db(`DELETE FROM site_videos WHERE id = $1`, [body.id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/videos] delete failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
