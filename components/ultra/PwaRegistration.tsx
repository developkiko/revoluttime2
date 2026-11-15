"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Copy = {
  title: string;
  iosTitle: string;
  description: string;
  iosDescription: string;
  androidDescription: string;
  install: string;
  installHelp: string;
  later: string;
  share: string;
  add: string;
};

const copy: Record<"ru" | "en", Copy> = {
  ru: {
    title: "Установить RevolutTIME",
    iosTitle: "Добавить RevolutTIME на экран",
    description: "Установите приложение для быстрого доступа к кабинету и наборам.",
    iosDescription: "Откройте меню браузера и добавьте RevolutTIME на экран «Домой». ",
    androidDescription: "В меню браузера выберите «Добавить на главный экран».",
    install: "Установить",
    installHelp: "Как установить",
    later: "Позже",
    share: "Поделиться",
    add: "На экран «Домой»",
  },
  en: {
    title: "Install RevolutTIME",
    iosTitle: "Add RevolutTIME to Home Screen",
    description: "Install the app for quick access to your dashboard and packs.",
    iosDescription: "Open your browser menu and add RevolutTIME to the Home Screen.",
    androidDescription: "Open the browser menu and choose “Add to Home screen”.",
    install: "Install",
    installHelp: "How to install",
    later: "Later",
    share: "Share",
    add: "Add to Home Screen",
  },
};

function isIosBrowser() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !("MSStream" in window);
}

function isAndroidBrowser() {
  return /android/i.test(navigator.userAgent);
}

export default function PwaRegistration() {
  const { lang } = useI18n();
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);
  const [android, setAndroid] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Scoped to /ultra/ so the template's SW never controls RevolutTIME pages.
      navigator.serviceWorker.register("/ultra/sw.js", { scope: "/ultra/" }).catch((error) => {
        console.error("RevolutTIME PWA service worker registration failed", error);
      });
    }

    if (window.matchMedia("(display-mode: standalone)").matches || sessionStorage.getItem("ultra-proxy-pwa-dismissed") === "1") return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setFallbackNotice(false);
      setShow(true);
    };
    const onAppInstalled = () => {
      setPromptEvent(null);
      setShow(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    const iosBrowser = isIosBrowser();
    const androidBrowser = isAndroidBrowser();
    setIos(iosBrowser);
    setAndroid(androidBrowser);
    const timer = iosBrowser || androidBrowser ? window.setTimeout(() => setShow(true), 1200) : undefined;

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const text = copy[lang === "ru" ? "ru" : "en"];
  const dismiss = () => {
    sessionStorage.setItem("ultra-proxy-pwa-dismissed", "1");
    setShow(false);
  };
  const install = async () => {
    if (!promptEvent) {
      setFallbackNotice(true);
      return;
    }
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      setPromptEvent(null);
      if (choice.outcome === "accepted") setShow(false);
    } catch {
      setFallbackNotice(true);
    }
  };

  if (!show) return null;
  const description = ios ? text.iosDescription : (fallbackNotice || (android && !promptEvent) ? text.androidDescription : text.description);

  return (
    <aside className="pwa-install-prompt" role="dialog" aria-live="polite" aria-label={ios ? text.iosTitle : text.title}>
      <img src="/ultra/images/pwa-icon.svg" alt="" className="pwa-install-prompt__icon" />
      <div className="pwa-install-prompt__content">
        <strong>{ios ? text.iosTitle : text.title}</strong>
        <p>{description}</p>
        {ios && <p className="pwa-install-prompt__steps"><span>{text.share}</span> <span aria-hidden>→</span> <span>{text.add}</span></p>}
      </div>
      <div className="pwa-install-prompt__actions">
        {!ios && <button type="button" className="pwa-install-prompt__install" onClick={install}>{promptEvent ? text.install : text.installHelp}</button>}
        <button type="button" className="pwa-install-prompt__later" onClick={dismiss}>{text.later}</button>
      </div>
    </aside>
  );
}
