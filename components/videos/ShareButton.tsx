"use client";

/** «Поделиться» (Фаза G, владелец: «стандартный набор для немцев»):
 *  нативный navigator.share где есть (мобилки), иначе меню —
 *  WhatsApp / Telegram / Facebook / X / E-Mail / копирование ссылки.
 *  Все цели — обычные GET-ссылки шаринга; document.title читается
 *  в эффекте (SSR-safe). */

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { LinkIcon, MailIcon, ShareIcon } from "lucide-react";

import { useNotice } from "@/components/ui/notice";

export function ShareButton({ path }: { path: string }) {
  const t = useTranslations("share");
  const locale = useLocale();
  const notice = useNotice();
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [title, setTitle] = React.useState("");

  React.useEffect(() => {
    setUrl(`${window.location.origin}/${locale}${path}`);
    setTitle(document.title);
  }, [locale, path]);

  // Нативный шаринг — сразу системное меню (если поддерживается).
  const sharedRef = React.useRef(false);
  React.useEffect(() => {
    if (open && !sharedRef.current && typeof navigator !== "undefined" && navigator.share) {
      sharedRef.current = true;
      navigator.share({ title, url }).catch(() => undefined);
      setOpen(false);
    }
  }, [open, title, url]);

  const enc = encodeURIComponent;
  const targets = [
    { key: "whatsapp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
    { key: "telegram", href: `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}` },
    { key: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { key: "x", href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}` },
    { key: "email", href: `mailto:?subject=${enc(title)}&body=${enc(url)}` },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      notice.notice({ text: t("copied"), variant: "success" });
    } catch {
      notice.notice({ text: t("copyError"), variant: "error" });
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
      >
        <ShareIcon className="size-4" />
        {t("share")}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] cursor-default"
          />
          <div className="absolute right-0 z-[70] mt-2 w-52 rounded-xl border bg-popover p-1.5 shadow-lg">
            {targets.map((target) => (
              <a
                key={target.key}
                href={target.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-muted"
              >
                <ShareIcon className="size-4 text-muted-foreground" />
                {t(target.key)}
              </a>
            ))}
            <button
              type="button"
              onClick={copyLink}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-muted"
            >
              <LinkIcon className="size-4 text-muted-foreground" />
              {t("copy")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
