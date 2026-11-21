"use client";

/** Избранное (Фаза G, решение владельца: «локально всем + синк в БД
 *  авторизованным»). Гости — localStorage; вошедшие — users.favorites
 *  (jsonb, /api/favorites), при первом входе локальный список доливается
 *  на сервер (merge). Одиночный кеш-модуль на вкладку. */

import * as React from "react";

import { useAuthUser } from "@/lib/auth-store";

const LS_KEY = "rt_favorites";

function readLocal(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
    return Array.isArray(raw) ? raw.map(String) : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: string[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
  } catch {
    // приватный режим — живём без локального списка
  }
}

let cache: string[] | null = null;
const listeners = new Set<() => void>();

function write(next: string[]) {
  cache = next;
  writeLocal(next);
  listeners.forEach((listener) => listener());
}

/** Первый вход с локальным списком: долить его на сервер. */
let mergeDone = false;

async function syncFromServer(): Promise<void> {
  try {
    const response = await fetch("/api/favorites", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { favorites?: string[] };
    const server = Array.isArray(data.favorites) ? data.favorites : [];
    const local = cache ?? readLocal();
    if (!mergeDone) {
      mergeDone = true;
      const merged = [...new Set([...server, ...local])];
      if (merged.length > server.length) {
        // Доливаем недостающее одним вызовом на каждый id (списки маленькие).
        for (const id of merged) {
          if (!server.includes(id)) {
            await fetch("/api/favorites", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, action: "add" }),
            });
          }
        }
      }
      write(merged);
    } else {
      cache = server;
      listeners.forEach((listener) => listener());
    }
  } catch {
    // оффлайн — остаёмся на локальном
  }
}

export function useFavorites() {
  const user = useAuthUser();
  const ids = React.useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => cache,
    () => null // SSR: до гидрации сердце не подсвечено
  );

  React.useEffect(() => {
    if (cache === null) write(readLocal());
  }, []);

  React.useEffect(() => {
    if (user) syncFromServer();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps -- user по ссылке меняется на вход/выход

  const toggle = React.useCallback(
    (id: string) => {
      const current = cache ?? readLocal();
      const next = current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id];
      write(next);
      if (user) {
        fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            action: next.includes(id) ? "add" : "remove",
          }),
        }).catch(() => undefined);
      }
    },
    [user]
  );

  return { ids: ids ?? [], toggle };
}
