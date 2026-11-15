"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — Modal Engine
// Единая openModal() с поддержкой overlay
// ══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface ModalEngineContext {
  /** Открыть модалку. overlay=false (по умолчанию) — заменяет текущую. overlay=true — поверх текущей */
  openModal: (content: ReactNode, opts?: { overlay?: boolean }) => void;
  /** Закрыть верхнюю модалку (overlay если есть, иначе base) */
  closeModal: () => void;
  /** Закрыть все модалки */
  closeAll: () => void;
}

const ModalEngineContext = createContext<ModalEngineContext>({
  openModal: () => {},
  closeModal: () => {},
  closeAll: () => {},
});

export function ModalEngineProvider({ children }: { children: ReactNode }) {
  const [baseContent, setBaseContent] = useState<ReactNode>(null);
  const [overlayContent, setOverlayContent] = useState<ReactNode>(null);
  const isOpen = baseContent !== null;

  const openModal = useCallback((content: ReactNode, opts?: { overlay?: boolean }) => {
    if (opts?.overlay) {
      setOverlayContent(content);
    } else {
      setBaseContent(content);
      setOverlayContent(null);
    }
  }, []);

  const closeModal = useCallback(() => {
    if (overlayContent !== null) {
      setOverlayContent(null);
    } else {
      setBaseContent(null);
    }
  }, [overlayContent]);

  const closeAll = useCallback(() => {
    setBaseContent(null);
    setOverlayContent(null);
  }, []);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, closeModal]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <ModalEngineContext.Provider value={{ openModal, closeModal, closeAll }}>
      {children}
      {/* Base modal — всегда в DOM, меняется только children */}
      <div
        className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        style={{ display: isOpen ? "flex" : "none" }}
        onClick={(e) => {
          if (!overlayContent && e.target === e.currentTarget) closeModal();
        }}
      >
        {baseContent}
      </div>
      {/* Overlay modal — всегда в DOM, меняется только children */}
      <div
        className="fixed inset-0 z-[2010] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        style={{ display: overlayContent !== null ? "flex" : "none" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        {overlayContent}
      </div>
    </ModalEngineContext.Provider>
  );
}

export function useModalEngine() {
  return useContext(ModalEngineContext);
}
