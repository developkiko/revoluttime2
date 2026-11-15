"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useI18n } from "@/lib/ultra/i18n-context";

const CONSENT_KEY = "cookie_consent";

export default function CookieConsent() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  const dismiss = (value: "accepted" | "rejected") => {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  const cookiePolicyLink = t("cookie_consent_more");

  return (
    <div className="cookie-consent">
      <p className="cookie-consent-text">
        {t("cookie_consent_text")}{" "}
        <Link href="/cookies" className="cookie-link-inline">
          {cookiePolicyLink}
        </Link>
      </p>
      <div className="cookie-consent-actions">
        <button
          className="cookie-btn cookie-btn-reject"
          onClick={() => dismiss("rejected")}
        >
          {t("cookie_consent_reject")}
        </button>
        <button
          className="cookie-btn cookie-btn-accept"
          onClick={() => dismiss("accepted")}
        >
          {t("cookie_consent_accept")}
        </button>
      </div>
    </div>
  );
}
