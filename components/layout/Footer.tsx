"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  DumbbellIcon,
  FileTextIcon,
  MapPinIcon,
  MountainIcon,
  PhoneIcon,
  PillIcon,
  RefreshCwIcon,
  RouteIcon,
  ScaleIcon,
  ShieldIcon,
  TruckIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { CurrentYear } from "@/components/layout/CurrentYear";
import { LegalModal, type LegalSlug } from "@/components/layout/LegalModal";
import { Logo } from "@/components/layout/Logo";
import { SITE } from "@/lib/products";

/* Ultra-template footer structure: brand + link columns with inline icons;
   policy rows open the site LegalModal (spec: same modals as ultra-proxy,
   minus the removed pricing-model / SLA entries). */

const DIRECTION_LINKS = [
  { href: "/journey", key: "journey", icon: RouteIcon },
  { href: "/shop", key: "tablets", icon: PillIcon },
  { href: "/studio", key: "studio", icon: DumbbellIcon },
  { href: "/equipment", key: "equipment", icon: WrenchIcon },
  { href: "/recreation", key: "recreation", icon: MountainIcon },
  { href: "/partner", key: "partner", icon: UsersIcon },
] as const;

const LEGAL_LINKS = [
  { slug: "impressum", icon: FileTextIcon },
  { slug: "datenschutz", icon: ShieldIcon },
  { slug: "agb", icon: ScaleIcon },
  { slug: "widerruf", icon: RefreshCwIcon },
] as const;

const linkClass =
  "inline-flex items-center gap-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground";

export function Footer() {
  const t = useTranslations("footer");
  const tLegal = useTranslations("legal");
  const [policy, setPolicy] = useState<LegalSlug | null>(null);

  return (
    <footer id="contact" className="scroll-mt-16 border-t bg-background">
      {policy && <LegalModal slug={policy} onClose={() => setPolicy(null)} />}

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Link href="/" aria-label="RevolutTIME" className="w-fit">
            <Logo size={26} float />
          </Link>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("about")}
          </p>
        </div>

        {/* Directions — plain links with icons (ultra footer "info" column) */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("directionsTitle")}
          </h2>
          <nav className="flex flex-col items-start gap-1 text-sm">
            {DIRECTION_LINKS.map(({ href, key, icon: Icon }) => (
              <Link key={key} href={href} className={linkClass}>
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {t(`directions.${key}`)}
              </Link>
            ))}
          </nav>
        </div>

        {/* Policies — buttons opening the legal modal (ultra footer pattern) */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("legalTitle")}
          </h2>
          <nav className="flex flex-col items-start gap-1 text-sm">
            {LEGAL_LINKS.map(({ slug, icon: Icon }) => (
              <button
                key={slug}
                type="button"
                onClick={() => setPolicy(slug)}
                className={`${linkClass} w-full cursor-pointer border-none bg-transparent text-left`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {tLegal(`${slug}.title`)}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("contactsTitle")}
          </h2>
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
