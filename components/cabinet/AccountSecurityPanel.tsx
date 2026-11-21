"use client";

/** Вторая колонка «Настроек» (владелец 22.11 №7): привязка/отвязка
 *  сервисов, смена пароля/email — и ОТДЕЛЬНЫЙ блок под ними одной
 *  колонкой: экспорт данных и удаление аккаунта. Контент перенесён из
 *  бывшего ProfileCard (Фаза E). */

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { KeyRoundIcon, MailIcon, Trash2Icon } from "lucide-react";

import { signOut } from "@/lib/auth-store";
import type { SessionUser } from "@/lib/auth-session";
import { isSyntheticAnchor } from "@/lib/anchor";
import { LinkedAccounts } from "@/components/cabinet/LinkedAccounts";
import { GoogleIcon } from "@/components/layout/auth-icons";
import { useNotice } from "@/components/ui/notice";

const btnGhost =
  "inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary, var(--muted-foreground))] hover:text-foreground hover:border-[var(--color-primary)]/30 transition-colors whitespace-nowrap";
const btnDanger =
  "inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg border border-[var(--color-error)]/40 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors whitespace-nowrap";
const inputClass =
  "h-10 w-full rounded-lg border bg-[var(--bg-input)] px-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)]/50";
const sectionTitleClass =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-foreground";

const PROVIDER_LABEL: Record<SessionUser["provider"], string> = {
  google: "Google",
  telegram: "Telegram",
  facebook: "Facebook",
};

export function AccountSecurityPanel({ user }: { user: SessionUser }) {
  const t = useTranslations("cabinet.settings");
  const tp = useTranslations("cabinet.profile");
  const { notice } = useNotice();
  const locale = useLocale();

  function handleExport(format: "json" | "csv" | "txt") {
    const exportData = {
      email: user.email,
      name: user.name ?? "",
      provider: user.provider,
      exportedAt: new Date().toISOString(),
    };
    let content: string;
    let mime: string;
    switch (format) {
      case "csv":
        content =
          Object.keys(exportData).join(",") +
          "\n" +
          Object.values(exportData).map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",");
        mime = "text/csv";
        break;
      case "txt":
        content = Object.entries(exportData)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n");
        mime = "text/plain";
        break;
      default:
        content = JSON.stringify(exportData, null, 2);
        mime = "application/json";
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revoluttime-data-${user.email}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    notice({ text: tp("exportDone"), variant: "success" });
  }

  async function handleDelete() {
    if (!window.confirm(tp("deleteConfirm"))) return;
    await signOut();
    // Остаться на месте, сброс клиентского состояния полной перезагрузкой (№2).
    window.location.reload();
  }

  return (
    <div className="flex h-full flex-col gap-6 rounded-3xl border bg-card p-6">
      {/* Привязка/отвязка сервисов */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold tracking-tight">{t("title")}</h2>
        <LinkedAccounts />
      </div>

      {/* Пароль: email-входа нет (владелец 21.11) — вход через сервисы */}
      <div className="flex flex-col gap-2 border-t pt-4">
        <h3 className={sectionTitleClass}>
          <KeyRoundIcon className="size-4 text-primary" />
          {tp("passTitle")}
        </h3>
        <div>
          <label htmlFor="old-pass" className="text-xs font-medium text-muted-foreground">
            {tp("oldPass")}
          </label>
          <input
            id="old-pass"
            type="text"
            className={`${inputClass} cursor-not-allowed opacity-60`}
            placeholder={tp("passNotCreated")}
            value=""
            readOnly
            disabled
            aria-disabled="true"
            autoComplete="off"
            name="old-password-settings"
          />
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">{tp("passHint")}</p>
      </div>

      {/* Email аккаунта (Фаза E) */}
      <div className="flex flex-col gap-2 border-t pt-4">
        <h3 className={sectionTitleClass}>
          <MailIcon className="size-4 text-primary" />
          {tp("emailTitle")}
        </h3>
        {isSyntheticAnchor(user.email) ? (
          <>
            <div className="rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-muted-foreground">
              {tp("emailMissing")}
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {tp("emailLinkGoogleHint")}
            </p>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth-редирект */}
            <a
              href="/api/auth/google/start?link=1"
              className="mt-1 inline-flex w-fit items-center justify-center gap-1.5 self-start rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              <GoogleIcon className="size-4" />
              {tp("emailLinkGoogleCta")}
            </a>
          </>
        ) : (
          <>
            <div>
              <label htmlFor="account-email" className="text-xs font-medium text-muted-foreground">
                {tp("emailLabel")}
              </label>
              <input
                id="account-email"
                type="text"
                className={`${inputClass} cursor-not-allowed opacity-60`}
                value={user.email}
                readOnly
                disabled
                aria-disabled="true"
                autoComplete="off"
                name="account-email"
              />
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {tp("emailFromProvider", { provider: PROVIDER_LABEL[user.provider] })}
            </p>
          </>
        )}
      </div>

      {/* Экспорт и удаление — отдельным блоком одной колонкой (№7) */}
      <div className="mt-auto flex flex-col gap-2 border-t pt-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => handleExport("json")} className={btnGhost}>
            {tp("exportJson")}
          </button>
          <button type="button" onClick={() => handleExport("csv")} className={btnGhost}>
            {tp("exportCsv")}
          </button>
          <button type="button" onClick={() => handleExport("txt")} className={btnGhost}>
            {tp("exportTxt")}
          </button>
        </div>
        <button type="button" onClick={handleDelete} className={`${btnDanger} w-fit`}>
          <Trash2Icon className="w-4 h-4" />
          {tp("deleteAccount")}
        </button>
        <p className="text-[11px] leading-relaxed text-muted-foreground">{tp("gdprNote")}</p>
      </div>
    </div>
  );
}
