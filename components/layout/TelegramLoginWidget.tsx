"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { refreshSessionUser } from "@/lib/auth-store";

interface TelegramAuthData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramAuthData) => void;
  }
}

/**
 * Official Telegram Login Widget (https://core.telegram.org/widgets/login).
 * Requires the bot's domain to be whitelisted via BotFather (/setdomain) —
 * e.g. revolut-time.vercel.app and the production domain.
 */
export function TelegramLoginWidget() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!botName || !containerRef.current) return;

    window.onTelegramAuth = async (user: TelegramAuthData) => {
      const response = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (response.ok) {
        await refreshSessionUser();
        toast.success(t("welcomeToast"));
      } else {
        toast.error(t("telegramError"));
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    containerRef.current.replaceChildren(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [botName, locale, t]);

  if (!botName) return null;
  return (
    <div
      ref={containerRef}
      className="flex min-h-[40px] justify-center [&>iframe]:w-full!"
      />
  );
}
