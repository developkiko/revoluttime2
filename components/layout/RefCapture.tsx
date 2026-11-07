"use client";

import * as React from "react";

import { captureReferral } from "@/lib/referral";

/**
 * Persists ?ref=USER_ID attribution (cookie, 30 days + localStorage mirror).
 * The checkout API reads the cookie into Stripe metadata/client_reference_id.
 */
export function RefCapture() {
  React.useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) captureReferral(ref);
  }, []);

  return null;
}
