"use client";

import * as React from "react";
import { CATALOG_OFFERS, type BookingSlot, type CatalogOffer, type LocalizedText, type SectionKey } from "@/lib/catalog";

/**
 * Demo admin store: offers edits (incl. booking slots) live in localStorage
 * on top of the seed catalog. TODO(admin API): swap for Supabase tables
 * (offers, booking_slots) + service-role routes; UI stays the same.
 */

export interface AdminOfferDraft {
  slug: string;
  section: SectionKey;
  title: LocalizedText;
  summary: LocalizedText;
  images: string[];
  comingSoon: boolean;
  slots: BookingSlot[];
}

export interface DemoContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
}

const OFFERS_KEY = "revoluttime-admin-offers-v1";
const MESSAGES_KEY = "revoluttime-admin-messages-v1";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota
  }
  listeners.forEach((l) => l());
}

const listeners = new Set<() => void>();

/** Seed messages shown when nothing was submitted yet. */
const SEED_MESSAGES: DemoContactMessage[] = [
  { id: "m1", name: "Anna S.", email: "anna@example.com", message: "Здравствуйте! Когда откроется запись на теннис?", date: "2026-10-26" },
  { id: "m2", name: "Dmitry W.", email: "dima@example.com", message: "Есть ли доставка таблеток в Австрию?", date: "2026-10-22" },
];

function toDraft(offer: CatalogOffer): AdminOfferDraft {
  return {
    slug: offer.slug,
    section: offer.section,
    title: offer.title,
    summary: offer.summary,
    images: offer.images,
    comingSoon: offer.comingSoon ?? false,
    slots: offer.slots,
  };
}

export function useAdminOffers(): AdminOfferDraft[] {
  const [offers, setOffers] = React.useState<AdminOfferDraft[]>([]);

  React.useEffect(() => {
    const update = () => {
      const overrides = readJson<Record<string, AdminOfferDraft>>(OFFERS_KEY, {});
      const merged = CATALOG_OFFERS.map(
        (offer) => overrides[offer.slug] ?? toDraft(offer)
      );
      setOffers(merged);
    };
    update();
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return offers;
}

export function saveAdminOffer(draft: AdminOfferDraft) {
  const overrides = readJson<Record<string, AdminOfferDraft>>(OFFERS_KEY, {});
  overrides[draft.slug] = draft;
  writeJson(OFFERS_KEY, overrides);
}

export function resetAdminOffer(slug: string) {
  const overrides = readJson<Record<string, AdminOfferDraft>>(OFFERS_KEY, {});
  delete overrides[slug];
  writeJson(OFFERS_KEY, overrides);
}

export function isOfferOverridden(slug: string): boolean {
  if (typeof window === "undefined") return false;
  const overrides = readJson<Record<string, AdminOfferDraft>>(OFFERS_KEY, {});
  return slug in overrides;
}

export function useAdminMessages(): DemoContactMessage[] {
  const [messages, setMessages] = React.useState<DemoContactMessage[]>([]);

  React.useEffect(() => {
    const update = () => setMessages(readJson(MESSAGES_KEY, SEED_MESSAGES));
    update();
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return messages;
}

export function addAdminMessage(message: DemoContactMessage) {
  const current = readJson<DemoContactMessage[]>(MESSAGES_KEY, SEED_MESSAGES);
  writeJson(MESSAGES_KEY, [message, ...current]);
}
