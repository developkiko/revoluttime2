"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ImagePlusIcon, KeyRoundIcon, MailIcon, Trash2Icon } from "lucide-react";

import {
  fileToAvatarDataUrl,
  saveProfileOverlay,
  useProfileOverlay,
} from "@/lib/profile-store";
import { refreshSessionUser, signOut } from "@/lib/auth-store";
import type { SessionUser } from "@/lib/auth-session";
import { isSyntheticAnchor } from "@/lib/anchor";
import { useNotice } from "@/components/ui/notice";
import { LinkedAccounts } from "@/components/cabinet/LinkedAccounts";
import { GoogleIcon } from "@/components/layout/auth-icons";

/** Провайдер для подписи «email из сервиса» (Фаза E). */
const PROVIDER_LABEL: Record<SessionUser["provider"], string> = {
  google: "Google",
  telegram: "Telegram",
  facebook: "Facebook",
};

const inputClass =
  "w-full min-w-0 px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--color-primary)]";
const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 whitespace-nowrap";
const btnGhost =
  "inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary, var(--muted-foreground))] hover:text-foreground hover:border-[var(--color-primary)]/30 transition-colors whitespace-nowrap";
const btnDanger =
  "inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg border border-[var(--color-error)]/40 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors whitespace-nowrap";
const sectionTitleClass =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-foreground";
const labelClass = "text-xs font-medium text-muted-foreground";

export function ProfileCard({ user }: { user: SessionUser }) {
  const t = useTranslations("cabinet.profile");
  
  const { notice } = useNotice();
  const overlay = useProfileOverlay(user.email);
  // null = untouched, fall back to the saved overlay/provider name
  const [draftName, setDraftName] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const currentName = draftName ?? overlay?.displayName ?? "";
  const providerAvatar = user.picture;
  const avatarSrc = overlay?.avatarDataUrl ?? providerAvatar;
  const initial = (overlay?.displayName ?? user.name ?? user.email).charAt(0);

  async function pickFile(file: File) {
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      saveProfileOverlay(user.email, {
        ...(overlay ?? {}),
        avatarDataUrl: dataUrl,
      });
      notice({ text: t("avatarSaved"), variant: "success" });
    } catch {
      notice({ text: t("avatarError"), variant: "error" });
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      saveProfileOverlay(user.email, {
        ...(overlay ?? {}),
        displayName: draftName?.trim() || undefined,
      });
      await refreshSessionUser();
      notice({ text: t("saved"), variant: "success" });
    } finally {
      setSaving(false);
    }
  }

  function handleExport(format: "json" | "csv" | "txt") {
    const exportData = {
      email: user.email,
      name: user.name ?? "",
      provider: user.provider,
      displayName: overlay?.displayName ?? "",
      avatarUploaded: Boolean(overlay?.avatarDataUrl),
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
    notice({ text: t("exportDone"), variant: "success" });
  }

  async function handleDelete() {
    if (!window.confirm(t("deleteConfirm"))) return;
    await signOut();
    // Полную перезагрузку оставили (сброс всего клиентского состояния),
    // но БЕЗ увода на главную — остаёмся на текущей странице
    // (владелец 22.11 №2); страница покажет своё «войдите» состояние.
    window.location.reload();
  }

  return (
    <div className="flex h-full flex-col rounded-3xl border bg-card p-6">
      <h2 className="text-xl font-bold tracking-tight">{t("title")}</h2>

      <div className="mt-5 flex items-center gap-4">
        <div className="relative">
          <span className="flex size-20 items-center justify-center overflow-hidden rounded-full border bg-muted text-2xl font-bold uppercase text-muted-foreground">
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL / provider CDN, no next/image config needed
              <img src={avatarSrc} alt="" className="size-full object-cover" />
            ) : (
              initial
            )}
          </span>
          <button
            type="button"
            aria-label={t("uploadAvatar")}
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border bg-background text-primary shadow-sm transition-transform hover:scale-110"
          >
            <ImagePlusIcon className="size-4" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) pickFile(file);
              e.target.value = "";
            }}
          />
        </div>
        <div className="min-w-0 text-sm">
          <p className="font-semibold">{overlay?.displayName ?? user.name}</p>
          {/* Синтетические якоря (id@telegram.revoluttime) не показываем —
              провайдер виден по чипу ниже (владелец 21.11) */}
          {!isSyntheticAnchor(user.email) && (
            <p className="truncate text-muted-foreground">{user.email}</p>
          )}
          <p className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
            {user.provider}
          </p>
        </div>
      </div>

      {/* Способы входа: привязка/отвязка сервисов (см. LinkedAccounts) */}
      <LinkedAccounts />

      <div className="mt-5 flex flex-col gap-1">
        <label htmlFor="cabinet-name" className={labelClass}>
          {t("displayName")}
        </label>
        <div className="flex gap-2">
          <input
            id="cabinet-name"
            value={currentName}
            placeholder={user.name}
            onChange={(e) => setDraftName(e.target.value)}
            className={inputClass}
          />
          <button type="button" onClick={handleSave} disabled={saving} className={btnPrimary}>
            {saving ? "…" : t("save")}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">{t("displayNameHint")}</p>
      </div>

      {/* Пароль: email-входа нет (решение владельца 21.11) — вход через сервисы.
          Поле disabled с «Пароль не создавался»; смена пароля появится
          вместе с email-сервисом (need-connect.md). */}
      <div className="mt-6 flex flex-col gap-2 border-t pt-4">
        <h3 className={sectionTitleClass}>
          <KeyRoundIcon className="size-4 text-primary" />
          {t("passTitle")}
        </h3>
        <div>
          <label htmlFor="old-pass" className={labelClass}>{t("oldPass")}</label>
          <input
            id="old-pass"
            type="text"
            className={`${inputClass} cursor-not-allowed opacity-60`}
            placeholder={t("passNotCreated")}
            value=""
            readOnly
            disabled
            aria-disabled="true"
            autoComplete="off"
            name="old-password-settings"
          />
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">{t("passHint")}</p>
      </div>

      {/* Email аккаунта: email приходит из сервиса входа (владелец 21.11).
          Синтетический якорь (Telegram/Facebook) — предлагаем привязать Google,
          у реального email — показываем его и честный знак, что смена
          будет позже, с email-сервисом. */}
      <div className="mt-6 flex flex-col gap-2 border-t pt-4">
        <h3 className={sectionTitleClass}>
          <MailIcon className="size-4 text-primary" />
          {t("emailTitle")}
        </h3>
        {isSyntheticAnchor(user.email) ? (
          <>
            <div className="rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-muted-foreground">
              {t("emailMissing")}
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {t("emailLinkGoogleHint")}
            </p>
            {/* API-эндпоинт OAuth (ставит cookie и редиректит) — <a> корректен,
                полная навигация нужна; Link тут не применим. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/api/auth/google/start?link=1"
              className={`${btnPrimary} mt-1 self-start no-underline`}
            >
              <GoogleIcon className="size-4" />
              {t("emailLinkGoogleCta")}
            </a>
          </>
        ) : (
          <>
            <div>
              <label htmlFor="account-email" className={labelClass}>{t("emailLabel")}</label>
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
              {t("emailFromProvider", { provider: PROVIDER_LABEL[user.provider] })}
            </p>
          </>
        )}
      </div>

      {/* Data: export in three formats + delete */}
      <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
        <button type="button" onClick={() => handleExport("json")} className={btnGhost}>
          {t("exportJson")}
        </button>
        <button type="button" onClick={() => handleExport("csv")} className={btnGhost}>
          {t("exportCsv")}
        </button>
        <button type="button" onClick={() => handleExport("txt")} className={btnGhost}>
          {t("exportTxt")}
        </button>
        <button type="button" onClick={handleDelete} className={`${btnDanger} ml-auto`}>
          <Trash2Icon className="w-4 h-4" />
          {t("deleteAccount")}
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        {t("gdprNote")}
      </p>
    </div>
  );
}
