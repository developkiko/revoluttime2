"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — Страница "Все возможности" (i18n)
// ══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { Header } from "@/components/ultra/layout/Header";
import { Footer } from "@/components/ultra/layout/Footer";
import { SupportFAB } from "@/components/ultra/dashboard/SupportFAB";
import { useI18n } from "@/lib/ultra/i18n-context";
import { Globe, Smartphone, Server, MapPin, Radio, RefreshCw, Shield, Code2 } from "lucide-react";
import { AuthModalContent } from "@/components/ultra/auth/AuthModal";
import { useModalEngine } from "@/components/ultra/ui/ModalEngine";
import { useTrackVisit } from "@/lib/ultra/use-track-visit";

export default function FeaturesPage() {
  const { t } = useI18n();
  const { openModal } = useModalEngine();

  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail?.tab as "login" | "register" | undefined;
      openModal(<AuthModalContent initialTab={tab ?? "register"} />);
    };
    window.addEventListener("open-auth", handler);
    return () => window.removeEventListener("open-auth", handler);
  }, [openModal]);

  useTrackVisit("/features");

  const sections = [
    {
      id: "proxy-types",
      icon: <Globe className="w-8 h-8 text-[var(--color-primary)]" />,
      title: t("feat_section_types"),
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Globe className="w-8 h-8 text-[var(--color-accent)]" />, title: t("feat_res_title"), subtitle: t("feat_res_count"), desc: t("feat_res_desc") },
            { icon: <Smartphone className="w-8 h-8 text-[var(--color-warning)]" />, title: t("feat_mob_title"), subtitle: t("feat_mob_count"), desc: t("feat_mob_desc") },
            { icon: <Server className="w-8 h-8 text-[var(--color-info)]" />, title: t("feat_dc_title"), subtitle: t("feat_dc_count"), desc: t("feat_dc_desc") },
          ].map((item) => (
            <div key={item.title} className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-[var(--text-heading)] mb-1">{item.title}</h3>
              <p className="text-xs text-[var(--color-primary)] font-semibold mb-3">{item.subtitle}</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "geo",
      icon: <MapPin className="w-8 h-8 text-[var(--color-primary)]" />,
      title: t("feat_section_geo"),
      content: (
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-8">
          <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-[800px]">
            {t("feat_geo_desc")}<strong className="text-[var(--text-heading)]">{t("feat_geo_count_200")}</strong>{t("feat_geo_desc2")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: t("feat_geo_countries"), value: t("feat_geo_count_200") },
              { label: t("feat_geo_cities"), value: t("feat_geo_count_850") },
              { label: t("feat_geo_us_states"), value: t("feat_geo_count_50") },
              { label: t("feat_geo_precision"), value: t("feat_geo_to_city") },
            ].map((s) => (
              <div key={s.label} className="text-center p-4 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                <div className="text-2xl font-bold text-[var(--color-primary)] mb-1">{s.value}</div>
                <div className="text-xs text-[var(--text-muted)]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "protocols",
      icon: <Radio className="w-8 h-8 text-[var(--color-primary)]" />,
      title: t("feat_section_protocols"),
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
            <h4 className="text-base font-bold text-[var(--text-heading)] mb-3">{t("feat_protocols_title")}</h4>
            <div className="flex flex-wrap gap-2">
              {["HTTP(S)", "SOCKS5"].map((p) => (
                <span key={p} className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-[var(--color-primary)]/12 text-[var(--color-primary)] border border-[var(--color-primary)]/25">
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
            <h4 className="text-base font-bold text-[var(--text-heading)] mb-3">{t("feat_formats_title")}</h4>
            <div className="space-y-2">
              <code className="block text-sm text-[#ccc] bg-black/30 px-3 py-2 rounded font-mono">IP:PORT:LOGIN:PASS</code>
              <code className="block text-sm text-[#ccc] bg-black/30 px-3 py-2 rounded font-mono">login:pass@IP:PORT</code>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-3">{t("feat_whitelist_note")}</p>
          </div>
        </div>
      ),
    },
    {
      id: "rotation",
      icon: <RefreshCw className="w-8 h-8 text-[var(--color-primary)]" />,
      title: t("feat_section_rotation"),
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
            <h4 className="text-base font-bold text-[var(--text-heading)] mb-2">{t("feat_rotation_auto")}</h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {t("feat_rotation_auto_desc")}<strong className="text-[var(--text-heading)]">{t("feat_rotation_from_to")}</strong>.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {[t("feat_rotation_per_request"), "1 мин", "5 мин", "30 мин", "1 час", "24 часа"].map((lbl) => (
                <span key={lbl} className="text-xs px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[#aaa]">{lbl}</span>
              ))}
            </div>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
            <h4 className="text-base font-bold text-[var(--text-heading)] mb-2">{t("feat_rotation_sticky")}</h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {t("feat_rotation_sticky_desc")}<strong className="text-[var(--text-heading)]">{t("feat_rotation_1_to_30")}</strong>{t("feat_rotation_ideal_for")}
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {["1 мин", "5 мин", "10 мин", "15 мин", "30 мин"].map((lbl) => (
                <span key={lbl} className="text-xs px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[#aaa]">{lbl}</span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "security",
      icon: <Shield className="w-8 h-8 text-[var(--color-primary)]" />,
      title: t("feat_section_security"),
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { title: t("feat_sec_anon_title"), desc: t("feat_sec_anon_desc") },
            { title: t("feat_sec_blocks_title"), desc: t("feat_sec_blocks_desc") },
            { title: t("feat_sec_pool_title"), desc: t("feat_sec_pool_desc") },
          ].map((item) => (
            <div key={item.title} className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 text-center">
              <Shield className="w-8 h-8 text-[var(--color-success)] mx-auto mb-3" />
              <h4 className="text-base font-bold text-[var(--text-heading)] mb-2">{item.title}</h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "api",
      icon: <Code2 className="w-8 h-8 text-[var(--color-primary)]" />,
      title: t("feat_section_api"),
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
            <h4 className="text-base font-bold text-[var(--text-heading)] mb-2">{t("feat_api_title")}</h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              {t("feat_api_desc")}
            </p>
            <div className="flex flex-wrap gap-2">
              {["GET /proxies", "POST /rotate", "GET /status", "GET /balance"].map((ep) => (
                <code key={ep} className="text-xs px-3 py-1.5 rounded-lg bg-black/30 text-[var(--color-accent)] border border-[var(--border-default)] font-mono">
                  {ep}
                </code>
              ))}
            </div>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
            <h4 className="text-base font-bold text-[var(--text-heading)] mb-2">{t("feat_integrations_title")}</h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {t("feat_integrations_desc")}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {["Python", "Go", "Node.js", "Chrome", "Firefox"].map((tech) => (
                <span key={tech} className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 pt-[var(--header-height)]">
        <div className="max-w-[var(--max-width)] mx-auto px-6 py-10 sm:py-16">
          <h1 className="text-[1.75rem] sm:text-[2.5rem] font-extrabold text-[var(--text-heading)] mb-4">
            {t("feat_page_title")}
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-[700px] mb-12">
            {t("feat_page_desc")}
          </p>

          <div className="space-y-16">
            {sections.map((section, idx) => (
              <section key={section.id} id={section.id}>
                <div className="flex items-center gap-3 mb-6">
                  {section.icon}
                  <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-heading)]">
                    {section.title}
                  </h2>
                </div>
                {section.content}
                {idx < sections.length - 1 && (
                  <hr className="mt-16 border-white/[0.04]" />
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <SupportFAB />
    </>
  );
}
