import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth-session";

/**
 * DEMO-ONLY admin sign-in for the mock auth stage: used by the /dummy
 * sandbox button so the /admin panel can be reviewed before the real
 * accounts API exists. Disable by setting AUTH_DEMO_MODE=false.
 */
export async function POST() {
  if (process.env.AUTH_DEMO_MODE === "false") {
    return NextResponse.json({ error: "demo_disabled" }, { status: 403 });
  }

  const ok = await setSessionCookie({
    email: "admin@revoluttime.de",
    name: "RevolutTIME Admin",
    provider: "telegram",
    isAdmin: true,
  });
  if (!ok) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
