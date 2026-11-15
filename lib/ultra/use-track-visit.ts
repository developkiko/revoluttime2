import { useEffect } from "react";
import { useAuth } from "@/lib/ultra/auth-store";

function getTgUserInfo(): { first_name?: string; username?: string; id?: number } | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const tgInit = url.searchParams.get("tg_user");
  if (tgInit) {
    try {
      return JSON.parse(tgInit);
    } catch {
      /* */
    }
  }
  if ((window as any).TelegramWebAppData) {
    return (window as any).TelegramWebAppData;
  }
  return null;
}

export function useTrackVisit(page?: string) {
  const { user } = useAuth();

  useEffect(() => {
    async function track() {
      try {
        const tgInfo = getTgUserInfo();
        await fetch("/api/ultra/visits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: page || window.location.pathname,
            userId: user?.email || undefined,
            userAgent: navigator.userAgent || "",
            referer: document.referrer || "",
            tgInfo: tgInfo
              ? { first_name: tgInfo.first_name, username: tgInfo.username, id: tgInfo.id }
              : undefined,
          }),
        });
      } catch {
        /* ignore */
      }
    }
    track();
  }, [page, user?.email]);
}
