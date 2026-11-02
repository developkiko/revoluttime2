"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  BarChart3Icon,
  CalendarPlusIcon,
  MailIcon,
  RotateCcwIcon,
  SaveIcon,
  Trash2Icon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  isOfferOverridden,
  resetAdminOffer,
  saveAdminOffer,
  useAdminOffers,
  type AdminOfferDraft,
} from "@/lib/admin-store";
import type { ContactMessage } from "@/lib/contact-inbox";
import { formatPrice, type Locale } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Tab = "overview" | "offers" | "users" | "messages";

const TABS: Array<{ key: Tab; icon: React.ReactNode }> = [
  { key: "overview", icon: <BarChart3Icon className="size-4" /> },
  { key: "offers", icon: <WrenchIcon className="size-4" /> },
  { key: "users", icon: <UsersIcon className="size-4" /> },
  { key: "messages", icon: <MailIcon className="size-4" /> },
];

const DEMO_USERS = [
  { name: "Мария П.", email: "maria@example.com", provider: "google", joined: "2026-09-14" },
  { name: "Игорь К.", email: "igor@example.com", provider: "telegram", joined: "2026-10-02" },
  { name: "Anna S.", email: "anna@example.com", provider: "google", joined: "2026-10-20" },
  { name: "admin", email: "admin@revoluttime.de", provider: "demo", joined: "—" },
];

function OffersEditor({ locale }: { locale: Locale }) {
  const t = useTranslations("admin.offers");
  const offers = useAdminOffers();
  const [editingSlug, setEditingSlug] = React.useState<string | null>(null);

  if (editingSlug) {
    return (
      <OfferForm
        slug={editingSlug}
        locale={locale}
        onDone={() => setEditingSlug(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
        {t("demoNote")}
      </p>
      {offers.map((offer) => {
        const overridden = isOfferOverridden(offer.slug);
        return (
          <div
            key={offer.slug}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium">
                {offer.title[locale]}
                {overridden && (
                  <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-600 dark:text-sky-400">
                    {t("edited")}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {offer.section} · {offer.comingSoon ? t("comingSoon") : `${offer.slots.length} ${t("slots")}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingSlug(offer.slug)}>
                <WrenchIcon />
                {t("edit")}
              </Button>
              {overridden && (
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t("reset")}
                  onClick={() => {
                    resetAdminOffer(offer.slug);
                    toast.success(t("resetDone"));
                  }}
                >
                  <RotateCcwIcon />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OfferForm({
  slug,
  locale,
  onDone,
}: {
  slug: string;
  locale: Locale;
  onDone: () => void;
}) {
  const t = useTranslations("admin.offers");
  const offers = useAdminOffers();
  const draft = offers.find((o) => o.slug === slug)!;
  const [form, setForm] = React.useState<AdminOfferDraft>(draft);

  function setLocalized(field: "title" | "summary", lang: keyof AdminOfferDraft["title"], value: string) {
    setForm((f) => ({ ...f, [field]: { ...f[field], [lang]: value } }));
  }

  function setSlot(index: number, patch: Partial<AdminOfferDraft["slots"][number]>) {
    setForm((f) => ({
      ...f,
      slots: f.slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)),
    }));
  }

  function save() {
    saveAdminOffer(form);
    toast.success(t("savedToast"));
    onDone();
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          {t("editing")} · <span className="text-muted-foreground">{slug}</span>
        </p>
        <Button variant="ghost" size="sm" onClick={onDone}>
          {t("cancel")}
        </Button>
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t("titleRu")}
      </p>
      <Input value={form.title.ru} onChange={(e) => setLocalized("title", "ru", e.target.value)} />
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t("titleDe")}
      </p>
      <Input value={form.title.de} onChange={(e) => setLocalized("title", "de", e.target.value)} />
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t("titleEn")}
      </p>
      <Input value={form.title.en} onChange={(e) => setLocalized("title", "en", e.target.value)} />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.comingSoon}
          onChange={(e) => setForm((f) => ({ ...f, comingSoon: e.target.checked }))}
          className="size-4 accent-[#056ea8]"
        />
        {t("comingSoon")}
      </label>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{t("slotsTitle")}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setForm((f) => ({
                ...f,
                comingSoon: false,
                slots: [
                  ...f.slots,
                  {
                    id: `slot-${Date.now()}`,
                    date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
                    maxPeople: 6,
                    priceCents: 1500,
                  },
                ],
              }))
            }
          >
            <CalendarPlusIcon />
            {t("addSlot")}
          </Button>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {form.slots.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("noSlots")}</p>
          )}
          {form.slots.map((slot, index) => (
            <div key={slot.id} className="flex flex-wrap items-center gap-2">
              <Input
                type="date"
                value={slot.date}
                onChange={(e) => setSlot(index, { date: e.target.value })}
                className="w-40"
              />
              <Input
                type="number"
                min={1}
                value={slot.maxPeople}
                aria-label={t("maxPeopleLabel")}
                onChange={(e) => setSlot(index, { maxPeople: Number(e.target.value) || 1 })}
                className="w-24"
              />
              <Input
                type="number"
                min={0}
                step={100}
                value={slot.priceCents}
                aria-label={t("priceLabel")}
                onChange={(e) => setSlot(index, { priceCents: Number(e.target.value) || 0 })}
                className="w-28"
              />
              <span className="text-xs text-muted-foreground">
                {formatPrice(slot.priceCents, locale)}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("removeSlot")}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    slots: f.slots.filter((_, i) => i !== index),
                  }))
                }
              >
                <Trash2Icon />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={save} className="self-start">
        <SaveIcon />
        {t("save")}
      </Button>
    </div>
  );
}

function MessagesTab() {
  const t = useTranslations("admin.messagesTab");
  const [messages, setMessages] = React.useState<ContactMessage[] | null>(null);

  React.useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => (r.ok ? r.json() : { messages: [] }))
      .then((data) => setMessages(data.messages))
      .catch(() => setMessages([]));
  }, []);

  if (messages === null) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }
  if (messages.length === 0) {
    return (
      <p className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
        {t("empty")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((m) => (
        <div key={m.id} className="rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">
              {m.name} <span className="text-muted-foreground">· {m.email}</span>
            </p>
            <p className="text-xs tabular-nums text-muted-foreground">{m.date}</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{m.message}</p>
        </div>
      ))}
    </div>
  );
}

export function AdminPanel() {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const [tab, setTab] = React.useState<Tab>("overview");

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ key, icon }) => (
          <Button
            key={key}
            variant={tab === key ? "default" : "outline"}
            size="sm"
            onClick={() => setTab(key)}
          >
            {icon}
            {t(`tab.${key}`)}
          </Button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: t("statUsers"), value: "5" },
              { label: t("statOrders"), value: "14" },
              { label: t("statRevenue"), value: formatPrice(187450, locale) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl border bg-card p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
              </div>
            ))}
            <p className="text-xs text-muted-foreground sm:col-span-3">
              {t("demoNumbers")}
            </p>
          </div>
        )}

        {tab === "offers" && (
          <OffersEditor locale={locale} />
        )}

        {tab === "users" && (
          <div className="overflow-hidden rounded-2xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">{t("users.name")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("users.email")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("users.provider")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("users.joined")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {DEMO_USERS.map((u) => (
                  <tr key={u.email} className="bg-card">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{u.provider}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "messages" && <MessagesTab />}
      </div>
    </div>
  );
}
