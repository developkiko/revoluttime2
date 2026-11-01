import { getTranslations } from "next-intl/server";
import { MapPinIcon, PhoneIcon, TruckIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { CurrentYear } from "@/components/layout/CurrentYear";
import { Logo } from "@/components/layout/Logo";
import { SITE } from "@/lib/products";

const DIRECTION_LINKS = [
  { href: "/hydrogen", key: "hydrogen" },
  { href: "/sport", key: "sport" },
  { href: "/recreation", key: "recreation" },
  { href: "/tourism", key: "tourism" },
  { href: "/partner", key: "partner" },
] as const;

const LEGAL_LINKS = [
  { href: "/legal/impressum", key: "impressum" },
  { href: "/legal/datenschutz", key: "datenschutz" },
  { href: "/legal/agb", key: "agb" },
  { href: "/legal/widerruf", key: "widerruf" },
] as const;

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer id="contact" className="scroll-mt-16 border-t bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Link href="/" aria-label="RevolutTIME" className="w-fit">
            <Logo size={26} float />
          </Link>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("about")}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">{t("directionsTitle")}</h2>
          <nav className="flex flex-col items-start gap-2 text-sm">
            {DIRECTION_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {t(`directions.${link.key}`)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">{t("contactsTitle")}</h2>
          <address className="flex flex-col gap-2 text-sm not-italic text-muted-foreground">
            <span className="font-medium text-foreground">{t("company")}</span>
            <span className="flex items-start gap-1.5">
              <MapPinIcon className="mt-0.5 size-3.5 shrink-0" />
              {t("address")}
            </span>
            <a
              href={SITE.phoneHref}
              className="flex items-start gap-1.5 underline-offset-4 hover:text-foreground hover:underline"
            >
              <PhoneIcon className="mt-0.5 size-3.5 shrink-0" />
              {t("phone")}
            </a>
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
