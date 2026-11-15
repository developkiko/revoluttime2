"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  BookOpenIcon,
  GiftIcon,
  LogOutIcon,
  NetworkIcon,
  ShoppingBagIcon,
  UserIcon,
  UserRoundIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { signOut, useAuthUser } from "@/lib/auth-store";
import { TelegramLoginWidget } from "@/components/layout/TelegramLoginWidget";

const GOOGLE_ICON = (
  // Multicolor Google "G" per brand guidelines.
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden>
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
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.61l3.98-3.1C6.22 6.86 8.87 4.75 12 4.75Z"
    />
  </svg>
);

/* ═══ Row styles — Ultra template nav/link look, applied to menu items ═══ */

const MENU_ROW_CLASS =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-link)] transition-colors text-left hover:bg-[var(--hover-bg)] hover:text-[var(--text-heading)]";

const MENU_DANGER_CLASS =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors text-left hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)]";

const OUTLINE_BUTTON_CLASS =
  "inline-flex w-full items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors border border-[var(--border-default)] text-[var(--text-heading)] hover:bg-[var(--hover-bg)]";

function ProvidersPanel({ onDone }: { onDone?: () => void }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const googleEnabled = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-semibold">{t("signInTitle")}</p>
        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
          {t("signInSubtitle")}
        </p>
      </div>

      <TelegramLoginWidget />

      {googleEnabled && (
        <>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
            <span className="h-px flex-1 bg-[var(--border-default)]" />
            {t("or")}
            <span className="h-px flex-1 bg-[var(--border-default)]" />
          </div>
          {/* API route that 302-redirects to Google — router.push triggers MPA navigation. */}
          <button
            type="button"
            className={OUTLINE_BUTTON_CLASS}
            onClick={() => router.push("/api/auth/google/start")}
          >
            {GOOGLE_ICON}
            {t("googleCta")}
          </button>
        </>
      )}

      <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
        {t("emailLaterHint")}
      </p>

      <button
        type="button"
        onClick={onDone}
        className="self-start text-[11px] text-[var(--text-secondary)] underline-offset-4 hover:underline"
      >
        {t("closePanel")}
      </button>
    </div>
  );
}

function UserMenu({
  email,
  name,
  picture,
  onDone,
}: {
  email: string;
  name: string;
  picture?: string;
  onDone?: () => void;
}) {
  const t = useTranslations("auth");
  const isAdmin = email === "admin@revoluttime.de";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-subtle)]">
        {picture ? (
          // eslint-disable-next-line @next/next/no-img-element -- provider CDN hosts are not known at build time
          <img
            src={picture}
            alt=""
            className="size-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-bold uppercase text-white">
            {name.charAt(0)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold">{name}</p>
          <p className="truncate text-xs text-[var(--text-secondary)]">
            {email.includes("@telegram.revoluttime") ? email.split("@")[0] : email}
          </p>
        </div>
      </div>

      <Link href="/cabinet" className={MENU_ROW_CLASS} onClick={onDone}>
        <UserRoundIcon className="w-4 h-4 shrink-0" />
        {t("cabinet")}
      </Link>
      <Link href="/cabinet#profile" className={MENU_ROW_CLASS} onClick={onDone}>
        <UserIcon className="w-4 h-4 shrink-0" />
        {t("profile")}
      </Link>
      <Link href="/cabinet#purchases" className={MENU_ROW_CLASS} onClick={onDone}>
        <ShoppingBagIcon className="w-4 h-4 shrink-0" />
        {t("purchasesLink")}
      </Link>
      <Link href="/cabinet#bonuses" className={MENU_ROW_CLASS} onClick={onDone}>
        <GiftIcon className="w-4 h-4 shrink-0" />
        {t("bonusesLink")}
      </Link>
      <Link href="/cabinet#network" className={MENU_ROW_CLASS} onClick={onDone}>
        <NetworkIcon className="w-4 h-4 shrink-0" />
        {t("networkLink")}
      </Link>
      <Link href="/encyclopedia" className={MENU_ROW_CLASS} onClick={onDone}>
        <BookOpenIcon className="w-4 h-4 shrink-0" />
        {t("encyclopediaLink")}
      </Link>
      {isAdmin && (
        <a
          href="https://adm-rt.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className={MENU_ROW_CLASS}
          onClick={onDone}
        >
          {t("adminLink")}
        </a>
      )}

      <button
        type="button"
        className={`${MENU_DANGER_CLASS} mt-1`}
        onClick={async () => {
          await signOut();
          toast.success(t("signedOutToast"));
          onDone?.();
        }}
      >
        <LogOutIcon className="w-4 h-4 shrink-0" />
        {t("logout")}
      </button>
    </div>
  );
}

/** Popover body — loaded lazily from AuthPanel (keeps RHF/telegram out of first load). */
export function AuthPanelContent({ onDone }: { onDone: () => void }) {
  const user = useAuthUser();

  return user ? (
    <UserMenu email={user.email} name={user.name} picture={user.picture} onDone={onDone} />
  ) : (
    <ProvidersPanel onDone={onDone} />
  );
}
