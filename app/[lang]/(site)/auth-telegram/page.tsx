import { Suspense } from "react";

import { AuthTelegramClient } from "@/components/layout/AuthTelegramClient";

/**
 * Token landing for the Telegram deep-link sign-in (bot reply link).
 * Client component reads ?token= and exchanges it for a session, so the
 * search-param read must stay inside Suspense (cacheComponents prerender).
 */
export default function AuthTelegramPage() {
  return (
    <Suspense fallback={null}>
      <AuthTelegramClient />
    </Suspense>
  );
}
