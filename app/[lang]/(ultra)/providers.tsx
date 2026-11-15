"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — Providers: оборачивает все контексты
// ══════════════════════════════════════════════════════════════

import React, { type ReactNode } from "react";
import { I18nProvider } from "@/lib/ultra/i18n-context";
import { AuthProvider } from "@/lib/ultra/auth-store";
import { ToastProvider } from "@/components/ultra/ui/Toast";
import { ModalEngineProvider } from "@/components/ultra/ui/ModalEngine";
import { SiteConfigProvider } from "@/lib/ultra/site-config-context";
import { HeartbeatBridge } from "@/lib/ultra/use-heartbeat";
import type { Lang } from "@/lib/ultra/i18n";

export function Providers({
  children,
  initialLang,
}: {
  children: ReactNode;
  /** URL locale wins over browser/geo detection (de → en fallback). */
  initialLang?: Lang;
}) {
  return (
    <SiteConfigProvider>
      <I18nProvider initialLang={initialLang}>
        <AuthProvider>
          <HeartbeatBridge />
          <ModalEngineProvider>
            <ToastProvider>{children}</ToastProvider>
          </ModalEngineProvider>
        </AuthProvider>
      </I18nProvider>
    </SiteConfigProvider>
  );
}
