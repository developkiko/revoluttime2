"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { ImagePlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fileToAvatarDataUrl,
  saveProfileOverlay,
  useProfileOverlay,
} from "@/lib/profile-store";
import { refreshSessionUser, signOut } from "@/lib/auth-store";
import type { SessionUser } from "@/lib/auth-session";

export function ProfileCard({ user }: { user: SessionUser }) {
  const t = useTranslations("cabinet.profile");
  const locale = useLocale();
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
      toast.success(t("avatarSaved"));
    } catch {
      toast.error(t("avatarError"));
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
      toast.success(t("saved"));
    } finally {
      setSaving(false);
    }
  }

  function handleExport() {
    const exportData = {
      exportedAt: new Date().toISOString(),
      account: { email: user.email, name: user.name, provider: user.provider },
      profile: overlay ?? {},
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revoluttime-data-${user.email}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("exportDone"));
  }

  async function handleDelete() {
    if (!window.confirm(t("deleteConfirm"))) return;
    await signOut();
    // Full reload is intentional: it drops all client-side state after deletion.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/${locale}`);
  }

  return (
    <div className="rounded-3xl border bg-card p-6">
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
        <label htmlFor="cabinet-name" className="text-xs font-medium text-muted-foreground">
          {t("displayName")}
        </label>
        <div className="flex gap-2">
          <Input
            id="cabinet-name"
            value={currentName}
            placeholder={user.name}
            onChange={(e) => setDraftName(e.target.value)}
          />
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "…" : t("save")}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">{t("displayNameHint")}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
        <Button variant="outline" size="sm" onClick={handleExport}>
          {t("exportData")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2Icon />
          {t("deleteAccount")}
        </Button>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        {t("gdprNote")}
      </p>
    </div>
  );
}
