"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { LogInIcon, UserIcon, UserPlusIcon } from "lucide-react";

import { useAuthUser } from "@/lib/auth-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AuthModal } from "./AuthModal";

// The user menu rides in a lazy chunk — the header triggers stay eager.
const AuthPanelContent = dynamic(
  () => import("./AuthPanelContent").then((m) => m.AuthPanelContent),
  { ssr: false },
);

/* Trigger styles — exact Ultra template header classes:
   logged-in = user pill (header-user-link), logged-out = two header buttons
   (owner request: "Sign up" highlighted + "Sign in") opening auth modals.
   Компактные отступы + shrink-0 (владелец 22.11 №1: на 1280px кнопки
   налезали на меню, №12: у пульса жал шеврон в новую строку). */
const USER_PILL_CLASS =
  "rt-header-user-link inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-link)] hover:text-[var(--text-heading)] transition-colors px-2 py-1.5 rounded-lg hover:bg-[var(--hover-bg)] border border-[var(--color-primary)]/40 hover:border-[var(--color-primary)]/70 whitespace-nowrap shrink-0";

const REGISTER_BUTTON_CLASS =
  "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap bg-[var(--primary)] text-white hover:bg-[var(--color-primary-hover)] border border-[var(--color-primary-border)] shrink-0";

const LOGIN_BUTTON_CLASS =
  "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap border border-[var(--border-default)] text-[var(--text-heading)] hover:bg-[var(--hover-bg)] shrink-0";

/** Компактный баланс слева от аватара в пилюле (владелец 22.11 №10). */
function BalanceChip() {
  const [cents, setCents] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetch("/api/balance", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { balanceCents?: number | null } | null) => {
        if (data?.balanceCents != null) setCents(data.balanceCents);
      })
      .catch(() => undefined);
  }, []);

  if (cents === null) return null;
  const label = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);

  return (
    <span
      className="me-1 inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-bold tabular-nums text-[var(--color-primary)]"
      title={label}
    >
      {label}
    </span>
  );
}

export function AuthPanel() {
  const t = useTranslations("auth");
  const tHeader = useTranslations("header");
  const user = useAuthUser();
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalTab, setModalTab] = React.useState<"login" | "register">("login");

  // Logged in — user pill + dropdown menu (unchanged).
  if (user) {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={t("account")}
            title={user.email}
            className={USER_PILL_CLASS}
          >
            {/* Баланс — слева от аватара (владелец 22.11 №10) */}
            <BalanceChip />
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element -- provider CDN hosts are not known at build time
              <img
                src={user.picture}
                alt=""
                className="size-6 shrink-0 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-4 h-4 shrink-0" />
            )}
            <span className="rt-header-user-name">{user.name}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="max-h-[min(70vh,32rem)] w-80 overflow-y-auto">
          <AuthPanelContent onDone={() => setPopoverOpen(false)} />
        </PopoverContent>
      </Popover>
    );
  }

  // Logged out — two header buttons opening the auth modal (no dropdown).
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={REGISTER_BUTTON_CLASS}
        onClick={() => {
          setModalTab("register");
          setModalOpen(true);
        }}
      >
        <UserPlusIcon className="w-4 h-4" />
        {t("register")}
      </button>
      <button
        type="button"
        className={LOGIN_BUTTON_CLASS}
        onClick={() => {
          setModalTab("login");
          setModalOpen(true);
        }}
      >
        <LogInIcon className="w-4 h-4" />
        {tHeader("login")}
      </button>
      <AuthModal open={modalOpen} onOpenChange={setModalOpen} initialTab={modalTab} />
    </div>
  );
}
