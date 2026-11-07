/** Referral attribution: ?ref=USER_ID survives for 30 days (cookie + mirror). */
export const REF_COOKIE = "rt_ref";
const REF_LOCAL_KEY = "rt_ref";
const REF_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const REF_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function sanitizeRef(raw: string | null | undefined): string | null {
  return raw && REF_PATTERN.test(raw) ? raw : null;
}

/** Stores the referral id (server checkout reads the cookie). Idempotent. */
export function captureReferral(raw: string | null | undefined): string | null {
  const ref = sanitizeRef(raw);
  if (!ref) return null;
  try {
    document.cookie = `${REF_COOKIE}=${encodeURIComponent(ref)}; max-age=${REF_MAX_AGE_SECONDS}; path=/; samesite=lax`;
    window.localStorage.setItem(REF_LOCAL_KEY, ref);
  } catch {
    // Storage may be unavailable; the checkout still works without attribution.
  }
  return ref;
}
