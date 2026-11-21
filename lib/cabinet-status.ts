"use client";

import * as React from "react";

/**
 * Статусная строка кабинета (Фаза D, кабинет-режим шапки — решение
 * владельца 21.11): страница кабинета кладёт баланс/партнёров/имя в стор
 * через CabinetStatusBridge, шапка читает их для кабинет-варианта меню.
 * Без usePathname: он вне Suspense валит пререндер [slug]-роутов (грабля
 * project.md №5/грабли Next 16 #7). Серверный снапшот null — до гидрации
 * и вне кабинета шапка рендерит обычный режим.
 */

export interface CabinetStatus {
  balanceLabel: string | null;
  partnersCount: number | null;
  userName: string | null;
}

export const CABINET_STATUS_EMPTY: CabinetStatus = {
  balanceLabel: null,
  partnersCount: null,
  userName: null,
};

const cabinetStore = (() => {
  let status: CabinetStatus | null = null;
  const listeners = new Set<() => void>();
  return {
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot(): CabinetStatus | null {
      return status;
    },
    getServerSnapshot(): CabinetStatus | null {
      return null;
    },
    write(next: CabinetStatus) {
      status = next;
      listeners.forEach((listener) => listener());
    },
  };
})();

export function useCabinetStatus(): CabinetStatus | null {
  return React.useSyncExternalStore(
    cabinetStore.subscribe,
    cabinetStore.getSnapshot,
    cabinetStore.getServerSnapshot,
  );
}

export function writeCabinetStatus(next: CabinetStatus): void {
  cabinetStore.write(next);
}

/* ── Режим шапки: «свернуть кабинет-меню» (владелец 22.11, №13) ──────────
   «Главное меню» НЕ уводит с страницы, а временно возвращает обычное меню;
   в конце навигации появляется кнопка «Юзер-меню» (стрелка вперёд),
   возвращающая кабинет-режим. Данные статуса при этом не теряются. */

const dismissStore = (() => {
  let dismissed = false;
  const listeners = new Set<() => void>();
  return {
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot(): boolean {
      return dismissed;
    },
    getServerSnapshot(): boolean {
      return false;
    },
    set(next: boolean) {
      if (dismissed === next) return;
      dismissed = next;
      listeners.forEach((listener) => listener());
    },
  };
})();

export function useCabinetDismissed(): boolean {
  return React.useSyncExternalStore(
    dismissStore.subscribe,
    dismissStore.getSnapshot,
    dismissStore.getServerSnapshot
  );
}

export function setCabinetDismissed(next: boolean): void {
  dismissStore.set(next);
}
