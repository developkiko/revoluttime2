import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db, dbConfigured, dbOne } from "@/lib/ultra/db";
import {
  OWNER_SETTINGS_DEFAULTS,
  sanitizeOwnerSettings,
  type OwnerSettings,
} from "@/lib/owner-settings";

/**
 * Админ-API настроек владельца для adm-rt. Хранятся в site_config.config
 * (row id=1) под ключом `owner_settings`; типы, дефолты и валидация живут
 * в lib/owner-settings.ts (тот же источник у публичного /api/site-config).
 *
 *   GET   → { ownerSettings } (текущие, с дефолтами)
 *   PATCH → { ownerSettings: {…} } — merge по верхнему уровню + валидация
 */

async function readConfig(): Promise<Record<string, unknown>> {
  const row = await dbOne<{ config: Record<string, unknown> }>(
    `SELECT config FROM site_config WHERE id = 1`
  );
  return row?.config ?? {};
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbConfigured()) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  try {
    const config = await readConfig();
    return NextResponse.json({
      ownerSettings: {
        ...OWNER_SETTINGS_DEFAULTS,
        ...(config.owner_settings as OwnerSettings | undefined),
      },
    });
  } catch (error) {
    console.error("[admin/site-config] read failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbConfigured()) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });

  let body: { ownerSettings?: OwnerSettings } = {};
  try {
    body = (await request.json()) as { ownerSettings?: OwnerSettings };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!body.ownerSettings || typeof body.ownerSettings !== "object") {
    return NextResponse.json({ error: "ownerSettings_required" }, { status: 400 });
  }

  try {
    const config = await readConfig();
    const current = { ...OWNER_SETTINGS_DEFAULTS, ...(config.owner_settings as OwnerSettings | undefined) };
    const merged = sanitizeOwnerSettings(body.ownerSettings, current);
    if ("error" in merged) {
      return NextResponse.json({ error: merged.error }, { status: 400 });
    }
    const nextConfig = { ...config, owner_settings: merged };
    await db(
      `INSERT INTO site_config (id, config) VALUES (1, $1::jsonb)
       ON CONFLICT (id) DO UPDATE SET config = $1::jsonb`,
      [JSON.stringify(nextConfig)]
    );
    return NextResponse.json({ ok: true, ownerSettings: merged });
  } catch (error) {
    console.error("[admin/site-config] patch failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
