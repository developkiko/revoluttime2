"use client";

import * as React from "react";

export interface AuthUser {
  email: string;
  name?: string;
}

/**
 * Client-side auth session store.
 *
 * TODO(auth API): replace the mock `signIn` with the real endpoint once the
 * API is provided — keep the same AuthUser shape and the subscribe/getSnapshot
 * contract, and move token storage to httpOnly cookies.
 */
const authStore = (() => {
  const STORAGE_KEY = "revoluttime-auth-v1";
  let userCache: AuthUser | null = null;
  let rawCache = "";
  let memoryVersion = 0;
  const listeners = new Set<() => void>();

  function parseUser(raw: string): AuthUser | null {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (typeof parsed.email !== "string" || !parsed.email.includes("@")) {
        return null;
      }
      return {
        email: parsed.email,
        name:
          typeof parsed.name === "string" ? (parsed.name as string) : undefined,
      };
    } catch {
      return null;
    }
  }

  function getSnapshot(): AuthUser | null {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? "";
    if (raw !== rawCache) {
      rawCache = raw;
      userCache = parseUser(raw);
    }
    return userCache;
  }

  function getServerSnapshot(): AuthUser | null {
    return null;
  }

  function writeUser(user: AuthUser | null) {
    try {
      const raw = user ? JSON.stringify(user) : "";
      if (user) window.localStorage.setItem(STORAGE_KEY, raw);
      else window.localStorage.removeItem(STORAGE_KEY);
      rawCache = raw;
      userCache = user;
    } catch {
      rawCache = `memory:${++memoryVersion}`;
      userCache = user;
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return { getSnapshot, getServerSnapshot, subscribe, writeUser };
})();

export function useAuthUser(): AuthUser | null {
  return React.useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot
  );
}

/** Mock sign-in. TODO(auth API): POST credentials, store the returned session. */
export async function mockSignIn(email: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  authStore.writeUser({ email, name: email.split("@")[0] });
}

export function mockSignOut(): void {
  authStore.writeUser(null);
}
