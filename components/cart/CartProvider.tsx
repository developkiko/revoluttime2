"use client";

import * as React from "react";
import { getPack, type PackId } from "@/lib/products";

export interface CartItem {
  packId: PackId;
  quantity: number;
}

interface CartContextValue {
  /** Cart lines from localStorage; empty until hydration completes. */
  items: CartItem[];
  totalCount: number;
  totalPriceCents: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (packId: PackId, quantity?: number) => void;
  setQuantity: (packId: PackId, quantity: number) => void;
  remove: (packId: PackId) => void;
  clear: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

const STORAGE_KEY = "revoluttime-cart-v1";
const EMPTY_ITEMS: CartItem[] = [];

/**
 * localStorage acts as an external store read via useSyncExternalStore,
 * which keeps SSR/prerender output consistent and syncs tabs.
 */
const cartStore = (() => {
  let rawCache = "";
  let itemsCache = EMPTY_ITEMS;
  let memoryVersion = 0;
  const listeners = new Set<() => void>();

  function parseItems(raw: string): CartItem[] {
    if (!raw) return EMPTY_ITEMS;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return EMPTY_ITEMS;
      return parsed.filter(
        (item): item is CartItem =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as CartItem).packId === "string" &&
          typeof (item as CartItem).quantity === "number" &&
          (item as CartItem).quantity > 0
      );
    } catch {
      return EMPTY_ITEMS;
    }
  }

  function getSnapshot(): CartItem[] {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? "";
    if (raw !== rawCache) {
      rawCache = raw;
      itemsCache = parseItems(raw);
    }
    return itemsCache;
  }

  function writeItems(next: CartItem[]) {
    try {
      const raw = JSON.stringify(next);
      window.localStorage.setItem(STORAGE_KEY, raw);
      rawCache = raw;
      itemsCache = next;
    } catch {
      // localStorage may be unavailable (private mode, quota) — keep the
      // in-memory store authoritative so the UI still updates.
      rawCache = `memory:${++memoryVersion}`;
      itemsCache = next;
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

  return { getSnapshot, writeItems, subscribe };
})();

function getServerSnapshot(): CartItem[] {
  return EMPTY_ITEMS;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = React.useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    getServerSnapshot
  );
  const [isOpen, setIsOpen] = React.useState(false);

  const { totalCount, totalPriceCents } = React.useMemo(
    () => ({
      totalCount: items.reduce((sum, item) => sum + item.quantity, 0),
      totalPriceCents: items.reduce(
        (sum, item) => sum + getPack(item.packId).priceCents * item.quantity,
        0
      ),
    }),
    [items]
  );

  const add = React.useCallback((packId: PackId, quantity = 1) => {
    const current = cartStore.getSnapshot();
    const existing = current.find((item) => item.packId === packId);
    cartStore.writeItems(
      existing
        ? current.map((item) =>
            item.packId === packId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...current, { packId, quantity }]
    );
  }, []);

  const setQuantity = React.useCallback((packId: PackId, quantity: number) => {
    const next = cartStore
      .getSnapshot()
      .map((item) => (item.packId === packId ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);
    cartStore.writeItems(next);
  }, []);

  const remove = React.useCallback((packId: PackId) => {
    cartStore.writeItems(
      cartStore.getSnapshot().filter((item) => item.packId !== packId)
    );
  }, []);

  const clear = React.useCallback(() => cartStore.writeItems([]), []);

  const value = React.useMemo(
    () => ({
      items,
      totalCount,
      totalPriceCents,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [items, totalCount, totalPriceCents, isOpen, add, setQuantity, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
