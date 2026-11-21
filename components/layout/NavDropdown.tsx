"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";

/**
 * Общий дропдаун верхней навигации (Фаза D, решение владельца 21.11): один
 * компонент для «Направления» / «О нас» / «Программа» / «Правовая
 * информация». Открытие по клику и по hover, закрытие — выбор пункта,
 * Esc, клик вне. Пункты — либо ссылка (href), либо действие (onSelect,
 * например legal-модалки). Только desktop (панель скрыта < xl вместе с
 * всей верхней навигацией).
 */

export interface NavDropdownItem {
  label: string;
  href?: string;
  /** Вместо href: действие по выбору (legal-модалки в шапке). */
  onSelect?: () => void;
}

const TRIGGER_CLASS =
  "inline-flex items-center gap-1 text-sm text-[var(--text-link)] hover:text-[var(--text-heading)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--hover-bg)] font-medium whitespace-nowrap";

const ITEM_CLASS =
  "flex w-full items-center rounded-lg px-3 py-2 text-start text-sm text-[var(--text-link)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--text-heading)] whitespace-nowrap";

export function NavDropdown({
  label,
  items,
  triggerClassName,
}: {
  label: React.ReactNode;
  items: readonly NavDropdownItem[];
  /** Доп. класс триггера (динамическая кнопка «Программы» — пульс-слово). */
  triggerClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelCloseTimer = React.useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = React.useCallback(() => {
    cancelCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  }, [cancelCloseTimer]);

  // Esc / клик вне панели закрывают.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  React.useEffect(() => cancelCloseTimer, [cancelCloseTimer]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => {
        cancelCloseTimer();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={triggerClassName ?? TRIGGER_CLASS}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        {label}
        <ChevronDownIcon
          className={`size-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 top-full z-50 mt-1 min-w-[230px] -translate-x-1/2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none"
        >
          {items.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                role="menuitem"
                className={ITEM_CLASS}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={ITEM_CLASS}
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
