"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — Главная страница (лендинг)
// ══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { Header } from "@/components/ultra/layout/Header";
import { Footer } from "@/components/ultra/layout/Footer";
import { SupportFAB } from "@/components/ultra/dashboard/SupportFAB";
import { HeroSection } from "@/components/ultra/home/HeroSection";
import { PlansGrid } from "@/components/ultra/home/PlansGrid";
import { FeaturesSection } from "@/components/ultra/home/FeaturesSection";
import { LocationsSection } from "@/components/ultra/home/LocationsSection";
import { TrustCounters } from "@/components/ultra/home/TrustCounters";
import { ReviewsSection } from "@/components/ultra/home/ReviewsSection";
import { ContactForm } from "@/components/ultra/home/ContactForm";
import { AuthModalContent } from "@/components/ultra/auth/AuthModal";
import { useModalEngine } from "@/components/ultra/ui/ModalEngine";
import { useTrackVisit } from "@/lib/ultra/use-track-visit";

export default function HomePage() {
  const { openModal } = useModalEngine();

  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail?.tab as "login" | "register" | undefined;
      openModal(<AuthModalContent initialTab={tab ?? "register"} />);
    };
    window.addEventListener("open-auth", handler);
    return () => window.removeEventListener("open-auth", handler);
  }, [openModal]);

  useTrackVisit("/");

  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <PlansGrid onOpenAuth={() => openModal(<AuthModalContent />)} />
        <FeaturesSection />
        <LocationsSection />
        <TrustCounters />
        <ReviewsSection />
        <ContactForm />
      </main>
      <Footer />
      <SupportFAB />
    </>
  );
}
