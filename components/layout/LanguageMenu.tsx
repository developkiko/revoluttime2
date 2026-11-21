"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";

import { routing } from "@/i18n/routing";

/** Короткий код языка для пилюли-триггера. */
const LOCALE_CODES: Record<string, string> = { de: "DE", ru: "RU", en: "EN" };

/** Название языка на самом языке (в списке). */
const LOCALE_NAMES: Record<string, string> = {
  de: "Deutsch",
  ru: "Русский",
  en: "English",
};

/**
 * Поисковые теги на 2 языках (владелец 21.11): «рус…», «rus», «ru» →
 * русский; «eng…», «en» → english и т.д. Локали добавляются строкой здесь
 * + в i18n/routing.ts — компонент рендерит список из routing.locales.
 */
const LOCALE_TAGS: Record<string, string[]> = {
  de: ["de", "deutsch", "german", "немецкий", "немец", "герман"],
  ru: ["ru", "рус", "russian", "русский", "российский"],
  en: ["en", "english", "англ", "английский", "инглиш"],
};

/**
 * Кастомный селект языка (владелец 21.11 — «переосмыслить»): компактный
 * триггер-пилюля + панель с поиском. Смена локали — клиентская навигация
 * (router.replace), без перезагрузки страницы. Список:
 * • колесо мыши / ↑↓ — перелистывание с БЕСКОНЕЧНЫМ циклом;
 * • тап — выбор, зажать и тянуть — драг-скролл списка;
 * • ввод букв — поиск по тегам (нативное имя + LOCALE_TAGS + код).
 */
export function LanguageMenu() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const locales = routing.locales;

  const matches = React.useMemo<string[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...locales];
    return [...locales].filter((loc) => {
      const haystack = [
        loc,
        LOCALE_NAMES[loc] ?? "",
        ...(LOCALE_TAGS[loc] ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [locales, query]);

  // Открытие: сброс поиска, активным — текущая локаль
  React.useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIdx(Math.max(0, matches.indexOf(locale)));
    // фокус в поиск после монтирования панели
    requestAnimationFrame(() => inputRef.current?.focus());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- matches не нужен при открытии
  }, [open]);

  // Клик вне — закрыть
  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const select = (loc: string) => {
    setOpen(false);
    if (loc !== locale) {
      // Клиентская навигация next-intl — без полной перезагрузки
      router.replace(pathname, { locale: loc });
    }
  };

  // Бесконечный цикл выделения + скролл к выделенному
  const cycle = (dir: 1 | -1) => {
    if (matches.length === 0) return;
    setActiveIdx((i) => {
      const next = (i + dir + matches.length) % matches.length;
      return next;
    });
  };
  React.useEffect(() => {
    const el = listRef.current?.children[activeIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const onWheel = (event: React.WheelEvent) => {
    // Колесо листает ВЫДЕЛЕНИЕ с бесконечным циклом (не позицию скролла)
    event.preventDefault();
    cycle(event.deltaY > 0 ? 1 : -1);
  };

  // Драг-скролл списка мышью/тачем (зажать и тянуть)
  const dragRef = React.useRef<{ y: number; top: number } | null>(null);
  const onPointerDown = (event: React.PointerEvent<HTMLUListElement>) => {
    dragRef.current = { y: event.clientY, top: listRef.current?.scrollTop ?? 0 };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLUListElement>) => {
    if (!dragRef.current) return;
    const dy = event.clientY - dragRef.current.y;
    if (Math.abs(dy) > 2 && listRef.current) {
      listRef.current.scrollTop = dragRef.current.top - dy;
    }
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  // Клавиатура на всей панели
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      cycle(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      cycle(-1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const loc = matches[activeIdx];
      if (loc) select(loc);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      {/* Триггер — компактная пилюля с текущим кодом */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border border-[var(--border-default)] px-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--text-heading)]"
        title={LOCALE_NAMES[locale]}
      >
        {LOCALE_CODES[locale] ?? locale.toUpperCase()}
        <ChevronDownIcon
          className={`size-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-xl"
          onKeyDown={onKeyDown}
        >
          {/* Поиск по тегам (english, русский, код) */}
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-3 py-2">
            <SearchIcon className="size-3.5 shrink-0 text-[var(--text-muted)]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIdx(0);
              }}
              placeholder="ru / rus / en…"
              className="w-full bg-transparent text-sm text-[var(--text-heading)] outline-none placeholder:text-[var(--text-muted)]"
            />
          </div>

          <ul
            ref={listRef}
            role="listbox"
            className="max-h-56 touch-pan-y overflow-y-auto overscroll-contain p-1"
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            style={{ scrollbarWidth: "thin" }}
          >
            {matches.length === 0 && (
              <li className="px-3 py-3 text-sm text-[var(--text-muted)]">—</li>
            )}
            {matches.map((loc, idx) => (
              <li
                key={loc}
                role="option"
                aria-selected={loc === locale}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  idx === activeIdx
                    ? "bg-[var(--hover-bg-strong)]"
                    : "hover:bg-[var(--hover-bg)]"
                }`}
                onClick={() => select(loc)}
                onPointerEnter={() => setActiveIdx(idx)}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-[var(--text-heading)]">
                    {LOCALE_NAMES[loc] ?? loc}
                  </span>
                  <span className="block truncate text-[11px] uppercase text-[var(--text-muted)]">
                    {(LOCALE_TAGS[loc] ?? []).slice(0, 2).join(" · ")}
                  </span>
                </span>
                {loc === locale && (
                  <CheckIcon className="size-4 shrink-0 text-[var(--color-primary)]" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
