"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CheckCircle2Icon, ReceiptTextIcon, RotateCcwIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { BrandedQr } from "@/components/checkout/BrandedQr";

/**
 * «Печать чека» — порт codepen.io/karakym/pen/NPpMpeQ со старого дамми
 * (components/dummy/receipt-demo.tsx, brand-вариант): панель морфится в
 * чек-бумагу с перфорацией (mask-вырезы), строки разворачиваются по одной
 * (height 0→auto через interpolate-size), в конце — настоящий QR с кодом
 * заказа. CSS: .rb-* в app/styles/port.css. Стиль — наши токены.
 */

export interface ReceiptLine {
  label: string;
  value: string;
}

export interface ReceiptPrintProps {
  /** Код заказа для шапки и QR (например RT-7K2QX9). */
  code: string;
  /** Строки позиции. */
  lines: ReceiptLine[];
  /** Итоговая строка (уже отформатированная цена). */
  total: string;
  /** Подзаголовки чека (дата, состав). */
  sub?: string[];
  /** Благодарность в подвале чека. */
  thanks?: string;
  /** Что зашить в QR (по умолчанию — код заказа). */
  qrPayload?: string;
}

type Face = "idle" | "paper";
type Mode = "idle" | "printing";

const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const TICK_MS = 200;

export function ReceiptPrint({
  code,
  lines,
  total,
  sub = [],
  thanks,
  qrPayload,
}: ReceiptPrintProps) {
  const t = useTranslations("checkout.receipt");
  const [face, setFace] = useState<Face>("idle");
  const [mode, setMode] = useState<Mode>("idle");
  const [shown, setShown] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const morphRef = useRef<number | null>(null);

  // Единый список рядов чека: подзаголовки → линия → позиции → линия → итог
  // → спасибо → QR. Каждый ряд показывается по своему глобальному индексу.
  const rows = [
    ...sub.map((text) => ({ kind: "sub", text }) as const),
    { kind: "rule" } as const,
    ...lines.map((l) => ({ kind: "item", ...l }) as const),
    { kind: "rule" } as const,
    { kind: "total" } as const,
    ...(thanks ? [{ kind: "thanks", text: thanks } as const] : []),
    { kind: "qr" } as const,
  ];

  // Морф высоты панели idle ↔ paper (WAAPI, как в пене).
  useLayoutEffect(() => {
    if (face !== "paper" || morphRef.current === null) return;
    const panel = panelRef.current;
    if (!panel) return;
    const from = morphRef.current;
    morphRef.current = null;
    const to = panel.getBoundingClientRect().height;
    if (Math.abs(to - from) >= 0.5) {
      panel
        .animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 480, easing: EASE })
        .finished.catch(() => {});
    }
  }, [face]);

  // Печать: по одной строке каждые 200 мс (setState в колбэке таймера —
  // не синхронный в эффекте; rows пересобирается каждый рендер, длина
  // стабильна для данных чека).
  useEffect(() => {
    if (mode !== "printing") return;
    const id = setInterval(() => setShown((s) => Math.min(s + 1, rows.length)), TICK_MS);
    return () => clearInterval(id);
  }, [mode, rows.length]);

  // «done» — производное состояние: строки кончились, чек напечатан.
  const isDone = mode === "printing" && shown >= rows.length;

  const start = () => {
    if (mode !== "idle") return;
    morphRef.current = panelRef.current?.getBoundingClientRect().height ?? 0;
    setShown(0);
    setFace("paper");
    setMode("printing");
  };

  const reset = () => {
    setFace("idle");
    setMode("idle");
    setShown(0);
  };

  return (
    <div className="rb">
      <div className="rb-card">
        <div className="rb-head">
          <div className="rb-head-left">
            <span className="rb-head-title">{t("title")}</span>
            <span className="rb-tag">{code}</span>
          </div>
          <div className="rb-status">
            {mode === "idle" ? (
              <span className="rb-status-text">{t("ready")}</span>
            ) : isDone ? (
              // Владелец 21.11: после печати — зелёная «Распечатан» + OK
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2Icon width={15} height={15} strokeWidth={2.25} />
                {t("printed")}
              </span>
            ) : (
              <button type="button" onClick={reset} className="rb-tear">
                <RotateCcwIcon width={13} height={13} strokeWidth={2.25} />
                {t("reset")}
              </button>
            )}
          </div>
        </div>

        <div ref={panelRef} className={`rb-panel ${face === "paper" ? "rb-panel--paper" : "rb-panel--card"}`}>
          {face === "idle" ? (
            <div className="rb-idle">
              <div className="rb-idle-icon">
                <ReceiptTextIcon width={20} height={20} strokeWidth={1.75} />
              </div>
              <div>
                <div className="rb-idle-heading">{t("readyHeading")}</div>
                <div className="rb-idle-sub">
                  {lines
                    .slice(0, 2)
                    .map((l) => l.label)
                    .join(" · ")}
                </div>
              </div>
              <button type="button" onClick={start} className="rb-print">
                {t("print")}
              </button>
            </div>
          ) : (
            <div className="rb-paper-content">
              {rows.map((row, i) => (
                <div key={i} className={`rb-line ${i < shown ? "shown" : ""}`}>
                  {row.kind === "sub" && <div className="rb-sub">{row.text}</div>}
                  {row.kind === "rule" && <div className="rb-rule" />}
                  {row.kind === "item" && (
                    <div className="rb-row">
                      <span>{row.label}</span>
                      <span className="rb-value">{row.value}</span>
                    </div>
                  )}
                  {row.kind === "total" && (
                    <div className="rb-total">
                      <span>{t("total")}</span>
                      <span className="rb-value">{total}</span>
                    </div>
                  )}
                  {row.kind === "thanks" && <div className="rb-thanks">{row.text}</div>}
                  {row.kind === "qr" && (
                    <div className="rb-qr">
                      <div className="rb-qr-label">{t("qrLabel")}</div>
                      {/* Брендированный QR с атомом в центре (Фаза G) */}
                      <BrandedQr payload={qrPayload ?? code} size={132} />
                      <div className="rb-qr-note">{qrPayload ?? "revoluttime.de"}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rb-foot">
          {mode === "idle" ? (
            <span>{t("footIdle")}</span>
          ) : isDone ? (
            // Владелец 21.11: «Печатаем...» висело и после конца анимации
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2Icon width={14} height={14} strokeWidth={2.25} />
              {t("printed")}
            </span>
          ) : (
            <span className="rb-dots">
              {t("footPrinting")}
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
