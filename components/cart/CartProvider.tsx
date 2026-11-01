"use client";

import * as React from "react";
import { getPack, type PackId } from "@/lib/products";
import { getOfferSlot } from "@/lib/catalog";

export interface PackCartItem {
  kind: "pack";
  packId: PackId;
  quantity: number;
}

/** A bookable offer (sport session, tour, event) for a chosen date. */
export interface TicketCartItem {
  kind: "ticket";
  offerSlug: string;
  slotId: string;
  people: number;
}

export type CartItem = PackCartItem | TicketCartItem;

interface CartContextValue {
  /** Cart lines from localStorage; empty until hydration completes. */
  items: CartItem[];
  /** Packs + booked people — drives the header badge. */
  totalCount: number;
  totalPriceCents: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addPack: (packId: PackId, quantity?: number) => void;
  addTicket: (offerSlug: string, slotId: string, people: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

const STORAGE_KEY = "revoluttime-cart-v2";
const EMPTY_ITEMS: CartItem[] = [];

/** Stable per-line identity (kind + ids), used by steppers in the drawer. */
export function cartItemKey(item: CartItem): string {
  return item.kind === "pack"
    ? `pack:${item.packId}`
    : `ticket:${item.offerSlug}:${item.slotId}`;
}

function priceOf(item: CartItem): number {
  if (item.kind === "pack") return getPack(item.packId).priceCents * item.quantity;
  const slot = getOfferSlot(item.offerSlug, item.slotId);
  return slot ? slot.priceCents * item.people : 0;
}

function countOf(item: CartItem): number {
  return item.kind === "pack" ? item.quantity : item.people;
}

function isValidItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  if (item.kind === "pack") {
    return (
      typeof item.packId === "string" && typeof item.quantity === "number" && item.quantity > 0
    );
  }
  if (item.kind === "ticket") {
    return (
      typeof item.offerSlug === "string" &&
      typeof item.slotId === "string" &&
      typeof item.people === "number" &&
      item.people > 0 &&
      // drop tickets whose offer/slot was removed from the catalog
      getOfferSlot(item.offerSlug, item.slotId) !== undefined
    );
  }
  return false;
}

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
      return parsed.filter(isValidItem);
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

function mergeItem(items: CartItem[], incoming: CartItem): CartItem[] {
  const key = cartItemKey(incoming);
  const index = items.findIndex((item) => cartItemKey(item) === key);
  if (index === -1) return [...items, incoming];
  return items.map((item, i) => {
    if (i !== index) return item;
    if (item.kind === "pack" && incoming.kind === "pack") {
      return { ...item, quantity: item.quantity + incoming.quantity };
    }
    if (item.kind === "ticket" && incoming.kind === "ticket") {
      return { ...item, people: item.people + incoming.people };
    }
    return item;
  });
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
      totalCount: items.reduce((sum, item) => sum + countOf(item), 0),
      totalPriceCents: items.reduce((sum, item) => sum + priceOf(item), 0),
    }),
    [items]
  );

  const addPack = React.useCallback((packId: PackId, quantity = 1) => {
    cartStore.writeItems(
      mergeItem(cartStore.getSnapshot(), { kind: "pack", packId, quantity })
    );
  }, []);

  const addTicket = React.useCallback(
    (offerSlug: string, slotId: string, people: number) => {
      cartStore.writeItems(
        mergeItem(cartStore.getSnapshot(), {
          kind: "ticket",
          offerSlug,
          slotId,
          people,
        })
      );
    },
    []
  );

  const setQuantity = React.useCallback((key: string, quantity: number) => {
    const next = cartStore
      .getSnapshot()
      .map((item) =>
        cartItemKey(item) === key
          ? item.kind === "pack"
            ? { ...item, quantity }
            : { ...item, people: quantity }
          : item
      )
      .filter((item) => countOf(item) > 0);
    cartStore.writeItems(next);
  }, []);

  const remove = React.useCallback((key: string) => {
    cartStore.writeItems(
      cartStore.getSnapshot().filter((item) => cartItemKey(item) !== key)
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
      addPack,
      addTicket,
      setQuantity,
      remove,
      clear,
    }),
    [items, totalCount, totalPriceCents, isOpen, addPack, addTicket, setQuantity, remove, clear]
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
