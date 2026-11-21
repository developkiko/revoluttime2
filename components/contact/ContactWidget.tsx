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

import { SITE } from "@/lib/products";
import { useNotice } from "@/components/ui/notice";

/* ══════════════════════════════════════════════════════════════════════
   ГЛОБАЛЬНАЯ «ФОРМА ОБРАТНОЙ СВЯЗИ» (владелец 21.11)
   FeedbackForm — переиспользуемый компонент с параметрами:
   • title            — название формы
   • fields           — какие поля показывать (name/email/message)
   • required         — какие из них обязательные
   • topics           — допустимые значения «Суть вопроса» (селект обязателен
                        в компоненте и не удаляем — фиксированное поле)
   • initialTopic     — предвыбор темы (напр. /contact?topic=suggestion)
   ContactWidget — композиция /contact и /equipment: форма + панель
   контактов (WhatsApp/Telegram/адрес), визуал — Ultra template.
   ══════════════════════════════════════════════════════════════════════ */

/** Allowed «суть вопроса» values; /contact?topic=X preselects. */
export const TOPIC_KEYS = ["product", "order", "partner", "account", "suggestion", "other"] as const;
export type TopicKey = (typeof TOPIC_KEYS)[number];

export type FeedbackField = "name" | "email" | "message";

export interface FeedbackFormProps {
  /** Уникальный id формы (для label/input пар на странице). */
  formId?: string;
  /** Название формы над полями. */
  title?: string;
  /** Показываемые поля (порядок сохраняется). Default: все три. */
  fields?: FeedbackField[];
  /** Обязательные поля. Default: все три. */
  required?: FeedbackField[];
  /** Допустимые темы селекта (селект не удаляем и всегда required). */
  topics?: readonly TopicKey[];
  /** Предвыбранная тема (?topic=…). */
  initialTopic?: TopicKey;
  /** Extra классы на форме. */
  className?: string;
}

type FormValues = { name: string; email: string; message: string; topic: string };

/* Visual classes — exact Ultra template contact form. */
const INPUT_BASE =
  "w-full px-4 py-3 bg-[var(--bg-input)] border rounded-lg text-[var(--text-heading)] text-sm outline-none transition-colors focus:border-[var(--color-primary)] placeholder:text-[var(--text-muted)]";
const INPUT_CLASS = `${INPUT_BASE} border-[var(--border-default)]`;
const INPUT_ERROR = `${INPUT_BASE} border-[var(--color-error)]`;
const LABEL_CLASS = "block text-[13px] text-[var(--text-secondary)] mb-1.5";
const FIELD_ERROR_CLASS = "text-[11px] text-[var(--color-error)] mt-1";

export function FeedbackForm({
  formId = "feedback",
  title,
  fields = ["name", "email", "message"],
  required = ["name", "email", "message"],
  topics = TOPIC_KEYS,
  initialTopic,
  className,
}: FeedbackFormProps) {
  const t = useTranslations("contact");
  const { notice } = useNotice();

  // «Суть вопроса» всегда в схеме и всегда обязательна (владелец 21.11).
  // Минимальные длины полей зависят от required — скрытое поле остаётся "".
  const schema = z.object({
    name: z.string().min(required.includes("name") ? 2 : 0, t("nameRequired")),
    email: required.includes("email")
      ? z.string().min(1, t("emailRequired")).email(t("emailInvalid"))
      : z
          .string()
          .refine(
            (value) => value === "" || z.string().email().safeParse(value).success,
            t("emailInvalid")
          ),
    message: z
      .string()
      .min(required.includes("message") ? 10 : 0, t("messageRequired")),
    topic: z.string().min(1),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      topic: initialTopic ?? topics[0] ?? "other",
    },
  });

  async function onSubmit(values: FormValues) {
    // topic идёт в Telegram как локализованный лейбл, а не ключ
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        name: values.name ?? "",
        email: values.email ?? "",
        message: values.message ?? "",
        topic: t(`topic.${values.topic}`),
      }),
    });
    if (!response.ok) {
      notice({ text: t("errorToast"), variant: "error" });
      return;
    }
    const result = (await response.json()) as { delivered?: boolean };
    if (result.delivered) {
      notice({ text: t("sentToast"), variant: "success" });
    } else {
      notice({ text: t("queuedToast"), variant: "info" });
    }
    reset({
      name: "",
      email: "",
      message: "",
      topic: values.topic,
    });
  }

  const err = (field: FeedbackField) =>
    (errors as Record<string, { message?: string } | undefined>)[field]?.message;

  const nameField = (
    <div key="name">
      <label htmlFor={`${formId}-name`} className={LABEL_CLASS}>
        {t("name")}
        {required.includes("name") ? " *" : ""}
      </label>
      <input
        id={`${formId}-name`}
        type="text"
        placeholder={t("namePlaceholder")}
        className={errors.name ? INPUT_ERROR : INPUT_CLASS}
        aria-invalid={!!errors.name}
        {...register("name")}
      />
      {errors.name && <p className={FIELD_ERROR_CLASS}>{errors.name.message}</p>}
    </div>
  );

  const emailField = (
    <div key="email">
      <label htmlFor={`${formId}-email`} className={LABEL_CLASS}>
        {t("email")}
        {required.includes("email") ? " *" : ""}
      </label>
      <input
        id={`${formId}-email`}
        type="email"
        placeholder="you@example.com"
        className={errors.email ? INPUT_ERROR : INPUT_CLASS}
        aria-invalid={!!errors.email}
        {...register("email")}
      />
      {errors.email && <p className={FIELD_ERROR_CLASS}>{errors.email.message}</p>}
    </div>
  );

  const messageField = (
    <div key="message">
      <label htmlFor={`${formId}-message`} className={LABEL_CLASS}>
        {t("message")}
        {required.includes("message") ? " *" : ""}
      </label>
      <textarea
        id={`${formId}-message`}
        rows={5}
        placeholder={t("messagePlaceholder")}
        aria-invalid={!!errors.message}
        className={(errors.message ? INPUT_ERROR : INPUT_CLASS) + " min-h-[100px] resize-y"}
        {...register("message")}
      />
      {errors.message && <p className={FIELD_ERROR_CLASS}>{errors.message.message}</p>}
    </div>
  );

  const fieldMap: Record<FeedbackField, React.ReactNode> = {
    name: nameField,
    email: emailField,
    message: messageField,
  };
  const shown = fields.filter((f) => fieldMap[f]);

  return (
    <form
      data-tilt
      onSubmit={handleSubmit(onSubmit)}
      className={"rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-card)] p-8" + (className ? ` ${className}` : "")}
    >
      {title && <h3 className="mb-5 text-lg font-bold text-[var(--text-heading)]">{title}</h3>}

      {/* Имя/Email в 2 колонки, если показаны вместе */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {shown.filter((f) => f !== "message")}
      </div>
      {/* «Суть вопроса» — фиксированное обязательное поле (не удаляемое) */}
      <div className="mb-4">
        <label htmlFor={`${formId}-topic`} className={LABEL_CLASS}>
          {t("topicLabel")} *
        </label>
        <select id={`${formId}-topic`} className={INPUT_CLASS} {...register("topic")}>
          {topics.map((topicKey) => (
            <option key={topicKey} value={topicKey}>
              {t(`topic.${topicKey}`)}
            </option>
          ))}
        </select>
      </div>
      {shown.includes("message") && messageField}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-[10px] bg-[var(--color-accent)] px-8 py-[0.85rem] text-base font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
      >
        {isSubmitting ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
        {isSubmitting ? t("sending") : t("submit")}
      </button>
    </form>
  );
}

/**
 * Contact widget (страницы /contact и /equipment): форма + инфо-панель.
 * Панель контактов — template row style: icon left, label strong.
 */
export function ContactWidget({ initialTopic }: { initialTopic?: TopicKey }) {
  const t = useTranslations("contact");

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
      <FeedbackForm formId="contact" initialTopic={initialTopic} />

      {/* Info — template row style: icon left, label strong, value small */}
      <div data-tilt className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
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
