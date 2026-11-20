import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { getAuthLinks } from "@/lib/auth-links";

/** Linked sign-in methods of the current account (cabinet profile section). */
export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "not_authorized" }, { status: 401 });
  }
  const row = await getAuthLinks(session.email);
  return NextResponse.json({
    anchorEmail: session.email,
    // Without the DB the session provider itself is the only known method.
    google: !!row?.google_id || session.provider === "google",
    telegram: !!row?.telegram_id || session.provider === "telegram",
    facebook: !!row?.facebook_id || session.provider === "facebook",
    loginEmail: row?.login_email ?? null,
  });
}
