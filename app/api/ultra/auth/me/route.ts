import { NextRequest, NextResponse } from "next/server";
import { sessionFromRequest } from "@/lib/ultra/session";


export async function GET(request: NextRequest) {
  const session = await sessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({
    user: { email: session.email, login: session.login },
  });
}
