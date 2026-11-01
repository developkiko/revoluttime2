"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { refreshSessionUser } from "@/lib/auth-store";

/**
 * Shows a toast when the user returns from an OAuth redirect
 * (/?login=google | cancelled | unconfigured | …) and refreshes the session.
 */
export function LoginNotice() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const login = searchParams.get("login");
    if (!login) return;
    refreshSessionUser();
    if (login === "google") {
      toast.success(t("welcomeToast"));
    } else if (login === "cancelled") {
      toast.info(t("loginCancelled"));
    } else if (login === "unconfigured") {
      toast.error(t("loginUnconfigured"));
    }
    window.history.replaceState(null, "", window.location.pathname);
  }, [searchParams, t]);

  return null;
}
