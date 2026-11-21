/**
 * Динамическая кнопка навигации («Программа», Фаза D — решение владельца
 * 21.11): пул слов и интервал ротации. Модуль клиент-безопасный (без
 * серверных импортов) — дефолты отсюда берёт и серверный
 * lib/owner-settings.ts (owner_settings.nav_pulse), и клиентский триггер
 * (фолбэк, пока /api/site-config не загрузился или БД недоступна).
 */

export const NAV_PULSE_DEFAULT_WORDS = [
  "Энергия",
  "Долголетие",
  "Молодость",
  "Выносливость",
  "Биохакинг",
] as const;

export const NAV_PULSE_MIN_SECONDS = 2;
export const NAV_PULSE_MAX_SECONDS = 60;
export const NAV_PULSE_DEFAULT_INTERVAL_SECONDS = 5;

export interface NavPulseConfig {
  words: string[];
  seconds: number;
}

/** Приводит nav_pulse из owner_settings к валидному виду: слова — минимум
 *  2 непустых, интервал — 2–60 с (те же границы, что в sanitize админ-API). */
export function normalizeNavPulse(raw: unknown): NavPulseConfig {
  const rawObj = (raw ?? {}) as { words?: unknown; interval_seconds?: unknown };
  const words = Array.isArray(rawObj.words)
    ? rawObj.words
        .filter((w): w is string => typeof w === "string" && w.trim().length > 0)
        .map((w) => w.trim())
    : [];
  const seconds =
    typeof rawObj.interval_seconds === "number" && Number.isFinite(rawObj.interval_seconds)
      ? Math.min(
          NAV_PULSE_MAX_SECONDS,
          Math.max(NAV_PULSE_MIN_SECONDS, Math.round(rawObj.interval_seconds)),
        )
      : NAV_PULSE_DEFAULT_INTERVAL_SECONDS;
  return { words: words.length >= 2 ? words : [...NAV_PULSE_DEFAULT_WORDS], seconds };
}
