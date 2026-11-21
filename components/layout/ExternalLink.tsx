"use client";

/** Обёртка внешних ссылок (Фаза F — прокси ссылок, решение владельца).
 *  Режим задаётся в owner_settings.external_links (adm-rt):
 *    active      — ссылка работает как обычно;
 *    after_timer — клик ведёт на /[lang]/redirect?url=… (страница-
 *                  предупреждение с SVG-кругом отсчёта);
 *    no_button   — ссылка превращается в некликабельный текст.
 *  Админ видит на клике тултип «Принять/Отмена» (Принять — домен в
 *  whitelist, запись хранится в site_config.owner_settings).
 *
 *  До загрузки конфига рендерим обычную <a> — как на сервере, чтобы не
 *  было hydration mismatch; смена режима происходит после гидрации.
 */

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckIcon, XIcon } from "lucide-react";

import { useAuthUser } from "@/lib/auth-store";
import { useNotice } from "@/components/ui/notice";
import {
  EXTERNAL_LINKS_DEFAULTS,
  buildRedirectPath,
  hostAllowed,
  hostFromUrl,
  normalizeExternalLinks,
  type ExternalLinksConfig,
} from "@/lib/external-links";

let configCache: ExternalLinksConfig | null = null;

/** Конфиг внешних ссылок (один fetch /api/site-config на сессию). */
export function useExternalLinksConfig(): ExternalLinksConfig {
  const [config, setConfig] = React.useState<ExternalLinksConfig>(
    () => configCache ?? { ...EXTERNAL_LINKS_DEFAULTS }
  );

  React.useEffect(() => {
    if (configCache) {
      setConfig(configCache);
      return;
    }
    let cancelled = false;
    fetch("/api/site-config", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { ownerSettings?: { external_links?: unknown } }) => {
        if (cancelled) return;
        configCache = normalizeExternalLinks(data?.ownerSettings?.external_links);
        setConfig(configCache);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return config;
}

/** Сброс кеша после изменения whitelist админ-API. */
function invalidateConfigCache() {
  configCache = null;
}

interface AdminTipState {
  x: number;
  y: number;
  href: string;
  domain: string;
}

export function ExternalLink({
  href,
  children,
  className,
  title,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "title">) {
  const t = useTranslations("externalLink");
  const locale = useLocale();
  const config = useExternalLinksConfig();
  const user = useAuthUser();
  const notice = useNotice();
  const [tip, setTip] = React.useState<AdminTipState | null>(null);
  const [allowing, setAllowing] = React.useState(false);

  const domain = hostFromUrl(href);
  const isAdmin = Boolean(user?.isAdmin);
  // Mailto/телефоны и прочие не-http ссылки живут как есть.
  const isHttp = Boolean(domain);

  const allowed = domain ? hostAllowed(domain, config.whitelist) : true;
  const wrapped =
    isHttp && config.mode === "after_timer"
      ? buildRedirectPath(locale, href)
      : href;

  if (!isHttp || config.mode === "no_button") {
    // no_button — только для http-ссылок; остальное (mailto) не трогаем.
    if (isHttp) {
      return (
        <span className={className} title={title} aria-disabled="true">
          {children}
        </span>
      );
    }
    return (
      <a href={href} className={className} title={title} {...rest}>
        {children}
      </a>
    );
  }

  async function allowDomain() {
    if (!tip) return;
    setAllowing(true);
    try {
      const response = await fetch("/api/admin/external-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tip.href, action: "allow" }),
      });
      if (!response.ok) throw new Error(String(response.status));
      invalidateConfigCache();
      notice.notice({ text: t("allowedToast", { domain: tip.domain }), variant: "success" });
      setTip(null);
    } catch {
      notice.notice({ text: t("errorToast"), variant: "error" });
    } finally {
      setAllowing(false);
    }
  }

  return (
    <>
      <a
        href={wrapped}
        className={className}
        title={title}
        target={wrapped === href ? "_blank" : undefined}
        rel={wrapped === href ? "noopener noreferrer" : undefined}
        onClick={(event) => {
          if (isAdmin && domain) {
            event.preventDefault();
            setTip({ x: event.clientX, y: event.clientY, href, domain });
          }
        }}
        {...rest}
      >
        {children}
      </a>

      {tip && (
        <>
          {/* Полноэкранный фон: клик вне — закрыть тултип */}
          <button
            type="button"
            aria-label={t("cancel")}
            onClick={() => setTip(null)}
            className="fixed inset-0 z-[60] cursor-default"
          />
          <div
            role="dialog"
            aria-label={t("tooltipTitle")}
            className="fixed z-[70] max-w-xs rounded-xl border bg-popover p-3 text-sm shadow-lg"
            style={{
              left: Math.max(16, Math.min(tip.x, (typeof window !== "undefined" ? window.innerWidth : 1024) - 280)),
              top: Math.max(16, Math.min(tip.y + 10, (typeof window !== "undefined" ? window.innerHeight : 768) - 160)),
            }}
          >
            <p className="font-medium">{t("tooltipTitle")}</p>
            <p className="mt-1 break-all text-xs text-muted-foreground">{tip.domain}</p>
            <p className="mt-1 text-xs">
              {hostAllowed(tip.domain, config.whitelist) ? t("approved") : t("notApproved")}
            </p>
            <div className="mt-3 flex gap-2">
              {!hostAllowed(tip.domain, config.whitelist) && (
                <button
                  type="button"
                  onClick={allowDomain}
                  disabled={allowing}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
                >
                  <CheckIcon className="size-3.5" />
                  {t("allow")}
                </button>
              )}
              <button
                type="button"
                onClick={() => setTip(null)}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted"
              >
                <XIcon className="size-3.5" />
                {t("cancel")}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
