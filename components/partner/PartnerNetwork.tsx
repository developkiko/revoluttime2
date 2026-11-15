"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpIcon, CalendarIcon, XIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export interface NetworkPerson {
  id: string;
  name: string;
  /** ISO date (yyyy-mm-dd) — «дата регистрации». */
  joined: string;
  /** Optional badge text, e.g. referral level. */
  badge?: string;
  /** Avatar URL or data URI; initials fallback when absent. */
  avatar?: string;
}

export interface NetworkAction {
  label: string;
  href: string;
}

export interface PartnerNetworkProps {
  me: NetworkPerson;
  /**
   * Direct partners of the 5-wide matrix (up to 5, actual count shown).
   * Sugar prop — equal to `childrenByNode={{ [me.id]: partners }}`.
   */
  partners?: NetworkPerson[];
  /**
   * Full tree for drill-down: direct partners per node id (root key = me.id).
   * Absent/empty list = leaf (empty bottom row, navigation ends here).
   */
  childrenByNode?: Record<string, NetworkPerson[]>;
  /** Href of a partner's profile (demo: the cabinet). */
  profileHref?: string;
  /** Quick cabinet buttons shown on the «Вы» preview. */
  youActions?: NetworkAction[];
  /** Paint initial-avatar circles in distinct colors so the text never
   *  blends into the background (demo contexts: home/partner/dummy). */
  colored?: boolean;
  className?: string;
}

/** View-box geometry: You at the top, partners on a centered bottom row. */
const VIEW_W = 600;
const VIEW_H = 320;
/** You circle center in view-box coords (button top 8% + half of size-14). */
const YOU = { x: 300, y: 54 };
/** Lower partner cards: line anchor = top edge of the card (spec 13.11.2026). */
const PARTNER_TOP_Y = 205;
const SLOT_PX = 120; // slot pitch in view-box units (20% of 600)
const MATRIX_WIDTH_PARTNERS = 5;
const CHIP_COLORS = [
  "bg-sky-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-rose-500",
];
/** Stable per-person color so an avatar keeps its circle color on every level. */
const chipOf = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return CHIP_COLORS[Math.abs(hash) % CHIP_COLORS.length];
};

/** Centered slot: cards group around the middle, never hug an edge. */
const slotLeftPct = (index: number, count: number) =>
  50 + (index - (count - 1) / 2) * 20;
const slotX = (index: number, count: number) =>
  (VIEW_W / 2) + (index - (count - 1) / 2) * SLOT_PX;

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

/** Avatar with initials/silhouette fallback (spec: show images everywhere). */
function PersonAvatar({
  person,
  className,
  textClassName,
}: {
  person: NetworkPerson;
  className: string;
  textClassName: string;
}) {
  if (person.avatar) {
    return (
      <span className={`overflow-hidden ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- provider CDN hosts / data URIs are not known at build time */}
        <img src={person.avatar} alt="" className="size-full object-cover" />
      </span>
    );
  }
  return (
    <span className={className}>
      <span className={textClassName}>{initialsOf(person.name)}</span>
    </span>
  );
}

/** Ease used by the level transitions (fast in, soft landing). */
const MOVE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Referral tree (spec code_artifact.md + animation pass 15.11.2026): the
 * current node on top, its direct partners below (up to 5, actual count,
 * centered). Navigation is fully animated: on step DOWN the top block slides
 * up out of the card, the clicked partner travels up into the top slot
 * growing to its size, the next level slides in from below into the same
 * slots (centered), then the lines draw themselves from the top block to
 * each partner and the dashed flow animation takes over. The «up» arrow
 * appears only after >=1 step down; the tab bar follows the current level.
 */
export function PartnerNetwork({
  me,
  partners,
  childrenByNode,
  profileHref = "/cabinet",
  youActions,
  colored = false,
  className,
}: PartnerNetworkProps) {
  const t = useTranslations("partner.network");
  const locale = useLocale();
  /** Path of node ids below «me» — last entry is the current top block. */
  const [stack, setStack] = React.useState<string[]>([]);
  const [active, setActive] = React.useState<string | null>(null);
  const [navDir, setNavDir] = React.useState<"down" | "up">("down");
  /** Lines: draw phase (You -> partner) then dashed flow (partner -> You). */
  const [phase, setPhase] = React.useState<"draw" | "flow">("draw");

  const childrenOf = (nodeId: string): NetworkPerson[] => {
    if (childrenByNode && childrenByNode[nodeId]) return childrenByNode[nodeId];
    // Legacy sugar: partners prop = direct partners of the root only.
    if (!childrenByNode && nodeId === me.id) return partners ?? [];
    return [];
  };

  const top = React.useMemo(() => {
    if (stack.length === 0) return me;
    // The current top lives among the children of the previous path entry.
    const parentId = stack.length >= 2 ? stack[stack.length - 2] : me.id;
    const found = childrenOf(parentId).find(
      (person) => person.id === stack[stack.length - 1],
    );
    return found ?? me;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- childrenOf closes over props only
  }, [stack, me, childrenByNode, partners]);

  const shown = childrenOf(top.id).slice(0, MATRIX_WIDTH_PARTNERS);
  const canGoUp = stack.length > 0;
  const atRoot = stack.length === 0;
  const activePerson =
    active === "you" ? top : shown.find((partner) => partner.id === active);

  /** Replay the line choreography on every level change: reset to the draw
   *  phase right in the nav handler (no setState-in-effect), then flip to
   *  the dashed flow phase once the draw animation has finished. */
  const flowTimer = React.useRef(0);
  const beginTransition = React.useCallback(() => {
    setPhase("draw");
    window.clearTimeout(flowTimer.current);
    flowTimer.current = window.setTimeout(() => setPhase("flow"), 1150);
  }, []);

  const stepDown = React.useCallback((id: string) => {
    setNavDir("down");
    setStack((current) => [...current, id]);
    setActive(null);
    beginTransition();
  }, [beginTransition]);

  const stepUp = React.useCallback(() => {
    setNavDir("up");
    setStack((current) => current.slice(0, -1));
    setActive(null);
    beginTransition();
  }, [beginTransition]);

  const resetToRoot = React.useCallback(() => {
    setNavDir("up");
    setStack([]);
    setActive(null);
    beginTransition();
  }, [beginTransition]);

  // Initial mount also plays draw -> flow (phase starts at "draw").
  React.useEffect(() => {
    const timer = window.setTimeout(() => setPhase("flow"), 1150);
    return () => window.clearTimeout(timer);
  }, []);

  const formatDate = (iso: string) => {
    const date = new Date(`${iso}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? iso
      : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
  };

  return (
    <div className={className}>
      <div className="relative h-[320px] overflow-hidden rounded-3xl border bg-card shadow-lg md:h-[360px]">
        {/* Lines: draw phase animates from the top block to each partner,
            flow phase hands over to the dashed partner -> top animation */}
        <svg
          aria-hidden
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 size-full"
        >
          {phase === "draw"
            ? shown.map((partner, index) => {
                const px = slotX(index, shown.length);
                return (
                  <motion.line
                    key={partner.id}
                    x1={YOU.x}
                    y1={YOU.y}
                    x2={px}
                    y2={PARTNER_TOP_Y}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.45 }}
                    transition={{
                      delay: 0.4 + index * 0.08,
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                  />
                );
              })
            : shown.map((partner, index) => {
                const px = slotX(index, shown.length);
                const isActive = active === partner.id || active === "you";
                return (
                  <line
                    key={partner.id}
                    x1={px}
                    y1={PARTNER_TOP_Y}
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

        {/* Current top block — slides up out of the card on step down,
            comes back down (shrinking to a slot) on step up */}
        <AnimatePresence mode="sync" initial={false}>
          <motion.button
            key={top.id}
            type="button"
            onClick={() => setActive("you")}
            aria-pressed={active === "you"}
            initial={
              navDir === "down"
                ? { y: 265, scale: 0.42, opacity: 1 }
                : { y: -170, opacity: 0 }
            }
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={
              navDir === "down"
                ? { y: -170, opacity: 0, transition: { duration: 0.32, ease: "easeIn" } }
                : { y: 265, scale: 0.42, opacity: 0, transition: { duration: 0.32, ease: "easeIn" } }
            }
            transition={{ duration: 0.5, ease: MOVE_EASE }}
            className="absolute left-1/2 top-[8%] z-10 flex -translate-x-1/2 flex-col items-center gap-1"
          >
            <PersonAvatar
              person={top}
              textClassName="text-sm font-bold"
              className={`flex size-14 items-center justify-center rounded-full border-2 shadow-md transition-colors ${
                active === "you"
                  ? "border-primary bg-primary text-primary-foreground"
                  : colored
                    ? `border-transparent ${chipOf(top.id)} text-white hover:border-primary hover:shadow-[0_0_0_4px_var(--border-active)] hover:scale-105`
                    : "border-primary/60 bg-card text-primary hover:border-primary hover:shadow-[0_0_0_4px_var(--border-active)] hover:scale-105"
              }`}
            />
            <span className="text-[11px] font-semibold">{top.name}</span>
          </motion.button>
        </AnimatePresence>

        {/* Up button — only when at least one step down was taken */}
        {canGoUp && (
          <button
            type="button"
            onClick={stepUp}
            aria-label={t("goUp")}
            title={t("goUp")}
            className="absolute left-3 top-3 z-10 flex size-9 items-center justify-center rounded-full border bg-card text-primary shadow-sm transition-colors hover:bg-primary/10"
          >
            <ArrowUpIcon className="size-4" />
          </button>
        )}

        {/* Partner nodes — next level slides in from below into the same
            centered slots; the outgoing row slides down (spec animation) */}
        <AnimatePresence mode="sync" initial={false}>
          {shown.map((partner, index) => (
            <motion.button
              key={partner.id}
              type="button"
              onClick={() => stepDown(partner.id)}
              initial={{ y: 130, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                transition: { delay: 0.26 + index * 0.07, duration: 0.45, ease: MOVE_EASE },
              }}
              exit={{ y: 90, opacity: 0, transition: { duration: 0.25, ease: "easeIn" } }}
              className="absolute top-[64%] flex -translate-x-1/2 flex-col items-center gap-1"
              style={{ left: `${slotLeftPct(index, shown.length)}%` }}
            >
              <PersonAvatar
                person={partner}
                textClassName="text-xs font-bold"
                className={`flex size-11 items-center justify-center rounded-full border-2 shadow-md transition-colors md:size-12 ${
                  active === partner.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : colored
                      ? `border-transparent ${chipOf(partner.id)} text-white hover:border-primary hover:shadow-[0_0_0_4px_var(--border-active)] hover:scale-105`
                      : "border-primary/40 bg-card hover:border-primary hover:shadow-[0_0_0_4px_var(--border-active)] hover:scale-105"
                }`}
              />
              <span className="max-w-[72px] truncate text-[10px] font-medium text-muted-foreground">
                {partner.name}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>

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

            <PersonAvatar
              person={activePerson}
              textClassName="text-xl font-bold"
              className={`flex size-20 items-center justify-center rounded-full text-white ring-4 ring-primary/20 ${
                active === "you"
                  ? "bg-primary"
                  : CHIP_COLORS[shown.findIndex((p) => p.id === active) % CHIP_COLORS.length]
              }`}
            />

            <div>
              <p className="text-lg font-bold">{activePerson.name}</p>
              {active === "you" && (
                <p className="text-xs font-medium text-primary">
                  {atRoot ? t("youTag") : t("partnerTag")}
                </p>
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
              <div className="flex flex-wrap items-center justify-center gap-2">
                {childrenOf(activePerson.id).length > 0 && (
                  <Button size="sm" onClick={() => stepDown(activePerson.id)}>
                    {t("stepDown")}
                  </Button>
                )}
                <Button size="sm" variant="outline" asChild>
                  <Link href={profileHref}>{t("openProfile")}</Link>
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom partner-navigation tabs (current top + its partners) */}
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
          {top.name}
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
        {canGoUp && (
          <button
            type="button"
            onClick={resetToRoot}
            className="rounded-full bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            {t("toMe")}
          </button>
        )}
      </div>
    </div>
  );
}
