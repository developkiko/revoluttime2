"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import type { Lang } from "@/lib/ultra/i18n";

const LANG_MODAL_KEY = "lang_modal_shown";

export default function LanguageModal() {
  const { lang, setLang, t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem(LANG_MODAL_KEY);
    if (!stored) {
      // Модалка ещё не показывалась
      setVisible(true);
      // Если текущий язык уже установлен — синхронизируем с ним
      setSelected(lang);
    }
  }, [lang]);

  const handleSelect = (l: Lang) => {
    setSelected(l);
    setLang(l);
  };

  const handleContinue = () => {
    setLang(selected);
    localStorage.setItem(LANG_MODAL_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleContinue}
      />

      {/* Modal */}
      <div className="relative bg-[var(--bg-elevated)] border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
        {/* Close button */}
        <button
          onClick={handleContinue}
          className="absolute top-4 right-4 text-gray-500 hover:text-[var(--text-heading)] transition-colors"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-[var(--text-heading)] mb-6 text-center">
          {t("lang_modal_title")}
        </h2>

        {/* Language options */}
        <div className="space-y-3">
          <button
            onClick={() => handleSelect("ru")}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-all text-left ${
              selected === "ru"
                ? "border-blue-500 bg-blue-500/10 text-white"
                : "border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-500 hover:text-white"
            }`}
          >
            <span className="text-lg font-bold text-blue-400 w-6 text-center">ru</span>
            <span className="font-medium">{t("lang_modal_lang_ru")}</span>
          </button>

          <button
            onClick={() => handleSelect("en")}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-all text-left ${
              selected === "en"
                ? "border-blue-500 bg-blue-500/10 text-white"
                : "border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-500 hover:text-white"
            }`}
          >
            <span className="text-lg font-bold text-green-400 w-6 text-center">en</span>
            <span className="font-medium">{t("lang_modal_lang_en")}</span>
          </button>
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-[var(--text-heading)] font-semibold rounded-xl transition-all"
        >
          {t("lang_modal_accept_btn")}
        </button>
      </div>
    </div>
  );
}
