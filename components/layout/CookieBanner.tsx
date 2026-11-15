"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { CookieIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  setConsent,
  subscribeConsent,
} from "@/lib/consent";

/**
 * GDPR/TDDDG § 25 consent bar: essential cookies are always on, anything
 * third-party waits for "Accept all" (see lib/consent.ts gate).
 * Layout per spec: bottom-left single-row card, same height as the PWA
 * install prompt and resting on top of it when visible (see .cookie-consent
 * in globals.css); overflowing text is cut with an ellipsis.
 */
export function CookieBanner() {
  const t = useTranslations("cookie");
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );

  if (consent) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("title")}
      className="cookie-consent animate-in fade-in slide-in-from-bottom-4"
    >
      <CookieIcon className="size-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium">{t("title")}</p>
        <p className="cookie-consent-text">
          {t("text")}{" "}
          <Link
            href="/legal/datenschutz"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {t("learnMore")}
          </Link>
        </p>
      </div>
      <div className="cookie-consent-actions">
        <Button size="xs" onClick={() => setConsent("granted")}>
          {t("acceptAll")}
        </Button>
        <Button size="xs" variant="outline" onClick={() => setConsent("essential")}>
          {t("essential")}
        </Button>
      </div>
    </div>
  );
}
