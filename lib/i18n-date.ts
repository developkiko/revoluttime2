/** Локаль Intl для страниц: url-локаль (de/ru/en) → BCP-47. */
export function dateLocaleFor(lang: string): string {
  return lang === "de" ? "de-DE" : lang === "ru" ? "ru-RU" : "en-US";
}
