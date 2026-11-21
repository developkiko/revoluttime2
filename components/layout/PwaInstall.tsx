"use client";

/** PWA-модалка инструкций (Фаза G): как установить сайт как приложение.
 *  Платформа определяется по UA (iOS: «Поделиться → На экран Домой»,
 *  Android/desktop Chrome: «Установить приложение»). Стоит в подвале.
 *  Если сайт уже открыт как приложение (display-mode: standalone) —
 *  кнопка не показывается. */

import * as React from "react";
import { useTranslations } from "next-intl";
import { DownloadIcon, SmartphoneIcon, XIcon } from "lucide-react";

function detectPlatform(): "ios" | "android" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document)) {
    return "ios";
  }
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

export function PwaInstallButton() {
  const t = useTranslations("pwa");
  const [standalone, setStandalone] = React.useState(true); // до монтирования скрыты
  const [open, setOpen] = React.useState(false);
  const [platform, setPlatform] = React.useState<"ios" | "android" | "desktop">("desktop");

  React.useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const update = () => setStandalone(mq.matches);
    update();
    mq.addEventListener("change", update);
    setPlatform(detectPlatform());
    return () => mq.removeEventListener("change", update);
  }, []);

  if (standalone) return null;

  const steps: Record<typeof platform, string[]> = {
    ios: [t("iosStep1"), t("iosStep2"), t("iosStep3")],
    android: [t("androidStep1"), t("androidStep2"), t("androidStep3")],
    desktop: [t("desktopStep1"), t("desktopStep2")],
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
      >
        <SmartphoneIcon className="size-3.5" />
        {t("install")}
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-center p-4">
          <button
            type="button"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[var(--bg-primary)]/60 cursor-default"
          />
          <div
            role="dialog"
            aria-label={t("title")}
            className="relative w-full max-w-sm rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 shadow-xl"
          >
            <button
              type="button"
              aria-label={t("close")}
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <XIcon className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                <DownloadIcon className="size-5 text-[var(--color-primary)]" />
              </span>
              <h2 className="text-base font-semibold text-[var(--text-heading)]">
                {t("title")}
              </h2>
            </div>

            <ol className="mt-4 flex flex-col gap-2.5">
              {steps[platform].map((step, i) => (
                <li key={step} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[var(--color-primary)]/10 text-[11px] font-bold text-[var(--color-primary)]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <p className="mt-4 text-xs text-[var(--text-muted)]">{t("note")}</p>
          </div>
        </div>
      )}
    </>
  );
}
