"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — LangSwitcher (улучшенный дизайн)
// Плавное переключение, красивые стили
// ══════════════════════════════════════════════════════════════

import { useI18n } from "@/lib/ultra/i18n-context";

interface LangSwitcherProps {
  mobile?: boolean;
}

export function LangSwitcher({ mobile = false }: LangSwitcherProps) {
  const { lang, setLang } = useI18n();

  return (
    <div
      className={`inline-flex items-center rounded-full p-[2px] transition-colors ${
        lang === "ru"
          ? "bg-[var(--color-primary)]/10"
          : "bg-[var(--color-accent)]/10"
      }`}
    >
      <button
        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-300 ${
          lang === "ru"
            ? "bg-[var(--color-primary)] text-white shadow-sm"
            : "text-[var(--text-muted)] hover:text-white"
        }`}
        onClick={() => setLang("ru")}
      >
        RU
      </button>
      <button
        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-300 ${
          lang === "en"
            ? "bg-[var(--color-accent)] text-white shadow-sm"
            : "text-[var(--text-muted)] hover:text-white"
        }`}
        onClick={() => setLang("en")}
      >
        EN
      </button>
    </div>
  );
}
