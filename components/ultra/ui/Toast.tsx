"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — Toast: замена salert()
// ══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";

type ToastType = "success" | "error" | "notice" | "warning";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const colors: Record<ToastType, string> = {
    success: "border-green-500/40 bg-green-500/10 text-green-400",
    error: "border-red-500/40 bg-red-500/10 text-red-400",
    notice: "border-blue-500/40 bg-blue-500/10 text-blue-400",
    warning: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-0 left-0 right-0 z-[9998] pointer-events-none flex flex-col items-center pt-4 gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl border max-w-lg shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-top-2 ${colors[t.type]}`}
          >
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="opacity-60 hover:opacity-100 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes slide-in-from-top-2 {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-in { animation: slide-in-from-top-2 0.3s ease-out; }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
