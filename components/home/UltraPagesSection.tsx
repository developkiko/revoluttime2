import { getTranslations } from "next-intl/server";
import { ExternalLinkIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/**
 * Links to every ported Ultra Proxy template page. The template keeps its own
 * design/chrome under (ultra) — these buttons open the pages in new windows
 * (owner request) so the demo never navigates away from the main site.
 */
const ULTRA_PAGES = [
  { href: "/ultra-home", label: "Ultra Proxy — Home" },
  { href: "/features", label: "Features" },
  { href: "/compare", label: "Compare" },
  { href: "/stats", label: "Stats" },
  { href: "/prev", label: "Prev" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund", label: "Refund" },
  { href: "/cookies", label: "Cookies" },
] as const;

export async function UltraPagesSection() {
  const t = await getTranslations("ultraPages");

  return (
    <section className="border-t bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">{t("subtitle")}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {ULTRA_PAGES.map(({ href, label }) => (
            <Button key={href} variant="outline" size="sm" asChild>
              <Link href={href} target="_blank" rel="noopener noreferrer">
                {label}
                <ExternalLinkIcon data-icon="inline-end" />
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
