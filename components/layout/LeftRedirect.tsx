"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ClockIcon, ShieldXIcon } from "lucide-react";

/**
 * Посредник внешних ссылок /left (порт со старого дамми, секция
 * «Код заказа и внешние ссылки»): отсчёт 5 секунд с кольцом-таймером,
 * затем переход на цель. Адресная строка во время отсчёта остаётся на
 * нашем домене. Цель — только http(s) на другой домен; всё прочее
 * (javascript:, тот же хост, пусто) = экран блокировки без перехода.
 */
export function LeftRedirect() {
  const t = useTranslations("left");
  const params = useSearchParams();
  const raw = params.get("url") ?? "";

  const state = React.useMemo<"ok" | "blocked">(() => {
    try {
      const parsed = new URL(raw);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "blocked";
      // Внутренние адреса не водим через посредника
      if (parsed.origin === window.location.origin) return "blocked";
      return "ok";
    } catch {
      return "blocked";
    }
  }, [raw]);

  const host = React.useMemo(() => {
    try {
      return new URL(raw).hostname;
    } catch {
      return raw.slice(0, 64);
    }
  }, [raw]);

  const [seconds, setSeconds] = React.useState(5);
  const [cancelled, setCancelled] = React.useState(false);

  React.useEffect(() => {
    if (state !== "ok" || cancelled) return;
    if (seconds <= 0) {
      window.location.replace(raw);
      return;
    }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [state, cancelled, seconds, raw]);

  if (state === "blocked") {
    return (
      <div data-tilt className="left-card mx-auto max-w-md">
        <span className="left-ico left-ico--block">
          <ShieldXIcon className="size-7" aria-hidden="true" />
        </span>
        <h1 className="left-title">{t("blockedTitle")}</h1>
        <p className="left-text">{t("blockedText")}</p>
        <code className="mt-4 block truncate rounded-lg border bg-muted/60 px-3 py-2 font-mono text-xs text-muted-foreground">
          {host}
        </code>
      </div>
    );
  }

  return (
    <div data-tilt className="left-card mx-auto max-w-md">
      <span className="left-ico left-ico--warn">
        <ClockIcon aria-hidden="true" />
      </span>
      <h1 className="left-title">{t("title")}</h1>
      <p className="left-text">
        {cancelled ? (
          t("cancelledText", { host })
        ) : (
          t("text", { seconds, host })
        )}
      </p>
      <div className="left-actions">
        <span className={`timer-ring ${cancelled ? "timer-ring--danger" : "timer-ring--primary"}`}>
          {cancelled ? "✕" : seconds}
        </span>
        <p className="left-note">{t("note")}</p>
        {!cancelled && (
          <button
            type="button"
            onClick={() => setCancelled(true)}
            className="mt-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("stay")}
          </button>
        )}
      </div>
    </div>
  );
}
