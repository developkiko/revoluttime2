"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — LangSwitcher (улучшенный дизайн)
// Переключение через URL-локаль (next-intl router.replace), как в шапке
// сайта: раньше менялся только локальный контекст, и после F5 язык
 // сбрасывался — исправлено (язык теперь живёт в URL /ru /en /de).
// ══════════════════════════════════════════════════════════════

import { useLocale } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";

interface LangSwitcherProps {
  mobile?: boolean;
}

export function LangSwitcher({ mobile = false }: LangSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (target: "ru" | "en") => {
    if (target === locale) return;
    router.replace(pathname, { locale: target });
  };

  return (
    <div
      className={`inline-flex items-center rounded-full p-[2px] transition-colors ${
        locale === "ru"
          ? "bg-[var(--color-primary)]/10"
          : "bg-[var(--color-accent)]/10"
      }`}
    >
      <button
        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-300 ${
          locale === "ru"
            ? "bg-[var(--color-primary)] text-white shadow-sm"
            : "text-[var(--text-muted)] hover:text-white"
        }`}
        onClick={() => switchTo("ru")}
      >
        RU
      </button>
      <button
        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-300 ${
          locale === "en"
            ? "bg-[var(--color-accent)] text-white shadow-sm"
            : "text-[var(--text-muted)] hover:text-white"
        }`}
        onClick={() => switchTo("en")}
      >
        EN
      </button>
    </div>
  );
}
