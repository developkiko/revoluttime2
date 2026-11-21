"use client";

/** Типсы энциклопедии на мобиле (Фаза G): короткая подсказка внизу
 *  экрана, ротация раз в 8 с. Видна ТОЛЬКО если владелец включил
 *  owner_settings.encyclopedia_tips_mobile (по умолчанию скрыты —
 *  решение владельца 21.11). md:hidden — десктоп не трогаем. */

import * as React from "react";
import { useTranslations } from "next-intl";
import { LightbulbIcon, XIcon } from "lucide-react";

const ROTATE_MS = 8000;
const TIP_COUNT = 4;

export function EncyclopediaTips() {
  const t = useTranslations("encyclopediaTips");
  const [enabled, setEnabled] = React.useState(false);
  const [closed, setClosed] = React.useState(false);
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    // уже закрыто пользователем в этой сессии — конфиг не дергаем
    if (sessionStorage.getItem("rt_tips_closed") === "1") {
      setClosed(true);
      return;
    }
    fetch("/api/site-config", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { ownerSettings?: { encyclopedia_tips_mobile?: boolean } }) => {
        setEnabled(Boolean(data?.ownerSettings?.encyclopedia_tips_mobile));
      })
      .catch(() => undefined);
  }, []);

  React.useEffect(() => {
    if (!enabled || closed || TIP_COUNT <= 1) return;
    const timer = setInterval(
      () => setIndex((value) => (value + 1) % TIP_COUNT),
      ROTATE_MS
    );
    return () => clearInterval(timer);
  }, [enabled, closed]);

  if (!enabled || closed) return null;

  function dismiss() {
    sessionStorage.setItem("rt_tips_closed", "1");
    setClosed(true);
  }

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-3 z-40 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-start gap-2.5 rounded-2xl border bg-popover/95 p-3.5 pr-9 text-sm shadow-lg backdrop-blur">
        <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" />
        <p className="leading-snug text-[var(--text-secondary)]">
          {t(`tip${index + 1}`)}
        </p>
        <button
          type="button"
          aria-label={t("close")}
          onClick={dismiss}
          className="absolute right-2 top-2 p-1 text-[var(--text-muted)]"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
