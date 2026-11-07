"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { UserIcon } from "lucide-react";

import { useAuthUser } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// The popover body (login providers / user menu, incl. the Telegram script)
// rides in a lazy chunk — the header trigger stays eager.
const AuthPanelContent = dynamic(
  () => import("./AuthPanelContent").then((m) => m.AuthPanelContent),
  { ssr: false },
);

export function AuthPanel() {
  const t = useTranslations("auth");
  const user = useAuthUser();
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("account")}
          className="relative"
        >
          {user ? (
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold uppercase text-primary-foreground">
              {user.name.charAt(0)}
            </span>
          ) : (
            <UserIcon />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <AuthPanelContent onDone={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
