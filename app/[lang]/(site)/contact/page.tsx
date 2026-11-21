import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactWidgetLazy } from "@/components/contact/ContactWidgetLazy";
import type { TopicKey } from "@/components/contact/ContactWidget";

// Значения «сути вопроса» — дублированы здесь белым списком: экспортировать
// константы из "use client"-модуля в серверный компонент нельзя (client refs).
const VALID_TOPICS = ["product", "order", "partner", "account", "suggestion", "other"];

export async function generateMetadata(
  props: PageProps<"/[lang]/contact">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "contact" });
  return {
    title: t("pageTitle"),
    description: t("pageSubtitle"),
  };
}

/** Страница контактов (владелец 21.11): форма + селект «суть вопроса».
 *  ?topic=suggestion — предвыбор из карточки-идеи на главной. */
export default async function ContactPage({
  params,
  searchParams,
}: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  const { topic: topicParam } = await searchParams;
  const topic = Array.isArray(topicParam) ? topicParam[0] : topicParam;
  setRequestLocale(lang);
  const t = await getTranslations("contact");

  const initialTopic = topic && VALID_TOPICS.includes(topic)
    ? (topic as TopicKey)
    : undefined;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t("pageTitle")}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{t("pageSubtitle")}</p>

      <div className="mt-10">
        <ContactWidgetLazy initialTopic={initialTopic} />
      </div>
    </section>
  );
}
