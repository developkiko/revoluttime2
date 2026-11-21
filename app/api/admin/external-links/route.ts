// ══════════════════════════════════════════════════════════════
// Управление whitelist'ом внешних ссылок (Фаза F — прокси ссылок):
//   GET                        → текущий whitelist
//   POST {url, action}         → allow (домен в whitelist) | deny (убрать)
// Пишет в site_config.owner_settings.external_links.whitelist (row id=1) —
// тот же механизм, что у /api/admin/site-config PATCH.
// Auth: Bearer adm_api-токен или админ-сессия сайта.
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { corsHeaders } from "@/lib/ultra/cors";
import { db, dbConfigured, dbOne } from "@/lib/ultra/db";
import { hostFromUrl } from "@/lib/external-links";

export async function OPTIONS(request: NextRequest) {
  const headers = corsHeaders(request);
  headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type";
  return new NextResponse(null, { status: 200, headers });
}

async function readWhitelist(): Promise<string[]> {
  const row = await dbOne<{ config: Record<string, unknown> }>(
    `SELECT config FROM site_config WHERE id = 1`
  );
  const stored = row?.config as
    | { owner_settings?: { external_links?: { whitelist?: string[] } } }
    | undefined;
  const whitelist = stored?.owner_settings?.external_links?.whitelist;
  return Array.isArray(whitelist) ? whitelist.map(String) : [];
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbConfigured()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
  try {
    return NextResponse.json({ whitelist: await readWhitelist() });
  } catch (error) {
    console.error("[admin/external-links] read failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbConfigured()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  let body: { url?: string; action?: string } = {};
  try {
    body = (await request.json()) as { url?: string; action?: string };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const host = body.url ? hostFromUrl(body.url) : null;
  if (!host) {
    return NextResponse.json({ error: "bad_url" }, { status: 400 });
  }
  if (body.action !== "allow" && body.action !== "deny") {
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  }

  try {
    const current = await readWhitelist();
    // Хост нормализуем до hostname; permit-записи без пути.
    const next =
      body.action === "allow"
        ? [...new Set([...current, host])]
        : current.filter((entry) => entry !== host);

    const row = await dbOne<{ config: Record<string, unknown> }>(
      `SELECT config FROM site_config WHERE id = 1`
    );
    const config = row?.config ?? {};
    const ownerSettings = (config.owner_settings as object) ?? {};
    const nextConfig = {
      ...config,
      owner_settings: {
        ...ownerSettings,
        external_links: {
          ...(ownerSettings as { external_links?: object }).external_links,
          whitelist: next,
        },
      },
    };
    await db(
      `INSERT INTO site_config (id, config) VALUES (1, $1::jsonb)
       ON CONFLICT (id) DO UPDATE SET config = $1::jsonb`,
      [JSON.stringify(nextConfig)]
    );
    return NextResponse.json({ ok: true, whitelist: next });
  } catch (error) {
    console.error("[admin/external-links] write failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
