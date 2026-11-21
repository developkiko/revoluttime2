import { getTranslations } from "next-intl/server";
import { ExternalLinkIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { CATALOG_OFFERS, offerHref } from "@/lib/catalog";
import type { Locale } from "@/lib/products";

type PageRow = { href: string; label: string };

/** Тема сайта — витрина + служебные пользовательские пути. */
function sitePages(lang: string): PageRow[] {
  const loc = (["de", "ru", "en"].includes(lang) ? lang : "en") as Locale;
  const offerRows: PageRow[] = CATALOG_OFFERS.map((offer) => ({
    href: offerHref(offer),
    label: `${offer.title[loc] ?? offer.title.en} (${offerHref(offer)})`,
  }));
  return [
    { href: "/", label: "home" },
    { href: "/shop", label: "shop" },
    { href: "/hydrogen", label: "hydrogen" },
    { href: "/hydrogen/tablets", label: "hydrogenTablets" },
    { href: "/studio", label: "studio" },
    { href: "/equipment", label: "equipment" },
    { href: "/recreation", label: "recreation" },
    ...offerRows,
    { href: "/partner", label: "partner" },
    { href: "/journey", label: "journey" },
    { href: "/cabinet", label: "cabinet" },
    { href: "/encyclopedia", label: "encyclopedia" },
    { href: "/certificates", label: "certificates" },
    { href: "/contact", label: "contact" },
    { href: "/checkout", label: "checkout" },
    { href: "/legal/impressum", label: "impressum" },
    { href: "/legal/datenschutz", label: "datenschutz" },
    { href: "/legal/agb", label: "agb" },
    { href: "/legal/widerruf", label: "widerruf" },
    { href: "/dummy", label: "dummy" },
  ].map(({ href, label }) =>
    label === "home" ? { href, label: "home" } : { href, label },
  );
}

/** Технические — сервисные экраны и переходы. */
const TECH_PAGES: { href: string; key: string }[] = [
  { href: "/left", key: "left" },
  { href: "/auth-telegram", key: "authTelegram" },
  { href: "/admin", key: "admin" },
  { href: "/status/403", key: "status403" },
  { href: "/status/410", key: "status410" },
  { href: "/status/429", key: "status429" },
  { href: "/status/503", key: "status503" },
];

/** Неизвестно — шаблонные ultra-страницы (демо дизайна Ultra Proxy). */
const UNKNOWN_PAGES: { href: string; key: string }[] = [
  { href: "/ultra-home", key: "ultraHome" },
  { href: "/features", key: "ultraFeatures" },
  { href: "/compare", key: "ultraCompare" },
  { href: "/stats", key: "ultraStats" },
  { href: "/prev", key: "ultraPrev" },
  { href: "/privacy", key: "ultraPrivacy" },
  { href: "/terms", key: "ultraTerms" },
  { href: "/refund", key: "ultraRefund" },
  { href: "/cookies", key: "ultraCookies" },
  { href: "/dashboard", key: "ultraDashboard" },
];

export async function SitePagesList({ lang }: { lang: string }) {
  const t = await getTranslations("pagesList");

  const siteRows: PageRow[] = sitePages(lang).map(({ href, label }) => ({
    href,
    // offers уже приходят готовыми названиями (label содержит " (path)")
    label: label.includes(" (") ? label : t(label),
  }));

  const renderRow = ({ href, label }: PageRow) => (
    <li key={href}>
      {/* открывается в новой вкладке (владелец 21.11) */}
      <Link
        href={href}
        locale={lang}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex w-full items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <span className="min-w-0 truncate">{label}</span>
        <span className="flex shrink-0 items-center gap-2">
          <code className="hidden text-[11px] text-muted-foreground/70 sm:inline">
            {href}
          </code>
          <ExternalLinkIcon className="size-3.5 text-muted-foreground/70 transition-colors group-hover:text-primary" />
        </span>
      </Link>
    </li>
  );

  const categories: { title: string; rows: PageRow[] }[] = [
    { title: t("catSite"), rows: siteRows },
    {
      title: t("catTech"),
      rows: TECH_PAGES.map(({ href, key }) => ({ href, label: t(key) })),
    },
    {
      title: t("catUnknown"),
      rows: UNKNOWN_PAGES.map(({ href, key }) => ({ href, label: t(key) })),
    },
  ];

  return (
    <section className="border-t bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <h2 className="text-xl font-bold tracking-tight">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

        {categories.map(({ title, rows }) => (
          <div key={title} className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map(renderRow)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
