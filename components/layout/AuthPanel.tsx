"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { LogOutIcon, UserIcon, UserRoundIcon } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { signOut, useAuthUser } from "@/lib/auth-store";
import { TelegramLoginWidget } from "@/components/layout/TelegramLoginWidget";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const GOOGLE_ICON = (
  // Multicolor Google "G" per brand guidelines.
  <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
    <path
      fill="#4285F4"
      d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.86c2.26-2.09 3.58-5.17 3.58-8.81Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29v-3.1H1.29a12 12 0 0 0 0 10.78l3.98-3.1Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.61l3.98 3.1C6.22 6.86 8.87 4.75 12 4.75Z"
    />
  </svg>
);

function ProvidersPanel({ onDone }: { onDone?: () => void }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const googleEnabled = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-semibold">{t("signInTitle")}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("signInSubtitle")}
        </p>
      </div>

      <TelegramLoginWidget />

      {googleEnabled && (
        <>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {t("or")}
            <span className="h-px flex-1 bg-border" />
          </div>
          {/* API route that 302-redirects to Google — router.push triggers MPA navigation. */}
          <Button
            variant="outline"
            onClick={() => router.push("/api/auth/google/start")}
          >
            {GOOGLE_ICON}
            {t("googleCta")}
          </Button>
        </>
      )}

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {t("emailLaterHint")}
      </p>

      <button
        type="button"
        onClick={onDone}
        className="self-start text-[11px] text-muted-foreground underline-offset-4 hover:underline"
      >
        {t("closePanel")}
      </button>
    </div>
  );
}

function UserMenu({ email, name, onDone }: { email: string; name: string; onDone?: () => void }) {
  const t = useTranslations("auth");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary text-lg font-bold uppercase text-primary-foreground">
          {name.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold">{name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {email.includes("@telegram.revoluttime") ? email.split("@")[0] : email}
          </p>
        </div>
      </div>

      <Button variant="outline" className="w-full justify-start" asChild>
        <Link href="/partner" onClick={onDone}>
          <UserRoundIcon />
          {t("cabinet")}
        </Link>
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start text-destructive hover:text-destructive"
        onClick={async () => {
          await signOut();
          toast.success(t("signedOutToast"));
          onDone?.();
        }}
      >
        <LogOutIcon />
        {t("logout")}
      </Button>
    </div>
  );
}

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
        {user ? (
          <UserMenu
            email={user.email}
            name={user.name}
            onDone={() => setOpen(false)}
          />
        ) : (
          <ProvidersPanel onDone={() => setOpen(false)} />
        )}
      </PopoverContent>
    </Popover>
  );
}
