"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CalendarIcon, XIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export interface NetworkPerson {
  id: string;
  name: string;
  /** ISO date (yyyy-mm-dd) — «дата регистрации». */
  joined: string;
  /** Optional badge text, e.g. referral level. */
  badge?: string;
}

export interface NetworkAction {
  label: string;
  href: string;
}

export interface PartnerNetworkProps {
  me: NetworkPerson;
  /** Direct partners of the 5-wide matrix (up to 5). */
  partners: NetworkPerson[];
  /**Href of a partner's profile (demo: the cabinet). */
  profileHref?: string;
  /** Quick cabinet buttons shown on the «Вы» preview. */
  youActions?: NetworkAction[];
  className?: string;
}

/** View-box geometry: You at the top, five partners on the bottom row. */
const VIEW_W = 600;
const VIEW_H = 320;
const YOU = { x: 300, y: 70 };
const MATRIX_WIDTH_PARTNERS = 5;
const CHIP_COLORS = [
  "bg-sky-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-rose-500",
];
const partnerPos = (index: number) => ({
  x: 60 + index * 120,
  y: 250,
});

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

/**
 * Interactive referral network (owner spec, 12.11.2026): «Вы» on top, five
 * partners below; dashed lines animate one-way — from the five towards the
 * one (commissions flow up). Clicking a partner (or the bottom tab panel)
 * opens a full-block preview: avatar, name, registration date, profile link.
 * The «Вы» block is a tab in the same panel and shows the cabinet buttons.
 */
export function PartnerNetwork({
  me,
  partners,
  profileHref = "/cabinet",
  youActions,
  className,
}: PartnerNetworkProps) {
  const t = useTranslations("partner.network");
  const locale = useLocale();
  const [active, setActive] = React.useState<string | null>(null);

  const shown = partners.slice(0, MATRIX_WIDTH_PARTNERS);
  const activePerson =
    active === "you" ? me : shown.find((partner) => partner.id === active);

  const formatDate = (iso: string) => {
    const date = new Date(`${iso}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? iso
      : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
  };

  return (
    <div className={className}>
      <div className="relative h-[320px] overflow-hidden rounded-3xl border bg-card shadow-lg md:h-[360px]">
        {/* one-way flow lines: drawn partner → You, dashes travel to You */}
        <svg
          aria-hidden
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 size-full"
        >
          {shown.map((partner, index) => {
            const to = partnerPos(index);
            const isActive = active === partner.id || active === "you";
            return (
              <line
                key={partner.id}
                x1={to.x}
                y1={to.y}
                x2={YOU.x}
                y2={YOU.y}
                className="net-flow-line"
                stroke={isActive ? "var(--primary)" : "currentColor"}
                strokeWidth={isActive ? 2.5 : 1.5}
                opacity={isActive ? 0.9 : 0.45}
              />
            );
          })}
        </svg>

        {/* You node */}
        <button
          type="button"
          onClick={() => setActive("you")}
          aria-pressed={active === "you"}
          className="absolute left-1/2 top-[8%] flex -translate-x-1/2 flex-col items-center gap-1"
        >
          <span
            className={`flex size-14 items-center justify-center rounded-full border-2 text-sm font-bold shadow-md transition-all md:size-16 ${
              active === "you"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-primary/60 bg-card text-primary hover:bg-primary/5"
            }`}
          >
            {initialsOf(me.name)}
          </span>
          <span className="text-[11px] font-semibold">{me.name}</span>
        </button>

        {/* Partner nodes */}
        {shown.map((partner, index) => (
          <button
            key={partner.id}
            type="button"
            onClick={() => setActive(active === partner.id ? null : partner.id)}
            aria-pressed={active === partner.id}
            className="absolute top-[64%] flex -translate-x-1/2 flex-col items-center gap-1"
            style={{ left: `${10 + index * 20}%` }}
          >
            <span
              className={`flex size-11 items-center justify-center rounded-full border-2 text-xs font-bold shadow-md transition-all md:size-12 ${
                active === partner.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-primary/40 bg-card hover:border-primary/70 hover:bg-primary/5"
              }`}
            >
              {initialsOf(partner.name)}
            </span>
            <span className="max-w-[72px] truncate text-[10px] font-medium text-muted-foreground">
              {partner.name}
            </span>
          </button>
        ))}

        {/* Full-block preview */}
        {activePerson && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-card/95 p-6 text-center backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label={t("close")}
              className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted"
            >
              <XIcon className="size-4" />
            </button>

            <span
              className={`flex size-20 items-center justify-center rounded-full text-xl font-bold text-white ring-4 ring-primary/20 ${
                active === "you" ? "bg-primary" : CHIP_COLORS[shown.findIndex((p) => p.id === active) % CHIP_COLORS.length]
              }`}
            >
              {initialsOf(activePerson.name)}
            </span>

            <div>
              <p className="text-lg font-bold">{activePerson.name}</p>
              {active === "you" && (
                <p className="text-xs font-medium text-primary">{t("youTag")}</p>
              )}
              {activePerson.badge && active !== "you" && (
                <p className="mt-1 inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {activePerson.badge}
                </p>
              )}
            </div>

            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarIcon className="size-4 text-primary" />
              {t("joinedLabel")}:
              <span className="font-medium text-foreground">
                {formatDate(activePerson.joined)}
              </span>
            </p>

            {active === "you" ? (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {(youActions ?? [{ label: t("cabinetFallback"), href: "/cabinet" }]).map(
                  (action) =>
                    action.href.startsWith("http") ? (
                      <Button key={action.href + action.label} size="sm" asChild>
                        <a href={action.href} target="_blank" rel="noreferrer">
                          {action.label}
                        </a>
                      </Button>
                    ) : (
                      <Button key={action.href + action.label} size="sm" asChild>
                        <Link href={action.href}>{action.label}</Link>
                      </Button>
                    ),
                )}
              </div>
            ) : (
              <Button size="sm" variant="outline" asChild>
                <Link href={profileHref}>{t("openProfile")}</Link>
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom partner-navigation tabs (Вы + partners) */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={active === "you"}
          onClick={() => setActive(active === "you" ? null : "you")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            active === "you"
              ? "bg-primary text-primary-foreground"
              : "border bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          {me.name}
        </button>
        {shown.map((partner) => (
          <button
            key={partner.id}
            type="button"
            role="tab"
            aria-selected={active === partner.id}
            onClick={() => setActive(active === partner.id ? null : partner.id)}
            className={`max-w-[140px] truncate rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              active === partner.id
                ? "bg-primary text-primary-foreground"
                : "border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {partner.name}
          </button>
        ))}
      </div>
    </div>
  );
}
