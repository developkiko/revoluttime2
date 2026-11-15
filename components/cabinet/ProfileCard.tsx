"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { ImagePlusIcon, KeyRoundIcon, MailIcon, Trash2Icon } from "lucide-react";

import {
  fileToAvatarDataUrl,
  saveProfileOverlay,
  useProfileOverlay,
} from "@/lib/profile-store";
import { refreshSessionUser, signOut } from "@/lib/auth-store";
import type { SessionUser } from "@/lib/auth-session";
import { useNotice } from "@/components/ui/notice";

/** Ultra dashboard API (email/password accounts live there). */
const ACCOUNT_API_BASE =
  process.env.NEXT_PUBLIC_UP_ADMIN_API_URL || "https://admin.revoluttime.de";

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
  const locale = useLocale();
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

  // ── Change password (email/password accounts) ──
  const [oldPass, setOldPass] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [newPass2, setNewPass2] = React.useState("");
  const [passLoading, setPassLoading] = React.useState(false);

  async function handleChangePassword() {
    if (!oldPass) { notice({ text: t("errPasswordEmpty"), variant: "error" }); return; }
    if (!newPass || newPass.length < 8) { notice({ text: t("errPasswordShort"), variant: "error" }); return; }
    if (newPass !== newPass2) { notice({ text: t("errConfirmMismatch"), variant: "error" }); return; }

    setPassLoading(true);
    try {
      const res = await fetch(`${ACCOUNT_API_BASE}/api/user/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          oldPassword: oldPass,
          newPassword: newPass,
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (data.success) {
        notice({ text: t("passChanged"), variant: "success" });
        setOldPass("");
        setNewPass("");
        setNewPass2("");
      } else {
        notice({ text: data.error || t("errServer"), variant: "error" });
      }
    } catch {
      notice({ text: t("serverUnavailable"), variant: "error" });
    } finally {
      setPassLoading(false);
    }
  }

  // ── Change email ──
  const [newEmail, setNewEmail] = React.useState("");
  const [emailPass, setEmailPass] = React.useState("");
  const [emailLoading, setEmailLoading] = React.useState(false);

  async function handleChangeEmail() {
    if (!newEmail) { notice({ text: t("errEmailEmpty"), variant: "error" }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { notice({ text: t("errEmailFormat"), variant: "error" }); return; }
    if (!emailPass) { notice({ text: t("errPasswordEmpty"), variant: "error" }); return; }

    setEmailLoading(true);
    try {
      const res = await fetch(`${ACCOUNT_API_BASE}/api/user/change-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          newEmail,
          password: emailPass,
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (data.success) {
        notice({ text: t("emailChanged"), variant: "success" });
        setNewEmail("");
        setEmailPass("");
        await refreshSessionUser();
      } else {
        notice({ text: data.error || t("errServer"), variant: "error" });
      }
    } catch {
      notice({ text: t("serverUnavailable"), variant: "error" });
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(t("deleteConfirm"))) return;
    await signOut();
    // Full reload is intentional: it drops all client-side state after deletion.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/${locale}`);
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
          <p className="truncate text-muted-foreground">{user.email}</p>
          <p className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
            {user.provider}
          </p>
        </div>
      </div>

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

      {/* Change password */}
      <div className="mt-6 flex flex-col gap-2 border-t pt-4">
        <h3 className={sectionTitleClass}>
          <KeyRoundIcon className="size-4 text-primary" />
          {t("changePassTitle")}
        </h3>
        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <label htmlFor="old-pass" className={labelClass}>{t("oldPass")}</label>
            <input
              id="old-pass"
              type="password"
              className={inputClass}
              placeholder="••••••••"
              autoComplete="off"
              name="old-password-settings"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="new-pass" className={labelClass}>{t("newPass")}</label>
            <input
              id="new-pass"
              type="password"
              className={inputClass}
              placeholder={t("newPassPh")}
              autoComplete="new-password"
              name="new-password-settings"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="new-pass2" className={labelClass}>{t("newPass2")}</label>
            <input
              id="new-pass2"
              type="password"
              className={inputClass}
              placeholder={t("newPassPh")}
              autoComplete="new-password"
              name="confirm-password-settings"
              value={newPass2}
              onChange={(e) => setNewPass2(e.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleChangePassword}
          disabled={passLoading}
          className={`${btnPrimary} mt-1 self-start`}
        >
          {passLoading ? "…" : t("passBtn")}
        </button>
      </div>

      {/* Change email */}
      <div className="mt-6 flex flex-col gap-2 border-t pt-4">
        <h3 className={sectionTitleClass}>
          <MailIcon className="size-4 text-primary" />
          {t("changeEmailTitle")}
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label htmlFor="new-email" className={labelClass}>{t("newEmail")}</label>
            <input
              id="new-email"
              type="text"
              name="change-email"
              className={inputClass}
              placeholder="new@email.com"
              autoComplete="off"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email-pass" className={labelClass}>{t("currentPass")}</label>
            <input
              id="email-pass"
              type="password"
              className={inputClass}
              placeholder="••••••••"
              autoComplete="off"
              name="password-for-email-change"
              value={emailPass}
              onChange={(e) => setEmailPass(e.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleChangeEmail}
          disabled={emailLoading}
          className={`${btnPrimary} mt-1 self-start`}
        >
          {emailLoading ? "…" : t("emailBtn")}
        </button>
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
