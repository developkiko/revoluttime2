"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/ultra/auth-store";

type TelegramAuth = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

interface TelegramLoginButtonProps {
  /** Legacy field from the pre-port API; the RevolutTIME flow ignores it. */
  mode?: "login" | "register";
  enabled?: boolean;
}

/**
 * Telegram's legacy Login Widget, wired to the RevolutTIME auth API
 * (/api/auth/telegram). The payload must stay exactly the widget's
 * TelegramAuthData — any extra fields (e.g. the old `mode`) would break the
 * server-side HMAC signature check, so login/register share one flow.
 */
export default function TelegramLoginButton({ enabled = true }: TelegramLoginButtonProps) {
  const { login } = useAuth();
  const router = useRouter();
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;

  useEffect(() => {
    let active = true;
    // Generated inside the effect: Math.random() is impure and must not run
    // during render (react-hooks purity rule).
    const callbackKey = `ultraProxyTelegramAuth_${Math.random().toString(36).slice(2)}`;
    const globalWindow = window as unknown as Record<string, unknown>;

    const onAuth = async (auth: TelegramAuth) => {
      if (!active) return;
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(auth),
        });
        const data = await response.json().catch(() => ({}));
        const user = data?.user;
        if (!response.ok || !user?.email) {
          throw new Error(
            data?.error === "auth_not_configured"
              ? "Telegram authorization is not configured"
              : data?.error || "Telegram authorization failed"
          );
        }
        // RevolutTIME SessionUser → Ultra AuthUser shape.
        login({
          email: user.email,
          login: user.name || user.email,
          picture: user.picture,
          provider: user.provider,
        });
        router.replace("/dashboard");
        router.refresh();
      } catch (reason) {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Telegram authorization failed");
          setLoading(false);
        }
      }
    };

    globalWindow[callbackKey] = onAuth;

    if (enabled && botName && host.current) {
      host.current.innerHTML = "";
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      script.setAttribute("data-telegram-login", botName);
      script.setAttribute("data-size", "large");
      script.setAttribute("data-radius", "20");
      script.setAttribute("data-request-access", "write");
      script.setAttribute("data-onauth", `${callbackKey}(user)`);
      script.onerror = () => {
        if (active) setError("Telegram authorization is unavailable");
      };
      host.current.appendChild(script);
    }

    return () => {
      active = false;
      delete globalWindow[callbackKey];
      if (host.current) host.current.innerHTML = "";
    };
  }, [enabled, botName, login, router]);

  return (
    <div className="mt-4 mb-4">
      <div className="flex justify-center min-h-[44px]" ref={host} aria-busy={loading} />
      {loading && <p className="mt-2 text-xs text-[var(--text-muted)]">Подтверждение через Telegram…</p>}
      {error && <p className="mt-2 text-xs text-[var(--color-error)]" role="alert">{error}</p>}
    </div>
  );
}
