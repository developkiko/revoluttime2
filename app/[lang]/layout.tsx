import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist_Mono, Inter } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

import "../globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/layout/ThemeToggle";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: LayoutProps<"/[lang]">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    manifest: "/manifest.webmanifest",
    // OG/соцсети (Фаза G): брендированная карточка с атомом
    // (scripts/generate-og-image.mjs). Домен в need-connect — база от env.
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://revoluttime.de"
    ),
    openGraph: {
      type: "website",
      siteName: "RevolutTIME",
      title: t("title"),
      description: t("description"),
      images: [
        {
          url: "/imgs/brand/og.png",
          width: 1200,
          height: 630,
          alt: "RevolutTIME — molecular hydrogen",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/imgs/brand/og.png"],
    },
    icons: {
      icon: [
        { url: "/imgs/icons/favicon.svg", type: "image/svg+xml" },
        { url: "/imgs/icons/favicon.png", type: "image/png" },
      ],
      apple: "/imgs/icons/apple-icon.png",
    },
  };
}

/**
 * Root [lang] layout: only html/body, fonts, intl + theme providers.
 * Site chrome lives in (site)/layout.tsx, the imported Ultra Proxy
 * template gets its own chrome in (ultra)/layout.tsx.
 */
export default async function LangLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }
  setRequestLocale(lang);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={cn(
        "h-full antialiased font-sans",
        inter.variable,
        geistMono.variable
      )}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
