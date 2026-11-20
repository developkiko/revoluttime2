import * as React from "react";

import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawerLazy } from "@/components/cart/CartDrawerLazy";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LoginNotice } from "@/components/layout/LoginNotice";
import { NoticeProvider } from "@/components/ui/notice";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { AnalyticsGate } from "@/components/layout/AnalyticsGate";
import { RefCapture } from "@/components/layout/RefCapture";
import { SiteUltraWidgets } from "@/components/layout/SiteUltraWidgets";
import { TiltObserver } from "@/components/fx/tilt-observer";
import { SpotlightObserver } from "@/components/fx/spotlight-observer";

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
      <NoticeProvider>
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
        <CartDrawerLazy />
        {/* Ultra widgets: contact FAB, custom cursor. CookieBanner renders
            inside the fixed .rt-bottom-widgets row together with the PWA
            prompt (stacked on mobile, one row on desktop). */}
        <SiteUltraWidgets locale={lang}>
          <CookieBanner />
        </SiteUltraWidgets>
        {/* FX modules: 3D tilt + spotlight cursor (re-bind per pathname) */}
        <React.Suspense fallback={null}>
          <TiltObserver />
        </React.Suspense>
        <React.Suspense fallback={null}>
          <SpotlightObserver />
        </React.Suspense>
        {/* AnalyticsGate reads pathname -> needs a Suspense boundary for static prerenders */}
        <React.Suspense fallback={null}>
          <AnalyticsGate />
        </React.Suspense>
        <RefCapture />
        <React.Suspense fallback={null}>
          <LoginNotice />
        </React.Suspense>
      </NoticeProvider>
    </CartProvider>
  );
}
