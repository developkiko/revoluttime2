"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — Social auth buttons (порт на RevolutTIME)
// Порядок: Google → Telegram → Facebook (заглушка) → «или» →
// email-форма рендерится под ними (в самом конце, приглушённая).
// ══════════════════════════════════════════════════════════════

import TelegramLoginButton from "./TelegramLoginButton";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

const socialBtnClass =
  "w-full py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] " +
  "hover:bg-[var(--hover-bg)] text-[var(--text-primary)] text-sm font-medium " +
  "inline-flex items-center justify-center gap-2.5 transition-colors";

function GoogleIcon() {
  // Multicolor Google "G" per brand guidelines.
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.86c2.26-2.09 3.58-5.17 3.58-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29v-3.1H1.29a12 12 0 0 0 0 10.78l3.98-3.1C6.22 6.86 8.87 4.75 12 4.75Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.61l3.98 3.1C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1877F2" aria-hidden>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}

export function SocialAuthButtons({ telegramEnabled = true }: { telegramEnabled?: boolean }) {
  const googleEnabled = Boolean(GOOGLE_CLIENT_ID);

  return (
    <div className="flex flex-col gap-2">
      {googleEnabled && (
        <button
          type="button"
          className={socialBtnClass}
          onClick={() => {
            // Our API route 302-redirects to Google, then back with ?login=…
            window.location.assign("/api/auth/google/start");
          }}
        >
          <GoogleIcon />
          Google
        </button>
      )}

      {telegramEnabled && <TelegramLoginButton enabled={telegramEnabled} />}

      {/* Facebook: placeholder for a future OAuth flow — intentionally inert. */}
      <button type="button" className={socialBtnClass} title="Coming soon" aria-disabled="true">
        <FacebookIcon />
        Facebook
      </button>
    </div>
  );
}

/** Thin «или» divider between social buttons and the (muted) email form. */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 my-3 text-xs text-[var(--text-muted)]">
      <span className="h-px flex-1 bg-[var(--border-default)]" />
      <span>или</span>
      <span className="h-px flex-1 bg-[var(--border-default)]" />
    </div>
  );
}

/** Muted disclosure button for the email form — nearly blends with the background. */
export function EmailDisclosureButton({ label, open, onClick }: { label: string; open: boolean; onClick: () => void }) {
  if (open) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-1.5 mt-1 text-center text-[13px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:underline underline-offset-2 transition-colors"
    >
      {label}
    </button>
  );
}
