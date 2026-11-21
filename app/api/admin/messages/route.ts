import { NextResponse } from "next/server";
import { getSessionUser, isAdminEmail } from "@/lib/auth-session";
import { getInbox } from "@/lib/contact-inbox";

export async function GET() {
  const user = await getSessionUser();
  // Cookie-флаг или env-список (сессии могли быть созданы до добавления
  // email в ADMIN_EMAILS) — владелец 21.11.
  if (!user || !(user.isAdmin === true || isAdminEmail(user.email))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ messages: getInbox() });
}
