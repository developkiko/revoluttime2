"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE } from "@/lib/products";

type FormValues = { name: string; email: string; message: string };

/**
 * Contact form widget.
 * TODO(contact API): replace mockSubmit with the real endpoint
 * (e.g. POST /api/contact → Supabase + Telegram notification).
 */
export function ContactWidget() {
  const t = useTranslations("contact");
  const locale = useLocale();

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
    // mock — имитация отправки; реальный эндпоинт появится с API
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.info("[contact] payload", { locale, ...values });
    toast.success(t("sentToast"));
    reset();
  }

  return (
    <div className="grid gap-6 rounded-3xl border bg-card p-6 shadow-sm md:grid-cols-[1fr_1.2fr] md:p-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">{t("infoTitle")}</h3>
        <a
          href={SITE.phoneHref}
          className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PhoneIcon className="size-4" />
          </span>
          <span>
            {SITE.phoneDisplay}
            <span className="block text-xs">WhatsApp / Tel</span>
          </span>
        </a>
        <a
          href={SITE.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <SendIcon className="size-4" />
          </span>
          <span>
            @revoluttime_bot
            <span className="block text-xs">{t("telegramNote")}</span>
          </span>
        </a>
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPinIcon className="size-4" />
          </span>
          <span>
            85241 Hebertshausen
            <span className="block text-xs">{t("areaNote")}</span>
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="contact-name" className="text-xs font-medium text-muted-foreground">
              {t("name")}
            </label>
            <Input
              id="contact-name"
              placeholder={t("namePlaceholder")}
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="contact-email" className="text-xs font-medium text-muted-foreground">
              {t("email")}
            </label>
            <Input
              id="contact-email"
              type="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="contact-message" className="text-xs font-medium text-muted-foreground">
            {t("message")}
          </label>
          <textarea
            id="contact-message"
            rows={4}
            placeholder={t("messagePlaceholder")}
            aria-invalid={!!errors.message}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
            {...register("message")}
          />
          {errors.message && (
            <p className="text-xs text-destructive">{errors.message.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <SendIcon />
          )}
          {isSubmitting ? t("sending") : t("submit")}
        </Button>
      </form>
    </div>
  );
}
