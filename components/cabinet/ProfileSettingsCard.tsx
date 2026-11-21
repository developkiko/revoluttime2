"use client";

/** Настройки профиля (владелец 22.11 №7): карточка с кнопками у полей —
 *  смена аватара (кнопка на аватаре), «Отображаемое имя» и «О себе» с
 *  карандашиками: по нажатию поле становится доступным, карандаш меняется
 *  на пару «сохранить/отмена» (иконки). Данные — профиль-оверлей
 *  (localStorage) до появления accounts API. */

import * as React from "react";
import { useTranslations } from "next-intl";
import { CheckIcon, ImagePlusIcon, PencilIcon, XIcon } from "lucide-react";

import { fileToAvatarDataUrl, saveProfileOverlay, useProfileOverlay } from "@/lib/profile-store";
import { refreshSessionUser } from "@/lib/auth-store";
import type { SessionUser } from "@/lib/auth-session";
import { isSyntheticAnchor } from "@/lib/anchor";
import { useNotice } from "@/components/ui/notice";

const iconBtn =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors";

export function ProfileSettingsCard({ user }: { user: SessionUser }) {
  const t = useTranslations("cabinet.settings");
  const { notice } = useNotice();
  const overlay = useProfileOverlay(user.email);
  const fileRef = React.useRef<HTMLInputElement>(null);

  // edit = какое поле сейчас редактируется; draft — значение до сохранения
  const [editing, setEditing] = React.useState<"name" | "about" | null>(null);
  const [draftName, setDraftName] = React.useState("");
  const [draftAbout, setDraftAbout] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const avatarSrc = overlay?.avatarDataUrl ?? user.picture;
  const displayName = overlay?.displayName || user.name;
  const about = overlay?.about ?? "";
  const initial = displayName.charAt(0).toUpperCase();

  async function pickFile(file: File) {
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      saveProfileOverlay(user.email, { ...(overlay ?? {}), avatarDataUrl: dataUrl });
      notice({ text: t("avatarSaved"), variant: "success" });
    } catch {
      notice({ text: t("avatarError"), variant: "error" });
    }
  }

  async function saveName() {
    setSaving(true);
    try {
      saveProfileOverlay(user.email, {
        ...(overlay ?? {}),
        displayName: draftName.trim() || undefined,
      });
      await refreshSessionUser();
      setEditing(null);
      notice({ text: t("saved"), variant: "success" });
    } finally {
      setSaving(false);
    }
  }

  function saveAbout() {
    saveProfileOverlay(user.email, { ...(overlay ?? {}), about: draftAbout.trim() || undefined });
    setEditing(null);
    notice({ text: t("saved"), variant: "success" });
  }

  return (
    <div className="flex h-full flex-col rounded-3xl border bg-card p-6">
      <h2 className="text-xl font-bold tracking-tight">{t("title")}</h2>

      {/* Аватар: кнопка смены на самой аватарке */}
      <div className="mt-5 flex items-center gap-4">
        <div className="relative">
          <span className="flex size-20 items-center justify-center overflow-hidden rounded-full border bg-muted text-2xl font-bold uppercase text-muted-foreground">
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL / provider CDN
              <img src={avatarSrc} alt="" className="size-full object-cover" />
            ) : (
              initial
            )}
          </span>
          <button
            type="button"
            aria-label={t("uploadAvatar")}
            data-tip={t("uploadAvatar")}
            data-tip-pos="top"
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
          <p className="truncate font-semibold">{displayName}</p>
          {!isSyntheticAnchor(user.email) && (
            <p className="truncate text-muted-foreground">{user.email}</p>
          )}
          <p className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
            {user.provider}
          </p>
        </div>
      </div>

      {/* Отображаемое имя: карандаш → сохранить/отмена */}
      <div className="mt-6 flex flex-col gap-1">
        <label htmlFor="settings-name" className="text-xs font-medium text-muted-foreground">
          {t("displayName")}
        </label>
        <div className="flex items-center gap-2">
          <input
            id="settings-name"
            value={editing === "name" ? draftName : displayName}
            placeholder={user.name}
            readOnly={editing !== "name"}
            onChange={(e) => setDraftName(e.target.value)}
            className={`h-10 w-full rounded-lg border bg-[var(--bg-input)] px-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)]/50 ${
              editing === "name" ? "" : "cursor-default opacity-70"
            }`}
          />
          {editing === "name" ? (
            <>
              <button
                type="button"
                aria-label={t("save")}
                data-tip={t("save")}
                onClick={saveName}
                disabled={saving}
                className={`${iconBtn} border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50`}
              >
                <CheckIcon className="size-4" />
              </button>
              <button
                type="button"
                aria-label={t("cancel")}
                data-tip={t("cancel")}
                onClick={() => setEditing(null)}
                className={`${iconBtn} text-muted-foreground hover:bg-muted`}
              >
                <XIcon className="size-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              aria-label={t("edit")}
              data-tip={t("edit")}
              onClick={() => {
                setDraftName(overlay?.displayName ?? "");
                setEditing("name");
              }}
              className={`${iconBtn} text-muted-foreground hover:text-foreground hover:border-[var(--color-primary)]/40`}
            >
              <PencilIcon className="size-4" />
            </button>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">{t("displayNameHint")}</p>
      </div>

      {/* О себе: новое поле (№7) */}
      <div className="mt-5 flex flex-col gap-1">
        <label htmlFor="settings-about" className="text-xs font-medium text-muted-foreground">
          {t("about")}
        </label>
        <div className="flex items-start gap-2">
          <textarea
            id="settings-about"
            rows={3}
            value={editing === "about" ? draftAbout : about}
            placeholder={t("aboutPlaceholder")}
            readOnly={editing !== "about"}
            onChange={(e) => setDraftAbout(e.target.value)}
            className={`w-full resize-none rounded-lg border bg-[var(--bg-input)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-primary)]/50 ${
              editing === "about" ? "" : "cursor-default opacity-70"
            }`}
          />
          {editing === "about" ? (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                aria-label={t("save")}
                data-tip={t("save")}
                onClick={saveAbout}
                className={`${iconBtn} border-primary/40 bg-primary/10 text-primary hover:bg-primary/20`}
              >
                <CheckIcon className="size-4" />
              </button>
              <button
                type="button"
                aria-label={t("cancel")}
                data-tip={t("cancel")}
                onClick={() => setEditing(null)}
                className={`${iconBtn} text-muted-foreground hover:bg-muted`}
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label={t("edit")}
              data-tip={t("edit")}
              onClick={() => {
                setDraftAbout(about);
                setEditing("about");
              }}
              className={`${iconBtn} self-start text-muted-foreground hover:text-foreground hover:border-[var(--color-primary)]/40`}
            >
              <PencilIcon className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
