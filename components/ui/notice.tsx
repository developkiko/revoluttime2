"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  X,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Модуль уведомлений-снекбаров (порт с revoluttime.vercel.app/ru/dummy,
 * codepen.io/karakym/pen/VYpxpRx: material snackbar → React-контекст:
 * вызов из любого клиентского модуля, как useToast/useModal).
 *
 *   const { notice } = useNotice();
 *   notice({ text: "Сохранено" });
 *   notice({ text: "Ошибка сервера", variant: "error" });
 *   notice({
 *     text: "Черновик удалён",
 *     action: { label: "Вернуть", onClick: restore },
 *     duration: 6000,
 *   });
 *
 * Плашка приезжает сверху (под шапкой), исчезает сама по таймеру
 * (по умолчанию 4с), по крестику или после клика по действию.
 * Перезапуск анимации повторным вызовом — через key-ремаунт (без rAF:
 * в перекрытых/фоновых окнах requestAnimationFrame не тикает).
 * Цвета — инверсия активной темы: на light тёмная плашка, на dark светлая.
 * variant добавляет иконку семантики (success/error/info/warning);
 * без variant — нейтральная плашка без иконки.
 */

export type NoticeVariant = "success" | "error" | "info" | "warning";

export interface NoticeAction {
  label: string;
  onClick: () => void;
}

export interface NoticeOptions {
  text: string;
  action?: NoticeAction;
  /** мс до автозакрытия (по умолчанию 4000) */
  duration?: number;
  variant?: NoticeVariant;
}

const NOTICE_ICONS: Record<NoticeVariant, LucideIcon> = {
  success: CheckCircle2Icon,
  error: XCircleIcon,
  info: InfoIcon,
  warning: AlertTriangleIcon,
};

const NoticeContext = createContext<{ notice: (o: NoticeOptions) => void }>({
  notice: () => {},
});

export function useNotice() {
  return useContext(NoticeContext);
}

const CLOSE_MS = 200;

/** One shown notice; id re-mounts the bar so the entrance animation restarts. */
interface NoticeEntry extends NoticeOptions {
  id: number;
}

export function NoticeProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<NoticeEntry | null>(null);
  const [closing, setClosing] = useState(false);
  const seq = useRef(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notice = useCallback((o: NoticeOptions) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    seq.current += 1; // event-handler context: refs are fine here
    setClosing(false);
    setCurrent({ ...o, id: seq.current });
  }, []);

  const close = useCallback(() => {
    setClosing(true);
    closeTimer.current = setTimeout(() => setCurrent(null), CLOSE_MS);
  }, []);

  // автозакрытие по таймеру (перезапускается на каждый новый notice)
  useEffect(() => {
    if (!current || closing) return;
    const t = setTimeout(close, current.duration ?? 4000);
    return () => clearTimeout(t);
  }, [current, closing, close]);

  const Icon = current?.variant ? NOTICE_ICONS[current.variant] : null;

  return (
    <NoticeContext.Provider value={{ notice }}>
      {children}
      {current && (
        <div
          key={current.id}
          role="status"
          aria-live="polite"
          className={cn(
            "notice",
            current.variant && `notice--${current.variant}`,
            closing && "notice--closing",
          )}
        >
          {Icon && <Icon className="notice-icon size-4 shrink-0" aria-hidden="true" />}
          <span className="notice-text">{current.text}</span>
          {current.action && (
            <button
              type="button"
              className="notice-action"
              onClick={() => {
                current.action!.onClick();
                close();
              }}
            >
              {current.action.label}
            </button>
          )}
          <button type="button" className="notice-close" aria-label="Закрыть" onClick={close}>
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </NoticeContext.Provider>
  );
}
