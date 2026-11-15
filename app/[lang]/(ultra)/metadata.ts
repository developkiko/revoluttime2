// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — Динамические OG/SEO мета-теги по языку
// ══════════════════════════════════════════════════════════════

import type { Metadata, Viewport } from "next";

type Lang = "en" | "ru";

const translations: Record<
  Lang,
  {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    lang: string;
  }
> = {
  en: {
    title:
      "RevolutTIME — Molecular Hydrogen, Biohacking & Partner Program",
    description:
      "Effervescent magnesium + H₂ tablets — Eurofins-tested, made in Bavaria. Studio, equipment, recreation and a partner program for active longevity.",
    ogTitle: "RevolutTIME — Molecular Hydrogen & Biohacking",
    ogDescription:
      "Effervescent magnesium + H₂ tablets — Eurofins-tested, made in Bavaria.",
    lang: "en",
  },
  ru: {
    title:
      "RevolutTIME — Быстрые и надёжные прокси | Резидентные, мобильные, серверные",
    description:
      "Элитные резидентные, мобильные и серверные прокси. 120 млн+ IP в 200+ странах. Мгновенная активация, аптайм 99.9%, оплата криптой.",
    ogTitle: "RevolutTIME — Быстрые и надёжные прокси",
    ogDescription:
      "Элитные резидентные, мобильные и серверные прокси. 120 млн+ IP в 200+ странах.",
    lang: "ru",
  },
};

/** URL locale → template dictionary (de → en fallback). Static, no headers()
 * — runtime data in generateMetadata would block prerendering under
 * cacheComponents. */
function detectLang(rawLang?: string): Lang {
  if (rawLang === "ru") return "ru";
  return "en";
}

type UltraMetadataProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: UltraMetadataProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = detectLang(rawLang);
  const t = translations[lang];
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://revolut-time.vercel.app").replace(/\/$/, "");

  return {
    title: t.title,
    description: t.description,
    manifest: "/manifest.webmanifest",
    applicationName: "RevolutTIME",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "RevolutTIME",
    },
    icons: {
      icon: [
        { url: "/ultra/favicon.svg", type: "image/svg+xml" },
        { url: "/ultra/favicon.png", type: "image/png" },
      ],
      apple: { url: "/ultra/apple-icon.png", sizes: "180x180" },
    },
    openGraph: {
      type: "website",
      siteName: "RevolutTIME",
      locale: t.lang,
      title: t.ogTitle,
      description: t.ogDescription,
      url: baseUrl,
      images: [
        {
          url: `${baseUrl}/ultra/prew-app.jpg`,
          width: 769,
          height: 1920,
          alt: "RevolutTIME",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.ogTitle,
      description: t.ogDescription,
      images: [`${baseUrl}/ultra/prew-app.jpg`],
    },
    alternates: {
      canonical: baseUrl,
      languages: {
        "en-US": baseUrl,
        "ru-RU": `${baseUrl}/ru`,
      },
    },
  };
}

// Next 16: viewport belongs to its own export, not to Metadata.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
