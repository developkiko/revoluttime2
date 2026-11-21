import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db, dbConfigured, dbOne } from "@/lib/ultra/db";

/**
 * Админ-API настроек владельца для adm-rt. Хранятся в site_config.config
 * (row id=1) под ключом `owner_settings` — единая точка правды для:
 *  • nav_pulse: пул слов динамической кнопки меню + интервал смены
 *  • encyclopedia_tips_mobile: типсы энциклопедии на тач-устройствах
 *  • income_block: блок «Зарабатывают уже сейчас» (real/dummy, интервалы)
 *  • income_weights: веса типов поступлений dummy-режима (сумма ≤ 100 %)
 *  • external_links: режим кнопки перехода, таймер, белый список
 *  • partner_network: демо/реальная структура
 *
 *   GET   → { ownerSettings } (текущие, с дефолтами)
 *   PATCH → { ownerSettings: {…} } — merge по верхнему уровню + валидация
 */

interface OwnerSettings {
  nav_pulse?: { words?: string[]; interval_seconds?: number };
  encyclopedia_tips_mobile?: boolean;
  income_block?: {
    mode?: "real" | "dummy";
    label?: string;
    interval_min_minutes?: number;
    interval_max_minutes?: number;
  };
  income_weights?: Record<string, number>;
  external_links?: {
    mode?: "active" | "after_timer" | "no_button";
    default_timer_seconds?: number;
    zero_wait_seconds?: number;
    whitelist?: string[];
  };
  partner_network?: { mode?: "demo" | "real" };
}

const DEFAULTS: OwnerSettings = {
  nav_pulse: {
    words: ["Энергия", "Долголетие", "Молодость", "Выносливость", "Биохакинг"],
    interval_seconds: 5,
  },
  encyclopedia_tips_mobile: false,
  income_block: {
    mode: "dummy",
    label: "Зарабатывают уже сейчас",
    interval_min_minutes: 2,
    interval_max_minutes: 15,
  },
  income_weights: { cashback: 40, percent: 35, pause: 25 },
  external_links: {
    mode: "after_timer",
    default_timer_seconds: 30,
    zero_wait_seconds: 10,
    whitelist: [],
  },
  partner_network: { mode: "demo" },
};

const LIMITS = { minMinutes: 1, maxMinutes: 300 } as const;

function sanitize(next: OwnerSettings, current: OwnerSettings): OwnerSettings | { error: string } {
  const out: OwnerSettings = { ...current };

  if (next.nav_pulse) {
    const words = next.nav_pulse.words;
    if (words !== undefined) {
      if (!Array.isArray(words) || words.length < 2 || words.some((w) => !w.trim())) {
        return { error: "nav_pulse.words: минимум 2 непустых слова" };
      }
      out.nav_pulse = { ...out.nav_pulse, words: words.map((w) => w.trim()) };
    }
    const interval = next.nav_pulse.interval_seconds;
    if (interval !== undefined) {
      if (!Number.isFinite(interval) || interval < 2 || interval > 60) {
        return { error: "nav_pulse.interval_seconds: 2–60" };
      }
      out.nav_pulse = { ...out.nav_pulse, interval_seconds: interval };
    }
  }

  if (next.encyclopedia_tips_mobile !== undefined) {
    out.encyclopedia_tips_mobile = next.encyclopedia_tips_mobile === true;
  }

  if (next.income_block) {
    const merged = { ...out.income_block, ...next.income_block };
    if (!["real", "dummy"].includes(merged.mode ?? "dummy")) {
      return { error: "income_block.mode: real|dummy" };
    }
    const lo = merged.interval_min_minutes ?? 2;
    const hi = merged.interval_max_minutes ?? 15;
    if (lo < LIMITS.minMinutes || hi > LIMITS.maxMinutes || lo > hi) {
      return { error: `income_block.interval: ${LIMITS.minMinutes}–${LIMITS.maxMinutes} мин, min ≤ max` };
    }
    out.income_block = merged as NonNullable<OwnerSettings["income_block"]>;
  }

  if (next.income_weights) {
    const sum = Object.values(next.income_weights).reduce((a, b) => a + Number(b) || 0, 0);
    if (sum > 100) return { error: "income_weights: сумма весов не может превышать 100 %" };
    out.income_weights = next.income_weights;
  }

  if (next.external_links) {
    const merged = { ...out.external_links, ...next.external_links };
    if (!["active", "after_timer", "no_button"].includes(merged.mode ?? "after_timer")) {
      return { error: "external_links.mode: active|after_timer|no_button" };
    }
    if (merged.default_timer_seconds !== undefined && merged.default_timer_seconds < 0) {
      return { error: "external_links.default_timer_seconds ≥ 0" };
    }
    if (!Array.isArray(merged.whitelist)) return { error: "external_links.whitelist: массив доменов" };
    out.external_links = merged as NonNullable<OwnerSettings["external_links"]>;
  }

  if (next.partner_network) {
    if (!["demo", "real"].includes(next.partner_network.mode ?? "demo")) {
      return { error: "partner_network.mode: demo|real" };
    }
    out.partner_network = { ...out.partner_network, ...next.partner_network };
  }

  return out;
}

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
      ownerSettings: { ...DEFAULTS, ...(config.owner_settings as OwnerSettings | undefined) },
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
    const current = { ...DEFAULTS, ...(config.owner_settings as OwnerSettings | undefined) };
    const merged = sanitize(body.ownerSettings, current);
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
