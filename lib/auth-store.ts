"use client";

import * as React from "react";

export interface AuthUser {
  email: string;
  name: string;
  provider: "telegram" | "google";
  /** Provider avatar URL (Telegram photo_url / Google picture) if present. */
  picture?: string;
}

/**
 * Client session store. The source of truth is the httpOnly session cookie;
 * the store hydrates from /api/auth/me and mirrors it for the UI.
 */
const authStore = (() => {
  let userCache: AuthUser | null = null;
  const listeners = new Set<() => void>();

  function writeUser(user: AuthUser | null) {
    userCache = user;
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getSnapshot(): AuthUser | null {
    return userCache;
  }

  function getServerSnapshot(): AuthUser | null {
    return null;
  }

  return { getSnapshot, getServerSnapshot, subscribe, writeUser };
})();

export async function refreshSessionUser(): Promise<void> {
  try {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    const data = (await response.json()) as { user: AuthUser | null };
    authStore.writeUser(data.user);
  } catch {
    authStore.writeUser(null);
  }
}

export async function signOut(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } finally {
    authStore.writeUser(null);
  }
}

export function useAuthUser(): AuthUser | null {
  const user = React.useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot
  );

  React.useEffect(() => {
    refreshSessionUser();
  }, []);

  return user;
}
