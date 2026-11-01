"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ShieldCheckIcon } from "lucide-react";
import { toast } from "sonner";

import { refreshSessionUser } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

/** Sandbox helper: signs in the demo admin so /admin can be reviewed. */
export function AdminDemoButton() {
  const t = useTranslations("dummy");

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        const response = await fetch("/api/auth/dev-admin", { method: "POST" });
        if (response.ok) {
          await refreshSessionUser();
          toast.success(t("adminSignedIn"));
        } else {
          toast.error(t("adminSignInError"));
        }
      }}
    >
      <ShieldCheckIcon />
      {t("adminSignIn")}
    </Button>
  );
}
