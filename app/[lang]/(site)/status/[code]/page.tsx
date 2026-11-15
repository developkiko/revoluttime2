import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { NfScreen, type NfKind } from "@/components/layout/NfScreen";

/** Частые статусы как настоящие страницы (порт «Служебных экранов»). */
const STATUS_PAGES: Record<string, NfKind> = {
  "403": "forbidden",
  "410": "gone",
  "429": "rate",
  "503": "maintenance",
};

export function generateStaticParams() {
  return Object.keys(STATUS_PAGES).map((code) => ({ code }));
}

export async function generateMetadata(
  props: PageProps<"/[lang]/status/[code]">,
): Promise<Metadata> {
  const { lang, code } = await props.params;
  const kind = STATUS_PAGES[code];
  if (!kind) return {};
  const t = await getTranslations({ locale: lang, namespace: "status" });
  return { title: t(`${kind}.title`), robots: { index: false } };
}

export default async function StatusPage({
  params,
}: PageProps<"/[lang]/status/[code]">) {
  const { lang, code } = await params;
  setRequestLocale(lang);
  const kind = STATUS_PAGES[code];
  if (!kind) notFound();

  return <NfScreen code={code} kind={kind} />;
}
