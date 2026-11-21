import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { connection } from "next/server";
import {
  CreditCardIcon,
  MailWarningIcon,
  UserRoundIcon,
  UsersIcon,
  SettingsIcon,
  HeartHandshakeIcon,
} from "lucide-react";

import { formatPrice, type Locale } from "@/lib/products";
import { dbConfigured, dbOne } from "@/lib/ultra/db";
// вторая строка db-импортов ниже — из предыдущей версии страницы, удаляем дубль
import { ProfileSummaryCard } from "@/components/cabinet/ProfileSummaryCard";
import { ProfileSettingsCard } from "@/components/cabinet/ProfileSettingsCard";
import { AccountSecurityPanel } from "@/components/cabinet/AccountSecurityPanel";
import { BillingPanel } from "@/components/cabinet/BillingPanel";
import { CabinetStatusBridge } from "@/components/cabinet/CabinetStatusBridge";
import { CabinetTabs, type CabinetTabDef } from "@/components/cabinet/CabinetTabs";
import { getSessionUser } from "@/lib/auth-session";
import { isSyntheticAnchor } from "@/lib/anchor";
import {
  getAccountEmailStatus,
  shouldOfferEmailLink,
} from "@/lib/account-status";

export async function generateMetadata(
  props: PageProps<"/[lang]/cabinet">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "cabinet.meta" });
  return { title: t("title"), robots: { index: false } };
}

/** Дата регистрации + реальный баланс (users); грейсфул без БД. */
async function readUserInfo(
  email: string
): Promise<{ registeredAt: string | null; balanceCents: number | null }> {
  if (!dbConfigured()) return { registeredAt: null, balanceCents: null };
  try {
    await connection();
    const row = await dbOne<{ created_at: string | null; balance: number | null }>(
      `SELECT created_at, balance FROM users WHERE email = $1`,
      [email]
    );
    const balance = row?.balance;
    return {
      registeredAt: row?.created_at ?? null,
      balanceCents: balance != null ? Math.round(Number(balance) * 100) : null,
    };
  } catch {
    return { registeredAt: null, balanceCents: null };
  }
}

export default async function CabinetPage({
  params,
}: PageProps<"/[lang]/cabinet">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const locale = lang as Locale;
  const t = await getTranslations("cabinet");
  const user = await getSessionUser();

  if (!user) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 py-24 text-center">
        <UsersIcon className="size-10 text-muted-foreground/40" />
        <h1 className="text-2xl font-bold tracking-tight">{t("loginRequired")}</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {t("loginHint")}
        </p>
      </section>
    );
  }

  // Владелец 22.11 №7: кабинет = Профиль / Настройки / Оплата / Друзья.
  // Партнёрская часть переехала на /partner/dashboard (Сводка/Сеть/Платежи).
  const { registeredAt, balanceCents } = await readUserInfo(user.email);
  const emailLinked = !isSyntheticAnchor(user.email);
  const providerLabel =
    user.provider === "google" ? "Google" : user.provider === "facebook" ? "Facebook" : "Telegram";

  // Фаза E (владелец 21.11): баннер «привяжите email» после первой оплаты.
  const emailBanner = shouldOfferEmailLink(await getAccountEmailStatus(user.email));

  const tabs: CabinetTabDef[] = [
    {
      id: "profile",
      hash: "profile",
      label: t("tabs.profile"),
      icon: <UserRoundIcon className="size-4" />,
      content: (
        // №7: две колонки — карточка профиля | описание и инфа + «Изменить»
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          <ProfileSummaryCard
            user={user}
            registeredAt={registeredAt}
            emailLinked={emailLinked}
            registeredLabel={t("registeredAt")}
            providerLabel={providerLabel}
          />
          <div className="flex flex-col gap-4 rounded-3xl border bg-card p-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">{t("profileInfo.title")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("profileInfo.text", { provider: providerLabel })}
              </p>
            </div>
            <dl className="flex flex-col gap-2 border-t pt-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{t("registeredAt")}</dt>
                <dd className="font-medium tabular-nums">
                  {registeredAt
                    ? new Intl.DateTimeFormat("de-DE", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(new Date(registeredAt))
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{t("profileInfo.provider")}</dt>
                <dd className="font-medium">{providerLabel}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{t("profileInfo.partnerProgram")}</dt>
                <dd>
                  <a
                    href={`/${lang}/partner/dashboard`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {t("profileInfo.partnerProgramCta")}
                  </a>
                </dd>
              </div>
            </dl>
            {/* Кнопка «Изменить» → вкладка настроек (№7) */}
            <div className="mt-auto border-t pt-4">
              <a
                href="#settings"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
              >
                <SettingsIcon className="size-4" />
                {t("profileInfo.edit")}
              </a>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "settings",
      hash: "settings",
      extraHashes: ["links"],
      label: t("tabs.settings"),
      icon: <SettingsIcon className="size-4" />,
      content: (
        // №7: слева карточка с карандашами, справа — сервисы/пароль/email,
        // ниже отдельным блоком одной колонкой — экспорт и удаление.
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          <ProfileSettingsCard user={user} />
          <AccountSecurityPanel user={user} />
        </div>
      ),
    },
    {
      id: "billing",
      hash: "billing",
      extraHashes: ["purchases"],
      label: t("tabs.billing"),
      icon: <CreditCardIcon className="size-4" />,
      content: (
        <BillingPanel onDemoNote={t("demoNote")} />
      ),
    },
    {
      id: "friends",
      hash: "friends",
      label: t("tabs.friends"),
      icon: <HeartHandshakeIcon className="size-4" />,
      content: (
        // №7: пустая вкладка — компонент друзей появится позже
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed px-4 py-20 text-center">
          <UsersIcon className="size-10 text-muted-foreground/40" />
          <h2 className="text-lg font-semibold">{t("friendsEmpty.title")}</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {t("friendsEmpty.text")}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* Кабинет-режим шапки: мост кладёт значения в стор для Header.
          Баланс — реальный из users (null → чип скрыт). */}
      <CabinetStatusBridge
        balanceLabel={balanceCents != null ? formatPrice(balanceCents, locale) : null}
        partnersCount={null}
        userName={user.name ?? user.email}
      />

      {emailBanner && (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-500/40 bg-amber-500/[0.06] p-5 sm:flex-row sm:items-center">
          <MailWarningIcon className="size-8 shrink-0 text-amber-500" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              {t("emailBanner.title")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {t("emailBanner.text", {
                provider: user.provider === "google" ? "Google" : user.provider === "facebook" ? "Facebook" : "Telegram",
              })}
            </p>
          </div>
          {/* API-эндпоинт OAuth — <a> корректен */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/auth/google/start?link=1"
            className="shrink-0 rounded-lg border border-[var(--primary-border)] bg-[var(--primary)] px-4 py-2 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t("emailBanner.cta")}
          </a>
        </div>
      )}

      <CabinetTabs ariaLabel={t("title")} tabs={tabs} />
    </div>
  );
}
