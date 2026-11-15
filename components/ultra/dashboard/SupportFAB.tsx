"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — SupportFAB: виджет контактов + кнопка "наверх"
// Если виджет выключен — только «наверх» на месте FAB
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useSiteConfig } from "@/lib/ultra/site-config-context";
import { Mail, ChevronUp, Plus } from "lucide-react";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
    </svg>
  );
}

export function SupportFAB() {
  const { t } = useI18n();
  const cfg = useSiteConfig();
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const widgetEnabled = cfg?.widget?.enabled !== false;

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > window.innerHeight * 0.5);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const emailAddr = cfg?.widget?.email || cfg?.contact_section?.email || "";
  const tgLink = cfg?.widget?.telegram_link || cfg?.contact_section?.telegram_link || "";

  const contacts = useMemo(() => {
    const list: { icon: React.ReactNode; label: string; href: string; style?: string }[] = [];
    if (!widgetEnabled) return list;
    if (emailAddr) {
      list.push({
        icon: <Mail className="w-5 h-5" />,
        label: "Email",
        href: emailAddr.startsWith("mailto:") ? emailAddr : `mailto:${emailAddr}`,
        style: "primary",
      });
    }
    if (tgLink) {
      let href = tgLink.trim();
      // Always open via https://t.me/ in browser (not tg:// app scheme)
      if (href.startsWith("tg://resolve?domain=")) {
        href = "https://t.me/" + href.replace("tg://resolve?domain=", "").replace(/^@/, "");
      } else if (href.startsWith("tg://")) {
        const m = href.match(/domain=([^&]+)/);
        href = m ? "https://t.me/" + m[1].replace(/^@/, "") : href;
      } else if (href.startsWith("@")) {
        href = "https://t.me/" + href.slice(1);
      } else if (!/^https?:\/\//i.test(href)) {
        href = "https://t.me/" + href.replace(/^@/, "");
      }
      list.push({
        icon: <TelegramIcon className="w-5 h-5" />,
        label: "Telegram",
        href,
        style: "telegram",
      });
    }
    if (list.length === 0) {
      list.push({ icon: <Mail className="w-5 h-5" />, label: "Email", href: "mailto:support@ultra-proxy.pro", style: "primary" });
      list.push({ icon: <TelegramIcon className="w-5 h-5" />, label: "Telegram", href: "https://t.me/ultraproxy_support", style: "telegram" });
    }
    return list;
  }, [widgetEnabled, emailAddr, tgLink]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const menuButtons = useMemo(() => {
    const btns: {
      type: "top" | "contact";
      icon: React.ReactNode;
      label: string;
      href?: string;
      onClick?: () => void;
      style?: string;
    }[] = [];
    if (!widgetEnabled) return btns;
    if (showTop) {
      btns.push({
        type: "top",
        icon: <ChevronUp className="w-5 h-5" />,
        label: t("scroll_top") as string,
        onClick: scrollToTop,
        style: "primary",
      });
    }
    if (open) {
      for (const c of contacts) {
        btns.push({ type: "contact", icon: c.icon, label: c.label, href: c.href, style: c.style });
      }
    }
    return btns;
  }, [widgetEnabled, showTop, open, contacts, t]);

  const getBtnClass = (style?: string, size: "sm" | "lg" = "sm") => {
    const dim = size === "lg" ? "w-14 h-14" : "w-10 h-10";
    if (style === "telegram") {
      return `${dim} rounded-full flex items-center justify-center bg-[#0088cc] text-white shadow-lg hover:bg-[#006daa] transition-all duration-200`;
    }
    if (style === "primary") {
      return `${dim} rounded-full flex items-center justify-center bg-[var(--color-primary)] text-white shadow-lg hover:bg-[var(--color-primary-hover)] transition-all duration-200`;
    }
    return `${dim} rounded-full flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-default)] shadow-lg hover:border-[var(--color-primary)]/30 hover:text-[var(--text-heading)] transition-all duration-200`;
  };

  // Widget OFF → only scroll-to-top in the FAB slot (fully hide when not scrolled)
  if (!widgetEnabled) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center">
        <button
          onClick={scrollToTop}
          className={getBtnClass("primary", "lg")}
          style={{
            opacity: showTop ? 1 : 0,
            transform: showTop ? "translateY(0) scale(1)" : "translateY(12px) scale(0.9)",
            pointerEvents: showTop ? "auto" : "none",
            transition: "opacity 0.3s ease, transform 0.3s ease",
            visibility: showTop ? "visible" : "hidden",
          }}
          title={t("scroll_top") as string}
          aria-label={t("scroll_top") as string}
          tabIndex={showTop ? 0 : -1}
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      </div>
    );
  }

  const visibleCount = menuButtons.length;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3" style={{ alignItems: "center" }}>
      <div
        className="grid gap-2 justify-items-center"
        style={{
          gridTemplateRows: `repeat(${visibleCount}, auto)`,
          transition: "grid-template-rows 0.3s ease, opacity 0.25s ease",
          opacity: visibleCount > 0 ? 1 : 0,
          overflow: "hidden",
        }}
      >
        {menuButtons.map((btn, i) =>
          btn.type === "top" ? (
            <button
              key="scroll-top"
              onClick={btn.onClick}
              className={getBtnClass(btn.style) + " fab-item"}
              style={{ animationDelay: `${i * 60}ms` }}
              title={btn.label}
              aria-label={btn.label}
            >
              {btn.icon}
            </button>
          ) : (
            <a
              key={btn.href}
              href={btn.href}
              title={btn.label}
              target="_blank"
              rel="noopener noreferrer"
              className={getBtnClass(btn.style) + " fab-item"}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {btn.icon}
            </a>
          )
        )}
      </div>

      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all border ${
          open
            ? "bg-[var(--color-accent)] border-[var(--color-accent)] no-glow"
            : "bg-[var(--color-accent)] border-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] pulse-glow"
        }`}
        aria-label="Support"
        title={t("dash_support_btn")}
      >
        {open ? <Plus className="w-5 h-5 rotate-45" /> : <TelegramIcon className="w-6 h-6" />}
      </button>

      <style jsx>{`
        @keyframes fabIn {
          from { opacity: 0; transform: translateY(8px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
          50%      { box-shadow: 0 0 0 8px rgba(124,58,237,0); }
        }
        .pulse-glow { animation: pulseGlow 2.5s ease-in-out infinite; }
        .no-glow { animation: none; }
        .fab-item {
          animation: fabIn 0.25s ease-out both;
        }
      `}</style>
    </div>
  );
}
