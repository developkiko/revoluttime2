"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { LogInIcon, UserIcon } from "lucide-react";

import { useAuthUser } from "@/lib/auth-store";
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

/* Trigger styles — exact Ultra template header classes:
   logged-in = user pill (header-user-link), logged-out = primary button. */
const USER_PILL_CLASS =
  "rt-header-user-link inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-link)] hover:text-[var(--text-heading)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--hover-bg)] border border-[var(--color-primary)]/40 hover:border-[var(--color-primary)]/70 whitespace-nowrap";

const LOGIN_BUTTON_CLASS =
  "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]";

export function AuthPanel() {
  const t = useTranslations("auth");
  const tHeader = useTranslations("header");
  const user = useAuthUser();
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {user ? (
          <button
            type="button"
            aria-label={t("account")}
            title={user.email}
            className={USER_PILL_CLASS}
          >
            <UserIcon className="w-4 h-4 shrink-0" />
            <span className="rt-header-user-name">{user.name}</span>
          </button>
        ) : (
          <button type="button" className={LOGIN_BUTTON_CLASS}>
            <LogInIcon className="w-4 h-4" />
            {tHeader("login")}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="max-h-[min(70vh,32rem)] w-80 overflow-y-auto">
        <AuthPanelContent onDone={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
