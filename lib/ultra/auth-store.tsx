"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — управление сессией (Auth Store), порт на RevolutTIME
// Две серверные сессии, проверяются по порядку:
//   1. RevolutTIME (Google / Telegram, httpOnly cookie) → /api/auth/me
//   2. Ultra email-сессия (up_session, порт /api/ultra/auth/me)
// localStorage — только UI-кэш для мгновенного рендера.
// ══════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface AuthUser {
  email: string;
  login: string;
  /** Provider avatar (Google/Telegram), absent for email accounts. */
  picture?: string;
  provider?: string;
  wallet_attached?: boolean;
  error_state?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

/** Легаси-кука/ключ из старой клиентской «сессии» — вычищаем. */
function clearLegacyClientSession() {
  try {
    localStorage.removeItem("ultra_proxy_session");
    document.cookie = "ultra_proxy_session=;path=/;max-age=0";
  } catch { /* */ }
}

function cacheUser(user: AuthUser) {
  try { localStorage.setItem("ultra_proxy_session", JSON.stringify(user)); } catch { /* */ }
}

/**
 * Normalizes both session shapes into AuthUser:
 * - RevolutTIME SessionUser: { email, name, picture?, provider? }
 * - Ultra AuthUser:          { email, login, wallet_attached?, error_state? }
 */
function toAuthUser(raw: Record<string, unknown> | undefined | null): AuthUser | null {
  const email = typeof raw?.email === "string" ? raw.email : "";
  if (!email) return null;
  const name = typeof raw?.name === "string" ? raw.name : "";
  const provider = typeof raw?.provider === "string" ? raw.provider : "";
  if (name || provider) {
    return {
      email,
      login: name || email,
      picture: typeof raw?.picture === "string" ? raw.picture : undefined,
      provider: provider || "email",
    };
  }
  return {
    email,
    login: typeof raw?.login === "string" ? raw.login : email,
    wallet_attached: Boolean(raw?.wallet_attached),
    error_state: Boolean(raw?.error_state),
    provider: "email",
  };
}

async function fetchUser(url: string): Promise<AuthUser | null> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json().catch(() => null)) as { user?: Record<string, unknown> } | null;
  return toAuthUser(data?.user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 1) RevolutTIME session (Google / Telegram).
      const sessionUser = await fetchUser("/api/auth/me").catch(() => null);
      if (cancelled) return;
      if (sessionUser) {
        setUser(sessionUser);
        cacheUser(sessionUser);
        return;
      }
      // 2) Ultra email session (up_session).
      const ultraUser = await fetchUser("/api/ultra/auth/me").catch(() => null);
      if (cancelled) return;
      if (ultraUser) {
        setUser(ultraUser);
        cacheUser(ultraUser);
        return;
      }
      setUser(null);
      clearLegacyClientSession();
    })();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback((u: AuthUser) => {
    setUser(u);
    cacheUser(u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearLegacyClientSession();
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    fetch("/api/ultra/auth/logout", { method: "POST" }).catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
