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
 * Visual language: Ultra's compact bottom-right cookie widget.
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
      className="fixed inset-x-4 bottom-[5.5rem] z-50 flex max-w-[min(92vw,26rem)] items-start gap-3 rounded-xl border bg-popover/95 p-4 shadow-lg backdrop-blur animate-in fade-in slide-in-from-bottom-4 duration-300 sm:left-auto sm:bottom-6 sm:right-[5.75rem]"
    >
      <CookieIcon className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium">{t("title")}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {t("text")}{" "}
          <Link
            href="/legal/datenschutz"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {t("learnMore")}
          </Link>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="xs" onClick={() => setConsent("granted")}>
            {t("acceptAll")}
          </Button>
          <Button size="xs" variant="outline" onClick={() => setConsent("essential")}>
            {t("essential")}
          </Button>
        </div>
      </div>
    </div>
  );
}
