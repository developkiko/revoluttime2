"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — Footer
// ══════════════════════════════════════════════════════════════

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { PolicyModal, type PolicyType } from "@/components/ultra/ui/PolicyModal";
import { useSiteConfig } from "@/lib/ultra/site-config-context";
import { Activity, ArrowLeftRight, Cookie, Mail, RefreshCw, Scale, Send, Shield, Sparkles } from "lucide-react";

export function Footer() {
  const { t } = useI18n();
  const cfg = useSiteConfig();
  const fc = cfg?.footer_contacts;
  const [showingPolicy, setShowingPolicy] = useState<PolicyType | null>(null);

  const openPolicy = (policy: PolicyType) => setShowingPolicy(policy);
  const closePolicy = () => setShowingPolicy(null);

  return (
    <footer className="bg-[var(--bg-base)] border-t border-[var(--border-subtle)] pt-12 pb-0 relative">
      {/* Policy Modal */}
      {showingPolicy && (
        <PolicyModal policy={showingPolicy} onClose={closePolicy} />
      )}

      <div className="max-w-[var(--max-width)] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 pb-8">
          {/* Brand */}
          <div className="footer-brand max-w-[280px]">
            <span className="logo mb-3 block" data-cursor-logo>{t("logo_text")}</span>
            <p className="text-sm text-[var(--text-muted)] max-w-[280px] leading-relaxed">{t("footer_tagline")}</p>
          </div>
          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Информация */}
            <div>
              <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                {t("footer_info")}
              </h4>
              <Link href="/compare" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] py-1.5 hover:text-[var(--text-primary)] transition-colors">
                <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />{t("footer_compare")}
              </Link>
              <Link href="/features" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] py-1.5 hover:text-[var(--text-primary)] transition-colors">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />{t("features_btn")}
              </Link>
              <Link href="/stats" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] py-1.5 hover:text-[var(--text-primary)] transition-colors">
                <Activity className="w-3.5 h-3.5 shrink-0" />{t("trust_btn")}
              </Link>
            </div>
            {/* Политики */}
            <div>
              <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                {t("footer_policies")}
              </h4>
              <button onClick={() => openPolicy("privacy")} className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] py-1.5 hover:text-[var(--text-primary)] transition-colors text-left w-full cursor-pointer bg-transparent border-none">
                <Shield className="w-3.5 h-3.5 shrink-0" />{t("privacy_title")}
              </button>
              <button onClick={() => openPolicy("terms")} className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] py-1.5 hover:text-[var(--text-primary)] transition-colors text-left w-full cursor-pointer bg-transparent border-none">
                <Scale className="w-3.5 h-3.5 shrink-0" />{t("terms_title")}
              </button>
              <button onClick={() => openPolicy("refund")} className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] py-1.5 hover:text-[var(--text-primary)] transition-colors text-left w-full cursor-pointer bg-transparent border-none">
                <RefreshCw className="w-3.5 h-3.5 shrink-0" />{t("refund_title")}
              </button>
              <button onClick={() => openPolicy("cookies")} className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] py-1.5 hover:text-[var(--text-primary)] transition-colors text-left w-full cursor-pointer bg-transparent border-none">
                <Cookie className="w-3.5 h-3.5 shrink-0" />{t("cookies_title")}
              </button>
            </div>
            {/* Контакты */}
            <div>
              <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                {t("footer_contacts")}
              </h4>
              {fc?.email && (
                <a href={`mailto:${fc.email}`} className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] py-1.5 hover:text-[var(--text-primary)] transition-colors">
                  <Mail className="w-3.5 h-3.5 shrink-0" />{fc.email}
                </a>
              )}
              {fc?.telegram_link && (
                <a href={fc.telegram_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] py-1.5 hover:text-[var(--text-primary)] transition-colors">
                  <Send className="w-3.5 h-3.5 shrink-0" />{fc.telegram_text || fc.telegram_link}
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="text-center py-5 border-t border-[var(--border-subtle)] text-[13px] text-[var(--text-muted)]">
          <p>&copy; 2026 RevolutTIME. {t("footer_rights")}</p>
        </div>
      </div>
    </footer>
  );
}
