"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

import { dateLocaleFor } from "@/lib/i18n-date";
import {
  entryForStep,
  stepGapMs,
  type EarningEntry,
  type EarningsConfig,
} from "@/lib/earnings";

/**
 * Лента выплат «Зарабатывают уже сейчас» (Фаза C). Server кладёт начальный
 * фид; в dummy-режиме клиент продолжает последовательность тем же seed —
 * раз в случайный интервал (2–15 мин из админ-настроек) сверху прилетает
 * новая анонимная запись (паузные шаги пропускаются — просто тишина).
 * Анимация появления — как у отзывов (мягкий slide-in).
 */

const MAX_VISIBLE = 8;

/** Тикер перерисовки относительных времён: снапшот = номер 30-секундного
 *  бакета, меняется раз в 30 с; интервал живёт, пока есть подписчики.
 *  Серверный снапшот −1 → до гидрации времена не рендерятся (SSR и клиент
 *  считают от разных Date.now() → иначе hydration mismatch React #418). */
const timeRedraw = (() => {
  let bucket = 0;
  const listeners = new Set<() => void>();
  let timer: ReturnType<typeof setInterval> | null = null;
  return {
    subscribe(onChange: () => void) {
      listeners.add(onChange);
      if (!timer) {
        timer = setInterval(() => {
          bucket += 1;
          listeners.forEach((fn) => fn());
        }, 30_000);
      }
      return () => {
        listeners.delete(onChange);
        if (listeners.size === 0 && timer) {
          clearInterval(timer);
          timer = null;
        }
      };
    },
    getSnapshot: () => bucket,
  };
})();

export function EarningsFeed({
  initialEntries,
  config,
  baseSeed,
  live,
}: {
  initialEntries: EarningEntry[];
  config: EarningsConfig;
  baseSeed: number;
  /** dummy → тикаем новые записи; real → статичная лента из ledger. */
  live: boolean;
}) {
  const t = useTranslations("home.earnings");
  const locale = useLocale();
  const [entries, setEntries] = React.useState<EarningEntry[]>(initialEntries);
  // Индекс 0 = самый свежий шаг сервера; новые шаги продолжаются В
  // ОТРИЦАТЕЛЬНУЮ сторону (−1, −2, …). Плюс-направление повторяло шаги,
  // которые сервер уже отрисовал в начальном фиде (дубли записей).
  const nextStepRef = React.useRef(-1);

  // Относительные времена: «−1» до гидрации → не рендерятся; после —
  // снапшот меняется раз в 30 с → лента перерисовывает «только что»/«N мин».
  const timeRedrawTick = React.useSyncExternalStore(
    timeRedraw.subscribe,
    timeRedraw.getSnapshot,
    () => -1
  );

  // Тикер dummy-режима: детерминированная пауза из seed → новая запись.
  React.useEffect(() => {
    if (!live) return;
    let timer: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const step = nextStepRef.current;
      const gap = stepGapMs(baseSeed, step, config);
      timer = setTimeout(() => {
        const entry = entryForStep(baseSeed, step, config);
        nextStepRef.current = step - 1;
        if (entry) {
          setEntries((prev) => [
            { ...entry, index: step, ts: Date.now() },
            ...prev.slice(0, MAX_VISIBLE - 1),
          ]);
        }
        scheduleNext();
      }, gap);
    };
    scheduleNext();
    return () => clearTimeout(timer);
  }, [live, baseSeed, config]);

  const centsFmt = React.useMemo(
    () => new Intl.NumberFormat(dateLocaleFor(locale), { style: "currency", currency: "EUR" }),
    [locale]
  );
  const timeFmt = React.useMemo(
    () =>
      new Intl.RelativeTimeFormat(dateLocaleFor(locale), { numeric: "auto" }),
    [locale]
  );

  const timeAgo = React.useCallback(
    (ts: number) => {
      const diffMin = Math.round((ts - Date.now()) / 60_000);
      if (diffMin > -1) return t("justNow");
      if (diffMin > -60) return timeFmt.format(diffMin, "minute");
      return timeFmt.format(Math.round(diffMin / 60), "hour");
    },
    [timeFmt, t]
  );

  return (
    <ul className="mx-auto flex max-w-2xl flex-col gap-2.5" aria-live="polite">
      <AnimatePresence initial={false}>
        {entries.slice(0, MAX_VISIBLE).map((entry) => (
          <motion.li
            key={`${entry.index}-${entry.ts}`}
            layout
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny static avatar, no next/image config needed */}
            <img
              src={entry.avatar}
              alt=""
              loading="lazy"
              className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {entry.maskedName}
                <span className="ms-2 text-xs font-normal text-muted-foreground">
                  {entry.type === "cashback" ? t("typeCashback") : t("typePercent")}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {timeRedrawTick >= 0 ? timeAgo(entry.ts) : ""}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-primary">
              +{centsFmt.format(entry.amountCents / 100)}
            </p>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
