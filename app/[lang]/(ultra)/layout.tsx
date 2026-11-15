import type { ReactNode } from "react";

import CustomCursor from "@/components/ultra/ui/CustomCursor";
import LanguageModal from "@/components/ultra/ui/LanguageModal";
import PwaRegistration from "@/components/ultra/PwaRegistration";
import type { Lang } from "@/lib/ultra/i18n";
import { Providers } from "./providers";
import { generateMetadata } from "./metadata";

import "./ultra.css";

export { generateMetadata };

/** URL locale → template dictionary (de has no Ultra translation, falls back to en). */
const ULTRA_LANG: Record<string, Lang> = { de: "en", ru: "ru", en: "en" };

/**
 * Ultra Proxy template chrome: its own providers (i18n/auth/modal/toast),
 * custom cursor, language modal, PWA. All styles are scoped under .ultra-root
 * so the template never repaints RevolutTIME pages.
 */
export default async function UltraLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const initialLang = ULTRA_LANG[lang] ?? "en";

  return (
    <Providers initialLang={initialLang}>
      <CustomCursor />
      <LanguageModal />
      <PwaRegistration />
      <div className="ultra-root">{children}</div>
    </Providers>
  );
}
