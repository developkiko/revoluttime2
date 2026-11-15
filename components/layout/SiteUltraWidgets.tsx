"use client";

// Ultra template widgets on RevolutTIME pages: contact FAB, PWA install
// prompt, custom cursor. They depend on the template's i18n + site-config
// contexts, so this wrapper supplies them (locale-mapped, de → en copy).

import type { ReactNode } from "react";
import { I18nProvider } from "@/lib/ultra/i18n-context";
import type { Lang } from "@/lib/ultra/i18n";
import { SiteConfigProvider } from "@/lib/ultra/site-config-context";
import { SupportFAB } from "@/components/ultra/dashboard/SupportFAB";
import PwaRegistration from "@/components/ultra/PwaRegistration";
import CustomCursor from "@/components/ultra/ui/CustomCursor";

export function SiteUltraWidgets({
  locale,
  children,
}: {
  locale: string;
  children?: ReactNode;
}) {
  const lang: Lang = locale === "ru" ? "ru" : "en";
  return (
    <I18nProvider initialLang={lang}>
      <SiteConfigProvider>
        <CustomCursor />
        <PwaRegistration />
        <SupportFAB />
        {children}
      </SiteConfigProvider>
    </I18nProvider>
  );
}
