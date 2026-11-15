import * as React from "react";

import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawerLazy } from "@/components/cart/CartDrawerLazy";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LoginNotice } from "@/components/layout/LoginNotice";
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { AnalyticsGate } from "@/components/layout/AnalyticsGate";
import { RefCapture } from "@/components/layout/RefCapture";
import { SiteUltraWidgets } from "@/components/layout/SiteUltraWidgets";

/** RevolutTIME site chrome: header/footer/cart — Ultra pages (ultra)/ carry their own. */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <CartProvider>
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
      <CartDrawerLazy />
      {/* Ultra widgets: contact FAB, PWA prompt, custom cursor */}
      <SiteUltraWidgets locale={lang} />
      {/* Queue behavior: one visible toast at a time. */}
      <Toaster position="bottom-right" visibleToasts={1} />
      <CookieBanner />
      {/* AnalyticsGate reads pathname -> needs a Suspense boundary for static prerenders */}
      <React.Suspense fallback={null}>
        <AnalyticsGate />
      </React.Suspense>
      <RefCapture />
      <React.Suspense fallback={null}>
        <LoginNotice />
      </React.Suspense>
    </CartProvider>
  );
}
