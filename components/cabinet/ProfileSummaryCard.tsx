import { BadgeCheckIcon, MailIcon, ShieldCheckIcon, UserIcon } from "lucide-react";

import { LinkedAccounts } from "@/components/cabinet/LinkedAccounts";
import type { SessionUser } from "@/lib/auth-session";
import { isSyntheticAnchor } from "@/lib/anchor";

/** Компактная карточка профиля (владелец 22.11 №7): аватар/имя/email/
 *  провайдер + дата регистрации. Без кнопок редактирования — те живут
 *  во вкладке «Настройки». Server component: дата приходит с сервера. */

export function ProfileSummaryCard({
  user,
  registeredAt,
  emailLinked,
  registeredLabel,
  providerLabel,
}: {
  user: SessionUser;
  /** ISO-дата регистрации из users.created_at (null — не получена). */
  registeredAt: string | null;
  /** К якорю не привязан реальный email (Google) — «почта не привязана». */
  emailLinked: boolean;
  /** Локализованные подписи (строятся на сервере). */
  registeredLabel: string;
  providerLabel: string;
}) {
  const initial = (user.name ?? user.email).charAt(0).toUpperCase();

  return (
    <div className="flex h-full flex-col rounded-3xl border bg-card p-6">
      <div className="flex items-center gap-4">
        <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-2xl font-bold uppercase text-muted-foreground">
          {user.picture ? (
            // eslint-disable-next-line @next/next/no-img-element -- provider CDN, no next/image config needed
            <img src={user.picture} alt="" className="size-full object-cover" />
          ) : (
            initial
          )}
        </span>
        <div className="min-w-0 text-sm">
          <p className="truncate text-lg font-bold">{user.name}</p>
          {!isSyntheticAnchor(user.email) && (
            <p className="truncate text-muted-foreground">{user.email}</p>
          )}
          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
            <UserIcon className="size-3" />
            {providerLabel}
          </p>
        </div>
      </div>

      <dl className="mt-6 flex flex-col gap-3 border-t pt-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <BadgeCheckIcon className="size-4 shrink-0 text-primary" />
            {registeredLabel}
          </dt>
          <dd className="font-medium tabular-nums">
            {registeredAt
              ? new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric" }).format(
                  new Date(registeredAt)
                )
              : "—"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <MailIcon className="size-4 shrink-0 text-primary" />
            Email
          </dt>
          <dd>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                emailLinked
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              {emailLinked ? user.email : "—"}
            </span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <ShieldCheckIcon className="size-4 shrink-0 text-primary" />
            2FA
          </dt>
          <dd className="text-xs text-muted-foreground">—</dd>
        </div>
      </dl>

      {/* Привязки сервисов — карточка одна на обе вкладки (№7) */}
      <div className="mt-auto border-t pt-4">
        <LinkedAccounts />
      </div>
    </div>
  );
}
