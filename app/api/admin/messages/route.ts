import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { getInbox } from "@/lib/contact-inbox";

export async function GET() {
  const user = await getSessionUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json({ messages: getInbox() });
}
