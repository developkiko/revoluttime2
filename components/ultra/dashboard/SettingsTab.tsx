"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — SettingsTab (Настройки)
// Смена email/пароля + экспорт данных + удаление аккаунта
// ══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useAuth } from "@/lib/ultra/auth-store";
import { useNotice } from "@/components/ui/notice";
import { Trash2 } from "lucide-react";
import { useModalEngine } from "@/components/ultra/ui/ModalEngine";

interface UserDataExport {
  email: string;
  login: string;
  wallet_attached: boolean;
  created_at: string;
  balance_usdt: number;
}

const inputClass =
  "w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-[var(--text-heading)] text-sm outline-none transition-colors focus:border-[var(--color-primary)]";
const labelClass = "block text-left text-[13px] text-[var(--text-secondary)] mb-1.5";
const btnPrimary =
  "px-5 py-2.5 text-sm font-semibold rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors";
const btnSecondary =
  "px-5 py-2.5 text-sm font-semibold rounded-lg border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors";
const btnDanger =
  "px-5 py-2.5 text-sm font-semibold rounded-lg border border-[var(--color-error)]/40 bg-[var(--color-error)]/8 text-[var(--color-error)] hover:bg-[var(--color-error)]/20 transition-colors";

export function SettingsTab() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { openModal, closeModal } = useModalEngine();
  const { notice } = useNotice();

  // Password change
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  // Account deletion (password confirmation)
  const [deletePass, setDeletePass] = useState("");

  const handleChangePassword = async () => {
    if (!oldPass) { notice({ text: t("err_password_empty"), variant: "error" }); return; }
    if (!newPass || newPass.length < 8) { notice({ text: t("err_password_short"), variant: "error" }); return; }
    if (newPass !== newPass2) { notice({ text: t("err_confirm_mismatch"), variant: "error" }); return; }

    setPassLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_UP_ADMIN_API_URL || "https://admin.revoluttime.de"}/api/user/change-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user?.email, oldPassword: oldPass, newPassword: newPass }),
        }
      );
      const data = await res.json();
      if (data.success) {
        notice({ text: t("settings_pass_changed"), variant: "success" });
        setOldPass(""); setNewPass(""); setNewPass2("");
      } else {
        notice({ text: data.error || t("err_server"), variant: "error" });
      }
    } catch {
      notice({ text: t("server_unavailable"), variant: "error" });
    } finally {
      setPassLoading(false);
    }
  };

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [emailPass, setEmailPass] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const handleChangeEmail = async () => {
    if (!newEmail) { notice({ text: t("err_email_empty"), variant: "error" }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { notice({ text: t("err_email_format"), variant: "error" }); return; }
    if (!emailPass) { notice({ text: t("err_password_empty"), variant: "error" }); return; }

    setEmailLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_UP_ADMIN_API_URL || "https://admin.revoluttime.de"}/api/user/change-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user?.email, newEmail, password: emailPass }),
        }
      );
      const data = await res.json();
      if (data.success) {
        notice({ text: t("settings_email_changed"), variant: "success" });
        setNewEmail(""); setEmailPass("");
      } else {
        notice({ text: data.error || t("err_server"), variant: "error" });
      }
    } catch {
      notice({ text: t("server_unavailable"), variant: "error" });
    } finally {
      setEmailLoading(false);
    }
  };

  // Export
  const handleExport = (format: "json" | "csv" | "txt") => {
    const exportData: UserDataExport = {
      email: user?.email || "",
      login: user?.login || "",
      wallet_attached: user?.wallet_attached ?? false,
      created_at: new Date().toISOString(),
      balance_usdt: 0,
    };

    let content: string;
    let mime: string;
    let ext: string;

    switch (format) {
      case "json":
        content = JSON.stringify(exportData, null, 2);
        mime = "application/json";
        ext = "json";
        break;
      case "csv":
        content = Object.keys(exportData).join(",") + "\n" + Object.values(exportData).join(",");
        mime = "text/csv";
        ext = "csv";
        break;
      case "txt":
        content = Object.entries(exportData).map(([k, v]) => `${k}: ${v}`).join("\n");
        mime = "text/plain";
        ext = "txt";
        break;
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ultra-proxy-data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    notice({ text: t("settings_exported"), variant: "success" });
  };

  // Delete confirmation modal
  const openDeleteConfirm = () => {
    setDeletePass("");
    openModal(
      <div className="relative bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-8 w-full max-w-[440px] text-center">
        <button
          onClick={closeModal}
          className="absolute top-1.5 right-3 text-2xl text-[var(--text-secondary)] hover:text-[var(--text-heading)] leading-none p-0.5 bg-transparent"
        >
          &times;
        </button>
        <div className="text-[2.5rem] text-[var(--color-error)] mb-3"><Trash2 className="w-12 h-12 mx-auto" /></div>
        <h3 className="text-xl font-semibold text-[var(--text-heading)] mb-2">{t("settings_delete_title")}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-5 leading-relaxed">
          {t("settings_delete_warn")}
        </p>
        <div className="text-left mb-5">
          <label className={labelClass}>{t("settings_delete_password_label")}</label>
          <input
            type="password"
            value={deletePass}
            onChange={(e) => setDeletePass(e.target.value)}
            className={inputClass}
            autoComplete="current-password"
          />
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={closeModal} className={btnSecondary}>
            {t("settings_delete_cancel")}
          </button>
          <button onClick={() => handleDeleteAccount()} className={btnDanger}>
            {t("settings_delete_confirm")}
          </button>
        </div>
      </div>
    );
  };

  const handleDeleteAccount = async () => {
    if (!deletePass) { notice({ text: t("err_password_empty"), variant: "error" }); return; }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_UP_ADMIN_API_URL || "https://admin.revoluttime.de"}/api/user/delete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user?.email, password: deletePass }),
        }
      );
      const data = await res.json();
      if (data.success) {
        notice({ text: t("settings_delete_done"), variant: "success" });
        closeModal();
        if (typeof window !== "undefined") {
          localStorage.removeItem("ultra_proxy_session");
          window.location.href = "/";
        }
      } else if (res.status === 401) {
        notice({ text: t("err_wrong_password"), variant: "error" });
      } else {
        notice({ text: data.error || t("err_server"), variant: "error" });
      }
    } catch {
      notice({ text: t("server_unavailable"), variant: "error" });
    }
  };

  return (
    <div>
      <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-[var(--text-heading)] text-center mb-3">
        {t("dash_settings_title")}
      </h2>
      <p className="text-sm text-[var(--text-secondary)] text-center max-w-[600px] mx-auto mb-8">
        {t("dash_settings_desc")}
      </p>

      <div className="max-w-[900px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Email */}
        <section className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
          <h3 className="text-base font-semibold text-[var(--text-heading)] mb-4">{t("settings_email_section")}</h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>{t("settings_new_email")}</label>
              <input
                type="text" name="change-email" className={inputClass} placeholder="new@email.com"
                value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                autoComplete="off"
                readOnly
                onFocus={(e) => e.currentTarget.removeAttribute('readOnly')}
              />
            </div>
            <div>
              <label className={labelClass}>{t("form_pass_label")}</label>
              <input
                type="password" className={inputClass} placeholder="••••••••"
                value={emailPass} onChange={(e) => setEmailPass(e.target.value)}
                autoComplete="off"
                name="password-for-email-change"
                readOnly
                onFocus={(e) => e.currentTarget.removeAttribute('readOnly')}
              />
            </div>
            <button
              onClick={handleChangeEmail} disabled={emailLoading}
              className={`${btnPrimary} ${emailLoading ? "opacity-50" : ""}`}
            >
              {emailLoading ? "..." : t("settings_email_btn")}
            </button>
          </div>
        </section>

        {/* Change Password */}
        <section className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
          <h3 className="text-base font-semibold text-[var(--text-heading)] mb-4">{t("settings_pass_section")}</h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>{t("settings_old_pass")}</label>
              <input
                type="password" className={inputClass} placeholder="••••••••"
                value={oldPass} onChange={(e) => setOldPass(e.target.value)}
                autoComplete="off"
                name="old-password-settings"
                readOnly
                onFocus={(e) => e.currentTarget.removeAttribute('readOnly')}
              />
            </div>
            <div>
              <label className={labelClass}>{t("settings_new_pass")}</label>
              <input
                type="password" className={inputClass} placeholder={t("settings_new_pass_ph")}
                value={newPass} onChange={(e) => setNewPass(e.target.value)}
                autoComplete="new-password"
                name="new-password-settings"
              />
            </div>
            <div>
              <label className={labelClass}>{t("settings_new_pass2")}</label>
              <input
                type="password" className={inputClass} placeholder={t("settings_new_pass2_ph")}
                value={newPass2} onChange={(e) => setNewPass2(e.target.value)}
                autoComplete="new-password"
                name="confirm-password-settings"
              />
            </div>
            <button
              onClick={handleChangePassword} disabled={passLoading}
              className={`${btnPrimary} ${passLoading ? "opacity-50" : ""}`}
            >
              {passLoading ? "..." : t("settings_pass_btn")}
            </button>
          </div>
        </section>

        {/* Export + Delete — один блок */}
        <section className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 lg:col-span-2">
          <h3 className="text-base font-semibold text-[var(--text-heading)] mb-2">{t("settings_data_section")}</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-4">{t("settings_export_desc")}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => handleExport("json")} className={btnSecondary}>
              {t("settings_export_json")}
            </button>
            <button onClick={() => handleExport("csv")} className={btnSecondary}>
              {t("settings_export_csv")}
            </button>
            <button onClick={() => handleExport("txt")} className={btnSecondary}>
              {t("settings_export_txt")}
            </button>
          </div>
          <div className="border-t border-[var(--border-subtle)] pt-5">
            <p className="text-xs text-[var(--text-muted)] mb-3">{t("settings_delete_desc")}</p>
            <button onClick={openDeleteConfirm} className={btnDanger}>
              {t("settings_delete_btn")}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
