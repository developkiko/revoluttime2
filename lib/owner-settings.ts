import { dbConfigured, dbOne } from "@/lib/ultra/db";

/**
 * Настройки владельца (`owner_settings` в site_config.config, row id=1) —
 * единая точка правды для админ-API (/api/admin/site-config) и публичного
 * сайта (Фаза C: блок доходов, партнёрская структура; Фаза D: nav_pulse,
 * Фаза F: external_links). Секретов нет — публичный GET отдаёт целиком.
 *
 *   readOwnerSettings()  → текущие с дефолтами (или дефолты без БД)
 *   sanitize()           → merge PATCH-а с валидацией (использует админ-роут)
 */

export interface OwnerSettings {
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

export const OWNER_SETTINGS_DEFAULTS: Required<
  Pick<OwnerSettings, "nav_pulse" | "encyclopedia_tips_mobile" | "income_block" | "income_weights" | "external_links" | "partner_network">
> = {
  nav_pulse: {
    words: ["Энергия", "Долголетие", "Молодость", "Выносливость", "Биохакинг"],
    interval_seconds: 5,
  },
  encyclopedia_tips_mobile: false,
  income_block: {
    mode: "dummy",
    // Пусто = на сайте работает i18n-фолбэк t("title"). Непустой русский
    // текст в дефолте показывался на de/en (заголовок был русским везде).
    label: "",
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

export const OWNER_SETTINGS_LIMITS = { minMinutes: 1, maxMinutes: 300 } as const;

export function sanitizeOwnerSettings(
  next: OwnerSettings,
  current: OwnerSettings
): OwnerSettings | { error: string } {
  const out: OwnerSettings = { ...current };
  const LIMITS = OWNER_SETTINGS_LIMITS;

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

/** Читает owner_settings из БД (site_config id=1, ключ config.owner_settings
 *  — именно туда пишет админ-API) и мержит с дефолтами. Без БД — дефолты,
 *  чтобы публичный сайт всегда рендерился. */
export async function readOwnerSettings(): Promise<OwnerSettings> {
  if (!dbConfigured()) return { ...OWNER_SETTINGS_DEFAULTS };
  try {
    const row = await dbOne<{ config: Record<string, unknown> }>(
      `SELECT config FROM site_config WHERE id = 1`
    );
    const stored = (row?.config as { owner_settings?: OwnerSettings } | undefined)
      ?.owner_settings;
    return { ...OWNER_SETTINGS_DEFAULTS, ...(stored ?? {}) };
  } catch {
    return { ...OWNER_SETTINGS_DEFAULTS };
  }
}
