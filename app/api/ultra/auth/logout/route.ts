import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, deleteSession, readSessionToken } from "@/lib/ultra/session";


export async function POST(request: NextRequest) {
  await deleteSession(readSessionToken(request));
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
