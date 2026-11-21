"use client";

/** Уведомления (владелец 22.11 №9): иконочная кнопка-колокольчик в шапке
 *  с красной точкой при непрочитанных + выпадающее меню как юзер-меню.
 *  Категории: order/payment/friend/withdraw/system; статусы
 *  info/success/warning/danger. Анонимам кнопка не показывается. */

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangleIcon,
  BellIcon,
  CheckCheckIcon,
  CircleCheckIcon,
  CircleXIcon,
  CogIcon,
  CreditCardIcon,
  InfoIcon,
  ShoppingCartIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuthUser } from "@/lib/auth-store";

interface NotificationItem {
  id: string;
  category: string;
  status: string;
  title: string;
  body: string | null;
  href: string | null;
  read: boolean;
  createdAt: string;
}

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  order: <ShoppingCartIcon className="size-4" />,
  payment: <CreditCardIcon className="size-4" />,
  friend: <UsersIcon className="size-4" />,
  withdraw: <WalletIcon className="size-4" />,
  system: <CogIcon className="size-4" />,
};

const STATUS_STYLE: Record<string, { icon: React.ReactNode; className: string }> = {
  info: {
    icon: <InfoIcon className="size-3.5" />,
    className: "bg-muted text-muted-foreground",
  },
  success: {
    icon: <CircleCheckIcon className="size-3.5" />,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    icon: <AlertTriangleIcon className="size-3.5" />,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  danger: {
    icon: <CircleXIcon className="size-3.5" />,
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
};

export function NotificationsBell() {
  const t = useTranslations("notifications");
  const user = useAuthUser();
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/notifications", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { items?: NotificationItem[]; unread?: number } | null) => {
        if (data) {
          setItems(data.items ?? []);
          setUnread(data.unread ?? 0);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [user]);

  // Поллсим при открытии; точка обновится и после закрытия меню.
  React.useEffect(() => {
    if (open) load();
  }, [open, load]);

  function markAll() {
    fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read_all" }),
    })
      .then(() => load())
      .catch(() => undefined);
  }

  function markRead(id: string) {
    fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", id }),
    })
      .then(() => load())
      .catch(() => undefined);
  }

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("title")}
          data-tip={t("title")}
          data-tip-pos="bottom"
          className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover-bg)] hover:text-[var(--text-heading)]"
        >
          <BellIcon className="size-4" />
          {unread > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[var(--color-error)] ring-2 ring-[var(--bg-card)]"
              aria-hidden
            />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-85 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">{t("title")}</p>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAll}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] underline-offset-4 hover:underline"
            >
              <CheckCheckIcon className="size-3.5" />
              {t("markAll")}
            </button>
          )}
        </div>

        <div className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
          {loading && items.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">…</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              {t("empty")}
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {items.map((item) => {
                const status = STATUS_STYLE[item.status] ?? STATUS_STYLE.info;
                return (
                  <li
                    key={item.id}
                    className={`flex items-start gap-2.5 rounded-xl p-3 transition-colors ${
                      item.read ? "" : "bg-primary/5"
                    }`}
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full ${status.className}`}
                    >
                      {CATEGORY_ICON[item.category] ?? CATEGORY_ICON.system}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-sm font-medium leading-snug">
                        <span className="truncate">{item.title}</span>
                        <span
                          className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${status.className}`}
                        >
                          {status.icon}
                        </span>
                        {!item.read && (
                          <span className="size-1.5 shrink-0 rounded-full bg-[var(--color-error)]" aria-hidden />
                        )}
                      </p>
                      {item.body && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {item.body}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          {new Intl.DateTimeFormat("de-DE", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(item.createdAt))}
                        </span>
                        {!item.read && (
                          <button
                            type="button"
                            onClick={() => markRead(item.id)}
                            className="text-[10px] text-[var(--color-primary)] underline-offset-2 hover:underline"
                          >
                            {t("markRead")}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
