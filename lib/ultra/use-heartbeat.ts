"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/ultra/auth-store";

/**
 * Presence pings while logged-in. page = current pathname (updates on navigation).
 */
export function useHeartbeat() {
  const { user, isLoggedIn } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoggedIn || !user?.email) return;

    let stopped = false;

    const send = () => {
      if (stopped || document.visibilityState === "hidden") return;
      const payload = {
        email: user.email,
        page: pathname || window.location.pathname || "/",
        sw: window.screen?.width || 0,
        sh: window.screen?.height || 0,
      };
      try {
        fetch("/api/ultra/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      } catch {
        /* */
      }
    };

    send();
    const id = window.setInterval(send, 25000);
    const onVis = () => {
      if (document.visibilityState === "visible") send();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stopped = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [isLoggedIn, user?.email, pathname]);
}

/** Mount once under AuthProvider */
export function HeartbeatBridge() {
  useHeartbeat();
  return null;
}
