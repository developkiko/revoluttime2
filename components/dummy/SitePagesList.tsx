import { getTranslations } from "next-intl/server";
import { ExternalLinkIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";

/** Все страницы сайта (владелец 21.11): блок внизу /dummy, каждая —
 *  в новой вкладке. */
const PAGES: { href: string; key: string }[] = [
  { href: "/", key: "home" },
  { href: "/shop", key: "shop" },
  { href: "/hydrogen", key: "hydrogen" },
  { href: "/hydrogen/tablets", key: "hydrogenTablets" },
  { href: "/studio", key: "studio" },
  { href: "/equipment", key: "equipment" },
  { href: "/recreation", key: "recreation" },
  { href: "/partner", key: "partner" },
  { href: "/journey", key: "journey" },
  { href: "/cabinet", key: "cabinet" },
  { href: "/encyclopedia", key: "encyclopedia" },
  { href: "/certificates", key: "certificates" },
  { href: "/contact", key: "contact" },
  { href: "/checkout", key: "checkout" },
  { href: "/legal/impressum", key: "impressum" },
  { href: "/legal/datenschutz", key: "datenschutz" },
  { href: "/legal/agb", key: "agb" },
  { href: "/legal/widerruf", key: "widerruf" },
  { href: "/status", key: "status" },
  { href: "/admin", key: "admin" },
  { href: "/dummy", key: "dummy" },
];

export async function SitePagesList({ lang }: { lang: string }) {
  const t = await getTranslations("pagesList");

  return (
    <section className="border-t bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <h2 className="text-xl font-bold tracking-tight">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

        <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PAGES.map(({ href, key }) => (
            <li key={href}>
              {/* открывается в новой вкладке (владелец 21.11) */}
              <Link
                href={href}
                locale={lang}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-full items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <span className="min-w-0 truncate">{t(key)}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <code className="hidden text-[11px] text-muted-foreground/70 sm:inline">
                    {href}
                  </code>
                  <ExternalLinkIcon className="size-3.5 text-muted-foreground/70 transition-colors group-hover:text-primary" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
