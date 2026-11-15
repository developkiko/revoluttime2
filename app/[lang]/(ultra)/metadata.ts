// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — Динамические OG/SEO мета-теги по языку
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
      "Ultra Proxy — Fast & Reliable Proxies | Residential, Mobile & Datacenter",
    description:
      "Elite residential, mobile and datacenter proxies. 120M+ IPs across 200+ countries. Instant activation, 99.9% uptime, crypto payments.",
    ogTitle: "Ultra Proxy — Fast & Reliable Proxies",
    ogDescription:
      "Elite residential, mobile and datacenter proxies. 120M+ IPs across 200+ countries.",
    lang: "en",
  },
  ru: {
    title:
      "Ultra Proxy — Быстрые и надёжные прокси | Резидентные, мобильные, серверные",
    description:
      "Элитные резидентные, мобильные и серверные прокси. 120 млн+ IP в 200+ странах. Мгновенная активация, аптайм 99.9%, оплата криптой.",
    ogTitle: "Ultra Proxy — Быстрые и надёжные прокси",
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
    manifest: "/ultra/manifest.webmanifest",
    applicationName: "Ultra Proxy",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Ultra Proxy",
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
      siteName: "Ultra Proxy",
      locale: t.lang,
      title: t.ogTitle,
      description: t.ogDescription,
      url: baseUrl,
      images: [
        {
          url: `${baseUrl}/ultra/prew-app.jpg`,
          width: 769,
          height: 1920,
          alt: "Ultra Proxy",
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
