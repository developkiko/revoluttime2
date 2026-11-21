"use client";

/** Гейт страницы-предупреждения (Фаза F): SVG-круг 0→100% с обратным
 *  отсчётом и автопереходом. Режим таймера 0 (решение владельца: «таймера
 *  нет, но страница ждёт 10 с») — без круга, атом-лоадер и скрытая пауза.
 *  Кнопки: «Перейти сейчас» и «Остаться» (history.back()). Если ссылка
 *  не в whitelist (при непустом whitelist) — автопереход не запускается.
 */

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowRightIcon, ShieldAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AtomLoader } from "@/components/videos/AtomLoader";
import { hostFromUrl } from "@/lib/external-links";

export function RedirectGate({
  url,
  seconds,
  showCircle,
  approved,
}: {
  url: string;
  seconds: number;
  showCircle: boolean;
  approved: boolean;
}) {
  const t = useTranslations("redirect");
  const [remaining, setRemaining] = React.useState(seconds);
  const [left, setLeft] = React.useState(false); // «Остаться» — гасим таймер

  React.useEffect(() => {
    if (!approved || left || seconds <= 0) return;
    const timer = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          clearInterval(timer);
          window.location.replace(url);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [approved, left, seconds, url]);

  const domain = hostFromUrl(url) ?? url;
  // Круг: доля оставшегося времени (1 → полный круг в начале).
  const R = 52;
  const C = 2 * Math.PI * R;
  const progress = showCircle && approved && !left && seconds > 0 ? remaining / seconds : 0;

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {approved ? (
        showCircle && !left ? (
          /* SVG-круг 0→100% (окружность тает по мере отсчёта) */
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r={R} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="6" />
              <circle
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - progress)}
                transform="rotate(-90 60 60)"
                className="transition-[stroke-dashoffset] duration-1000 ease-linear"
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-2xl font-bold tabular-nums">
              {remaining}
            </span>
          </div>
        ) : (
          !left && <AtomLoader size={130} className="text-foreground/80" />
        )
      ) : (
        <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
          <ShieldAlertIcon className="size-7 text-destructive" />
        </span>
      )}

      <div className="max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">
          {approved ? t("leavingTitle") : t("notApprovedTitle")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {approved ? t("leavingText") : t("notApprovedText")}
        </p>
        {approved && (
          <p className="mt-3 break-all rounded-xl border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{domain}</span> · {url}
          </p>
        )}
        {approved && seconds > 0 && !left && (
          <p className="mt-2 text-xs text-muted-foreground">
            {t("redirectIn", { seconds: remaining })}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {approved && (
          <Button onClick={() => window.location.replace(url)}>
            <ArrowRightIcon className="size-4" />
            {t("goNow")}
          </Button>
        )}
        <Button variant="outline" onClick={() => { setLeft(true); history.back(); }}>
          {t("stay")}
        </Button>
      </div>
    </div>
  );
}
