"use client";

import { useRouter } from "next/navigation";
import { BellIcon } from "lucide-react";

import { useNotice } from "@/components/ui/notice";

/**
 * Демо FX-модулей на /dummy: снекбары (useNotice) + тултипы (data-tip API,
 * чистый CSS в globals.css). Тултипы — атрибуты прямо на кнопках.
 */
export function FxDemo() {
  const { notice } = useNotice();
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12" data-spotlight>
      <h2 className="text-xl font-bold tracking-tight">FX-модули</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Уведомления-снекбары (useNotice), тултипы (data-tip) и 3D-наклон
        карточек (data-tilt) — порты с референс-dummy, адаптированы под
        Ultra-палитру. Вози курсором по фону — подсветка идёт за ним.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5" data-tilt>
          <BellIcon className="mb-3 size-6 text-primary" aria-hidden="true" />
          <h3 className="font-semibold">Простое уведомление</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Текст без действий, автозакрытие 4с.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-[var(--color-primary)]/40"
            onClick={() => notice({ text: "Настройки сохранены" })}
          >
            Показать
          </button>
        </div>

        <div className="rounded-2xl border bg-card p-5" data-tilt>
          <h3 className="font-semibold">С кнопкой-действием</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Клик по действию закрывает плашку и выполняет колбэк.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-[var(--color-primary)]/40"
            onClick={() =>
              notice({
                text: "Черновик удалён",
                action: {
                  label: "Вернуть",
                  onClick: () => notice({ text: "Черновик восстановлен" }),
                },
                duration: 6000,
              })
            }
          >
            Удалить черновик
          </button>
        </div>

        <div className="rounded-2xl border bg-card p-5" data-tilt>
          <h3 className="font-semibold">С переходом</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Действие-навигация: уведомление как мягкий редирект.
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-[var(--color-primary)]/40"
            onClick={() =>
              notice({
                text: "Товар в корзине — оформить?",
                action: { label: "К оформлению", onClick: () => router.push("/shop") },
                duration: 6000,
              })
            }
          >
            В корзину
          </button>
        </div>
      </div>

      {/* Тултипы: позиции и варианты (data-tip API, без JS) */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          data-tip="Сверху (по умолчанию)"
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--color-primary)]/40"
        >
          top
        </button>
        <button
          type="button"
          data-tip="Справа"
          data-tip-pos="right"
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--color-primary)]/40"
        >
          right
        </button>
        <button
          type="button"
          data-tip="Снизу"
          data-tip-pos="bottom"
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--color-primary)]/40"
        >
          bottom
        </button>
        <button
          type="button"
          data-tip="Слева"
          data-tip-pos="left"
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--color-primary)]/40"
        >
          left
        </button>
        <button
          type="button"
          data-tip="Основной цвет"
          data-tip-variant="primary"
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--color-primary)]/40"
        >
          primary
        </button>
        <button
          type="button"
          data-tip="Акцент"
          data-tip-variant="accent"
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--color-primary)]/40"
        >
          accent
        </button>
        <button
          type="button"
          data-tip="Ошибка/запрет"
          data-tip-variant="danger"
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--color-primary)]/40"
        >
          danger
        </button>
        <button
          type="button"
          data-tip={"Многострочный режим (data-tip-size=wide):\nперенос слов, ширина до 17rem"}
          data-tip-size="wide"
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--color-primary)]/40"
        >
          wide
        </button>
        <button
          type="button"
          data-tip="Появился не сразу"
          data-tip-delay="slow"
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--color-primary)]/40"
        >
          slow
        </button>
        <span className="tip-term text-sm text-muted-foreground" data-tip="Так помечаем термины" data-tip-size="wide">
          tip-term
        </span>
      </div>
    </div>
  );
}
