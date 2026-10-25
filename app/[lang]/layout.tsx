import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist_Mono, Inter } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

import "../globals.css";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";

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
  };
}

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
      className={cn(
        "h-full antialiased font-sans",
        inter.variable,
        geistMono.variable
      )}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <CartProvider>
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
            <CartDrawer />
            <Toaster position="bottom-right" />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
