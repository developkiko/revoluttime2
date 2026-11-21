import { NextResponse } from "next/server";
import { getSessionUser, isAdminEmail } from "@/lib/auth-session";

export async function GET() {
  const user = await getSessionUser();
  if (user) {
    // Cookie-флаг может отставать (сессии до добавления в ADMIN_EMAILS) —
    // решение по env на каждый запрос (владелец 21.11: karakymg@gmail.com
    // — главный админ).
    user.isAdmin = user.isAdmin === true || isAdminEmail(user.email);
  }
  return NextResponse.json({ user });
}
