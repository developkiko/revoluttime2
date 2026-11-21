/** Внешние ссылки (Фаза F — прокси ссылок, решение владельца 21.11):
 *  режимы кнопки «активна / после таймера / без ссылки» + whitelist
 *  одобренных доменов. Конфиг живёт в owner_settings.external_links
 *  (adm-rt), сюда клиент ходит через публичный /api/site-config.
 *
 *  Файл общий для серверных роутов и клиентских компонентов — без
 *  "server-only" и node-зависимостей.
 */

export type ExternalLinksMode = "active" | "after_timer" | "no_button";

export interface ExternalLinksConfig {
  mode: ExternalLinksMode;
  /** Сколько секунд показывает страницу-предупреждение (таймер круга). */
  default_timer_seconds: number;
  /** Таймер 0 → отсчёта нет, но редирект держится эти секунды. */
  zero_wait_seconds: number;
  /** Одобренные домены (hostname или «*.domain» — точный хост или поддомен). */
  whitelist: string[];
}

export const EXTERNAL_LINKS_DEFAULTS: ExternalLinksConfig = {
  mode: "after_timer",
  default_timer_seconds: 30,
  zero_wait_seconds: 10,
  whitelist: [],
};

export const EXTERNAL_LINKS_LIMITS = {
  minTimer: 0,
  maxTimer: 300,
  minZeroWait: 0,
  maxZeroWait: 120,
  maxWhitelist: 50,
} as const;

const MODES: ExternalLinksMode[] = ["active", "after_timer", "no_button"];

/** Нормализация конфига из owner_settings (или null → дефолты). */
export function normalizeExternalLinks(raw: unknown): ExternalLinksConfig {
  const src = (raw ?? {}) as Partial<ExternalLinksConfig>;
  const mode = MODES.includes(src.mode as ExternalLinksMode)
    ? (src.mode as ExternalLinksMode)
    : EXTERNAL_LINKS_DEFAULTS.mode;
  const num = (v: unknown, fallback: number, min: number, max: number) =>
    typeof v === "number" && Number.isFinite(v)
      ? Math.min(max, Math.max(min, Math.round(v)))
      : fallback;
  const whitelist = Array.isArray(src.whitelist)
    ? [...new Set(
        src.whitelist
          .map((entry) => String(entry).trim().toLowerCase())
          .filter(Boolean)
      )].slice(0, EXTERNAL_LINKS_LIMITS.maxWhitelist)
    : [];
  return {
    mode,
    default_timer_seconds: num(
      src.default_timer_seconds,
      EXTERNAL_LINKS_DEFAULTS.default_timer_seconds,
      EXTERNAL_LINKS_LIMITS.minTimer,
      EXTERNAL_LINKS_LIMITS.maxTimer
    ),
    zero_wait_seconds: num(
      src.zero_wait_seconds,
      EXTERNAL_LINKS_DEFAULTS.zero_wait_seconds,
      EXTERNAL_LINKS_LIMITS.minZeroWait,
      EXTERNAL_LINKS_LIMITS.maxZeroWait
    ),
    whitelist,
  };
}

/** Хост из строки ссылки (null — не похоже на абсолютный http(s) URL). */
export function hostFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return parsed.hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** Хост одобрен? Точное совпадение или поддомен ("youtube.com" →
 *  "www.youtube.com" да, "notyoutube.com" нет). */
export function hostAllowed(host: string, whitelist: string[]): boolean {
  return whitelist.some(
    (entry) => host === entry || host.endsWith(`.${entry}`)
  );
}

/** Проверка ссылки для страницы-предупреждения: абсолютный http(s),
 *  не наш собственный хост. Whitelist проверяется отдельно (в роуте),
 *  потому что там нужно знать и текущий origin. */
export function isExternalHttpUrl(url: string, ownHosts: string[] = []): boolean {
  const host = hostFromUrl(url);
  if (!host) return false;
  return !ownHosts.some((own) => host === own || host.endsWith(`.${own}`));
}

/** Путь на страницу-предупреждение для данного языка. */
export function buildRedirectPath(lang: string, url: string): string {
  return `/${lang}/redirect?url=${encodeURIComponent(url)}`;
}
