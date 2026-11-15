"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ShieldCheckIcon } from "lucide-react";

import { refreshSessionUser } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { useNotice } from "@/components/ui/notice";

/** Sandbox helper: signs in the demo admin so /admin can be reviewed. */
export function AdminDemoButton() {
  const t = useTranslations("dummy");
  const { notice } = useNotice();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        const response = await fetch("/api/auth/dev-admin", { method: "POST" });
        if (response.ok) {
          await refreshSessionUser();
          notice({ text: t("adminSignedIn"), variant: "success" });
        } else {
          notice({ text: t("adminSignInError"), variant: "error" });
        }
      }}
    >
      <ShieldCheckIcon />
      {t("adminSignIn")}
    </Button>
  );
}
