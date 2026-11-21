"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — SupportFAB: виджет контактов + кнопка "наверх"
// Если виджет выключен — только «наверх» на месте FAB
// Владелец 21.11: WhatsApp — фирменный зелёный + настоящая иконка,
// контактные иконки — крупнее и БЕЗ круглой подложки, иконка меню
// не дублирует Telegram (chat-bubble).
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useSiteConfig } from "@/lib/ultra/site-config-context";
import { Mail, ChevronUp, Plus, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/products";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
      const isWhatsapp = emailAddr.includes("wa.me") || emailAddr.toLowerCase().includes("whatsapp");
      if (isWhatsapp) {
        list.push({
          icon: <WhatsAppIcon className="h-6 w-6" />,
          label: "WhatsApp",
          href: emailAddr.startsWith("http") ? emailAddr : `https://${emailAddr}`,
          style: "whatsapp",
        });
      } else {
        list.push({
          icon: <Mail className="h-6 w-6" />,
          label: "Email",
          href: emailAddr.startsWith("mailto:") || emailAddr.startsWith("http") || emailAddr.startsWith("tel:")
            ? emailAddr
            : `mailto:${emailAddr}`,
          style: "email",
        });
      }
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
        icon: <TelegramIcon className="h-6 w-6" />,
        label: "Telegram",
        href,
        style: "telegram",
      });
    }
    if (list.length === 0) {
      list.push({ icon: <WhatsAppIcon className="h-6 w-6" />, label: "WhatsApp", href: SITE.whatsapp, style: "whatsapp" });
      list.push({ icon: <TelegramIcon className="h-6 w-6" />, label: "Telegram", href: SITE.telegram, style: "telegram" });
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
        icon: <ChevronUp className="h-6 w-6" />,
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

  // Contact buttons: brand-colored circle + white icon on any theme
  // (owner 21.11: «фон в цвет бренда связи, иконка белой»).
  const contactClass = (style?: string) => {
    if (style === "telegram") return "bg-[#0088cc] text-white hover:bg-[#006daa]";
    if (style === "whatsapp") return "bg-[#25D366] text-white hover:bg-[#1fb857]";
    if (style === "email") return "bg-[var(--primary)] text-white hover:bg-[var(--color-primary-hover)]";
    return "bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-heading)]";
  };

  // Widget OFF → only scroll-to-top in the FAB slot (fully hide when not scrolled)
  if (!widgetEnabled) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center">
        <button
          onClick={scrollToTop}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition-colors hover:bg-[var(--color-primary-hover)]"
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
          <ChevronUp className="h-6 w-6" />
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
              className="fab-item flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-heading)] shadow-lg transition-colors hover:border-[var(--color-primary)]/40"
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
              className={`fab-item flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 ${contactClass(btn.style)}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {btn.icon}
            </a>
          )
        )}
      </div>

      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all border text-white ${
          open
            ? "bg-[var(--color-accent)] border-[var(--color-accent)] no-glow"
            : "bg-[var(--color-accent)] border-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] pulse-glow"
        }`}
        aria-label="Support"
        title={t("dash_support_btn")}
      >
        {open ? <Plus className="w-5 h-5 rotate-45" /> : <MessageCircle className="w-6 h-6" />}
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
