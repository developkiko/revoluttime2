"use client";

// Ultra template widgets on RevolutTIME pages: contact FAB, PWA install
// prompt, custom cursor. They depend on the template's i18n + site-config
// contexts, so this wrapper supplies them (locale-mapped, de → en copy).
// The PWA prompt and children (CookieBanner) are laid out together in the
// fixed .rt-bottom-widgets row/stack; CustomCursor stays outside so it keeps
// its own top-level stacking context (above toasts, spec ui.md §4).

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
        <SupportFAB />
        <div className="rt-bottom-widgets">
          <PwaRegistration />
          {children}
        </div>
      </SiteConfigProvider>
    </I18nProvider>
  );
}
