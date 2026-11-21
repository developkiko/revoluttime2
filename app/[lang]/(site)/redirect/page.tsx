import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";

import { RedirectGate } from "@/components/layout/RedirectGate";
import {
  hostAllowed,
  hostFromUrl,
  isExternalHttpUrl,
} from "@/lib/external-links";
import { readOwnerSettings } from "@/lib/owner-settings";

export async function generateMetadata(
  props: PageProps<"/[lang]/redirect">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "meta.redirect" });
  return { title: t("title"), description: t("description"), robots: { index: false } };
}

/** Свои хосты (чтобы /redirect не зациклился на внутренних ссылках). */
function ownHosts(headerHost: string): string[] {
  return [
    headerHost,
    "revolut-time.vercel.app",
    "revoluttime.de",
    "www.revoluttime.de",
    "localhost",
  ].filter(Boolean);
}

/**
 * Страница-предупреждение перед внешним переходом (Фаза F, решение
 * владельца 21.11): режим after_timer ведёт сюда из ExternalLink.
 * Таймер из owner_settings.external_links (default_timer_seconds);
 * таймер 0 → пауза zero_wait_seconds без круга. Непустой whitelist —
 * не одобренные домены не перенаправляются автоматически.
 */
export default async function RedirectPage({
  params,
  searchParams,
}: PageProps<"/[lang]/redirect">) {
  const { lang } = await params;
  const { url: rawUrl } = await searchParams;
  setRequestLocale(lang);
  const t = await getTranslations("redirect");

  const headerList = await headers();
  const host = headerList.get("host") ?? "";
  const url = typeof rawUrl === "string" ? rawUrl : "";
  const valid = Boolean(url) && isExternalHttpUrl(url, ownHosts(host));

  const ownerSettings = await readOwnerSettings();
  const cfg = ownerSettings.external_links;
  const timer =
    typeof cfg?.default_timer_seconds === "number"
      ? Math.max(0, Math.round(cfg.default_timer_seconds))
      : 30;
  const zeroWait =
    typeof cfg?.zero_wait_seconds === "number"
      ? Math.max(0, Math.round(cfg.zero_wait_seconds))
      : 10;

  const domain = valid ? hostFromUrl(url) : null;
  const whitelist = Array.isArray(cfg?.whitelist) ? (cfg?.whitelist as string[]) : [];
  // Пустой whitelist = владелец ещё не курировал — пропускаем всех.
  const approved =
    valid && (whitelist.length === 0 || (domain ? hostAllowed(domain, whitelist) : false));

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20">
      {valid ? (
        <RedirectGate
          url={url}
          seconds={timer > 0 ? timer : zeroWait}
          showCircle={timer > 0}
          approved={approved}
        />
      ) : (
        <div className="mx-auto max-w-md text-center text-sm text-muted-foreground">
          {t("invalidLink")}
        </div>
      )}
    </section>
  );
}
