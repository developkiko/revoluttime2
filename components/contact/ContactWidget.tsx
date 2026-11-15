"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2Icon,
  MapPinIcon,
  PhoneIcon,
  SendIcon,
} from "lucide-react";
import { toast } from "sonner";

import { SITE } from "@/lib/products";

type FormValues = { name: string; email: string; message: string };

/* Visual classes — exact Ultra template contact form (components/ultra/home/
 * ContactForm.tsx). Logic (RHF + zod + /api/contact + toasts) untouched
 * per spec dummy.md §2: only the looks change. */
const INPUT_BASE =
  "w-full px-4 py-3 bg-[var(--bg-input)] border rounded-lg text-[var(--text-heading)] text-sm outline-none transition-colors focus:border-[var(--color-primary)] placeholder:text-[var(--text-muted)]";
const INPUT_CLASS = `${INPUT_BASE} border-[var(--border-default)]`;
const INPUT_ERROR = `${INPUT_BASE} border-[var(--color-error)]`;
const LABEL_CLASS = "block text-[13px] text-[var(--text-secondary)] mb-1.5";
const FIELD_ERROR_CLASS = "text-[11px] text-[var(--color-error)] mt-1";

/**
 * Contact form widget.
 * TODO(contact API): replace mockSubmit with the real endpoint
 * (e.g. POST /api/contact → Supabase + Telegram notification).
 */
export function ContactWidget() {
  const t = useTranslations("contact");

  const schema = z.object({
    name: z.string().min(2, t("nameRequired")),
    email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
    message: z.string().min(10, t("messageRequired")),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", message: "" },
  });

  async function onSubmit(values: FormValues) {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) {
      toast.error(t("errorToast"));
      return;
    }
    const result = (await response.json()) as { delivered?: boolean };
    if (result.delivered) {
      toast.success(t("sentToast"));
    } else {
      toast.info(t("queuedToast"));
    }
    reset();
  }

  const infoRows = [
    {
      icon: PhoneIcon,
      label: "WhatsApp",
      value: SITE.phoneDisplay,
      note: "Tel",
      href: SITE.phoneHref,
    },
    {
      icon: SendIcon,
      label: "Telegram",
      value: "@revoluttime_bot",
      note: t("telegramNote"),
      href: SITE.telegram,
    },
    {
      icon: MapPinIcon,
      label: "85241 Hebertshausen",
      value: "",
      note: t("areaNote"),
      href: undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-[1fr_380px]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-card)] p-8"
      >
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className={LABEL_CLASS}>
              {t("name")}
            </label>
            <input
              id="contact-name"
              type="text"
              placeholder={t("namePlaceholder")}
              className={errors.name ? INPUT_ERROR : INPUT_CLASS}
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && <p className={FIELD_ERROR_CLASS}>{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="contact-email" className={LABEL_CLASS}>
              {t("email")}
            </label>
            <input
              id="contact-email"
              type="email"
              placeholder="you@example.com"
              className={errors.email ? INPUT_ERROR : INPUT_CLASS}
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && <p className={FIELD_ERROR_CLASS}>{errors.email.message}</p>}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="contact-message" className={LABEL_CLASS}>
            {t("message")}
          </label>
          <textarea
            id="contact-message"
            rows={5}
            placeholder={t("messagePlaceholder")}
            aria-invalid={!!errors.message}
            className={(errors.message ? INPUT_ERROR : INPUT_CLASS) + " min-h-[100px] resize-y"}
            {...register("message")}
          />
          {errors.message && (
            <p className={FIELD_ERROR_CLASS}>{errors.message.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-[10px] bg-[var(--color-accent)] px-8 py-[0.85rem] text-base font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {isSubmitting ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
          {isSubmitting ? t("sending") : t("submit")}
        </button>
      </form>

      {/* Info — template row style: icon left, label strong, value small */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
        {infoRows.map(({ icon: Icon, label, value, note, href }) => {
          const inner = (
            <>
              <Icon className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
              <div>
                <strong className="mb-0.5 block text-sm text-[var(--text-heading)]">{label}</strong>
                {value && (
                  <span className="text-[13px] text-[var(--text-secondary)]">{value}</span>
                )}
                {note && <span className="block text-[13px] text-[var(--text-secondary)]">{note}</span>}
              </div>
            </>
          );
          return href ? (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="-mx-2 my-0 flex gap-4 rounded-lg border-b border-[var(--border-subtle)] px-2 py-4 transition-colors last:border-b-0 hover:bg-[var(--hover-bg)]"
            >
              {inner}
            </a>
          ) : (
            <div
              key={label}
              className="-mx-2 flex gap-4 rounded-lg border-b border-[var(--border-subtle)] px-2 py-4 last:border-b-0"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
