import { getTranslations } from "next-intl/server";
import { DropletsIcon, MapPinIcon, TruckIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { CurrentYear } from "@/components/layout/CurrentYear";

const LEGAL_LINKS = [
  { href: "/legal/impressum", key: "impressum" },
  { href: "/legal/datenschutz", key: "datenschutz" },
  { href: "/legal/agb", key: "agb" },
  { href: "/legal/widerruf", key: "widerruf" },
] as const;

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer id="contact" className="border-t bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 text-base font-bold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <DropletsIcon className="size-4" />
            </span>
            Revolut<span className="text-primary">TIME</span>
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("about")}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">{t("contactsTitle")}</h2>
          <address className="flex flex-col gap-2 text-sm not-italic text-muted-foreground">
            <span className="font-medium text-foreground">{t("company")}</span>
            <span className="flex items-start gap-1.5">
              <MapPinIcon className="mt-0.5 size-3.5 shrink-0" />
              {t("address")}
            </span>
            <span className="flex items-start gap-1.5">
              <TruckIcon className="mt-0.5 size-3.5 shrink-0" />
              {t("shipping")}
            </span>
          </address>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">{t("legalTitle")}</h2>
          <nav className="flex flex-col items-start gap-2 text-sm">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {t(`legal.${link.key}`)}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("disclaimer")}
          </p>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              © <CurrentYear /> RevolutTIME. {t("rightsSuffix")}
            </span>
            <span>{t("brandOwner")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
