"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { refreshSessionUser } from "@/lib/auth-store";
import { useNotice } from "@/components/ui/notice";

/**
 * Shows a toast when the user returns from an OAuth redirect
 * (/?login=google | cancelled | unconfigured | …) and refreshes the session.
 */
export function LoginNotice() {
  const t = useTranslations("auth");
  const { notice } = useNotice();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const login = searchParams.get("login");
    if (!login) return;
    refreshSessionUser();
    if (login === "google") {
      notice({ text: t("welcomeToast"), variant: "success" });
    } else if (login === "cancelled") {
      notice({ text: t("loginCancelled"), variant: "info" });
    } else if (login === "unconfigured") {
      notice({ text: t("loginUnconfigured"), variant: "error" });
    }
    window.history.replaceState(null, "", window.location.pathname);
  }, [searchParams, t, notice]);

  return null;
}
