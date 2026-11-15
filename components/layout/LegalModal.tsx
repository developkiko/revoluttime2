"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { InfoIcon, XIcon } from "lucide-react";

import { ModalLangButton, ModalThemeButton } from "@/components/layout/ModalControls";

export type LegalSlug = "impressum" | "datenschutz" | "agb" | "widerruf";

const LEGAL_SLUGS: LegalSlug[] = ["impressum", "datenschutz", "agb", "widerruf"];

/**
 * Legal document modal — the site counterpart of the Ultra template's
 * PolicyModal (same overlay / sticky header / scrollable body pattern).
 * Content comes from the same messages `legal.<slug>` namespace the
 * /legal/[slug] pages render, so modal and page are always in sync.
 */
export function LegalModal({
  slug,
  onClose,
}: {
  slug: LegalSlug;
  onClose: () => void;
}) {
  const t = useTranslations("legal");
  const prevailing = slug !== "impressum" ? t("prevailing") : "";
  const sections = t.raw(`${slug}.sections`) as { h: string; p: string }[];

  // Escape closes; body scroll is locked while open (Ultra modal pattern).
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(`${slug}.title`)}
      className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        {/* header — overflow-hidden на корпусе не даёт квадратным углам
            шапки/тела вылезать за скругление оболочки */}
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-4">
          <h2 className="truncate text-lg font-bold text-[var(--text-heading)]">
            {t(`${slug}.title`)}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <ModalLangButton />
            <ModalThemeButton />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex size-8 shrink-0 items-center justify-center rounded-full border text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--text-heading)]"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </div>

        {/* scrollable body */}
        <div className="overflow-y-auto px-6 py-5">
          <p className="text-xs text-[var(--text-secondary)]">{t("updated")}</p>

          {prevailing && (
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-sm text-[var(--text-heading)]">
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-sky-500" />
              {prevailing}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-6">
            {sections.map((section, index) => (
              <section key={index}>
                <h3 className="font-semibold leading-snug text-[var(--text-heading)]">
                  {section.h}
                </h3>
                {section.p.split("\n\n").map((paragraph, pIndex) => (
                  <p
                    key={pIndex}
                    className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function isLegalSlug(value: string): value is LegalSlug {
  return (LEGAL_SLUGS as string[]).includes(value);
}
