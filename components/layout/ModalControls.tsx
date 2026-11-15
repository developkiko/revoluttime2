"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/lib/products";

/** Round icon-button in the modal header, sized to the close (×) button. */
const MODAL_CTRL_CLASS =
  "flex size-8 shrink-0 items-center justify-center rounded-full border text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--text-heading)] text-xs font-bold uppercase tracking-wide";

/**
 * 3-phase language cycler for modal headers: every click advances to the
 * next site locale (de → en → ru → …) and keeps the current path. The
 * button face shows the current locale code, a tooltip names the next one.
 */
export function ModalLangButton() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const locales: readonly string[] = routing.locales;
  const next = locales[(locales.indexOf(locale) + 1) % locales.length] as (typeof routing.locales)[number];
  const names: Record<string, string> = { de: "Deutsch", ru: "Русский", en: "English" };

  return (
    <button
      type="button"
      className={MODAL_CTRL_CLASS}
      onClick={() => router.replace(pathname, { locale: next })}
      aria-label={names[next] ?? next}
      data-tip={names[next] ?? next}
      data-tip-pos="bottom"
    >
      {locale}
    </button>
  );
}

/** Light/dark toggle in the same header style (next-themes, site theme). */
export function ModalThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("header");
  // false during SSR/prerender, true after hydration — no setState (ThemeToggle).
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={MODAL_CTRL_CLASS}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t("theme")}
      data-tip={isDark ? "Light" : "Dark"}
      data-tip-pos="bottom"
    >
      {mounted ? (
        isDark ? (
          <SunIcon className="size-4" />
        ) : (
          <MoonIcon className="size-4" />
        )
      ) : (
        <MoonIcon className="size-4 opacity-0" aria-hidden />
      )}
    </button>
  );
}
