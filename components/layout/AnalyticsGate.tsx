"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  subscribeConsent,
} from "@/lib/consent";
import { initAnalytics, trackPageview } from "@/lib/analytics/events";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

let started = false;

/**
 * GDPR/TDDDG gate: PostHog initializes only after "Accept all" in the cookie
 * banner AND a configured NEXT_PUBLIC_POSTHOG_KEY. Otherwise nothing loads.
 */
export function AnalyticsGate() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );
  const pathname = usePathname();
  const active = consent === "granted" && Boolean(KEY);

  React.useEffect(() => {
    if (active && KEY && !started) {
      started = true;
      void initAnalytics(KEY, HOST);
    }
  }, [active]);

  React.useEffect(() => {
    if (active) trackPageview(pathname);
  }, [active, pathname]);

  return null;
}
