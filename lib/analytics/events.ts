import { hasAnalyticsConsent } from "@/lib/consent";

/**
 * Typed analytics events (blueprint § 5). GDPR rule: nothing is sent before
 * the user pressed "Accept all" (rt_cookie_consent === "granted") — track()
 * silently no-ops otherwise. PostHog itself is loaded lazily by
 * components/layout/AnalyticsGate.tsx only after consent.
 */
export const AnalyticsEvents = {
  QUIZ_COMPLETE: "quiz_complete", // wired when the Discovery Journey ships
  PRODUCT_VIEW: "product_view",
  PRODUCT_ADD_TO_CART: "product_add_to_cart",
  CHECKOUT_START: "checkout_start",
  PARTNER_LINK_CLICK: "partner_link_click",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

interface PosthogClient {
  capture: (event: string, props?: AnalyticsProps) => void;
}

let client: PosthogClient | null = null;
let starting: Promise<void> | null = null;

/** Loads posthog-js and initializes it. Called only after explicit consent. */
export async function initAnalytics(apiKey: string, apiHost: string): Promise<void> {
  if (client) return;
  starting ??= import("posthog-js").then(({ default: posthog }) => {
    posthog.init(apiKey, {
      api_host: apiHost,
      autocapture: false, // GDPR: no automatic DOM harvesting
      capture_pageview: false, // pageviews are sent manually on route change
      persistence: "localStorage+cookie",
    });
    client = posthog;
  });
  await starting;
}

function readyClient(): PosthogClient | null {
  return hasAnalyticsConsent() ? client : null;
}

export function track(event: AnalyticsEventName, props: AnalyticsProps = {}): void {
  try {
    readyClient()?.capture(event, props);
  } catch {
    // Analytics must never break UX.
  }
}

export function trackPageview(pathname: string): void {
  try {
    readyClient()?.capture("$pageview", { pathname });
  } catch {
    // Analytics must never break UX.
  }
}
