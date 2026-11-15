"use client";

import { useTranslations } from "next-intl";
import {
  BanIcon,
  ConstructionIcon,
  GaugeIcon,
  HomeIcon,
  LinkIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";

export type NfKind = "notFound" | "error" | "forbidden" | "gone" | "rate" | "maintenance";

/** Крупная иконка-состояние над кодом (служебные экраны старого дамми). */
const KIND_ICONS = {
  notFound: LinkIcon,
  error: RefreshCwIcon,
  forbidden: BanIcon,
  gone: Trash2Icon,
  rate: GaugeIcon,
  maintenance: ConstructionIcon,
} as const;

/**
 * Служебный экран (порт со старого дамми: .nf-code/.nf-title/.nf-text/
 * .nf-btn): гигантский код с тонкой заливкой, иконка-состояние, заголовок,
 * пояснение и кнопка возврата. Клиентский: локаль берёт из провайдера,
 * поэтому работает и в app/[lang]/not-found, где params недоступны.
 */
export function NfScreen({
  code,
  kind,
  onReset,
}: {
  code: string;
  kind: NfKind;
  /** Для error-экрана: повторить рендер (error.tsx reset). */
  onReset?: () => void;
}) {
  const t = useTranslations("status");
  const Icon = KIND_ICONS[kind];
  const isError = kind === "error" || kind === "maintenance";

  return (
    <div className="nf-wrap">
      <span className="state-ico">
        <Icon aria-hidden="true" />
      </span>
      <p className={`nf-code ${isError ? "nf-code--err" : ""}`}>{code}</p>
      <h1 className="nf-title">{t(`${kind}.title`)}</h1>
      <p className="nf-text">{t(`${kind}.text`)}</p>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="nf-btn inline-flex items-center gap-2 rounded-[10px] border border-primary/25 bg-primary/12 py-3 px-5 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
        >
          <RefreshCwIcon aria-hidden="true" />
          {t("retry")}
        </button>
      )}
      <Link
        href="/"
        className="nf-btn inline-flex items-center gap-2 rounded-[10px] bg-primary py-3 px-6 text-sm font-semibold text-white transition-all hover:bg-primary/85"
      >
        <HomeIcon aria-hidden="true" />
        {t("home")}
      </Link>
    </div>
  );
}
