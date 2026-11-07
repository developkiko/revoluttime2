/**
 * Cookie consent (TDDDG § 25 / DSGVO). Tiny localStorage-backed store in the
 * same useSyncExternalStore style as the cart/auth stores.
 *
 * Third-party/analytics code must check `hasAnalyticsConsent()` before it
 * initializes — nothing on the site loads external trackers by default.
 */
export type CookieConsent = "granted" | "essential";

const STORAGE_KEY = "rt_cookie_consent";

let snapshot: CookieConsent | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function refresh() {
  let next: CookieConsent | null = null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    next = raw === "granted" || raw === "essential" ? raw : null;
  } catch {
    // Storage unavailable (private mode etc.) — banner keeps asking.
  }
  if (next !== snapshot) {
    snapshot = next;
    listeners.forEach((listener) => listener());
  }
}

export function subscribeConsent(callback: () => void): () => void {
  listeners.add(callback);
  if (!hydrated) {
    hydrated = true;
    refresh();
    window.addEventListener("storage", refresh);
  }
  return () => listeners.delete(callback);
}

/** Client snapshot for useSyncExternalStore (hydrates on first subscription). */
export function getConsentSnapshot(): CookieConsent | null {
  return snapshot;
}

/** Server snapshot — the banner renders nothing during SSR. */
export function getServerConsentSnapshot(): null {
  return null;
}

export function setConsent(value: CookieConsent): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Ignore write failures; the in-memory value still hides the banner.
  }
  refresh();
}

/** Gate for analytics / third-party scripts (see blueprint §5, GDPR-compliant). */
export function hasAnalyticsConsent(): boolean {
  return snapshot === "granted";
}
