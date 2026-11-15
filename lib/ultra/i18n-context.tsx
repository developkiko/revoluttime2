"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — React-контекст для языка
// ══════════════════════════════════════════════════════════════

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Lang } from "./i18n";
import { t as translate, detectLang, fetchGeoLang } from "./i18n";

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "ru",
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({
  children,
  initialLang,
}: {
  children: ReactNode;
  /** Locale from the URL ([lang] segment) — beats browser/geo detection. */
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang ?? "ru");

  useEffect(() => {
    // URL locale decides; no browser/geo sniffing on our domain.
    if (initialLang) return;
    const initial = detectLang();
    setLangState(initial);
    if (!localStorage.getItem("ultra_proxy_lang")) {
      fetchGeoLang().then((geoLang) => {
        if (!localStorage.getItem("ultra_proxy_lang")) {
          setLangState(geoLang);
        }
      });
    }
  }, [initialLang]);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("ultra_proxy_lang", newLang);
  }, []);

  const t = useCallback(
    (key: string) => translate(lang, key),
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
