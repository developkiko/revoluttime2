import * as crypto from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Redirects to Google's OAuth consent screen (code flow, openid scopes).
 * Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID and the redirect URI registered in
 * the Google Cloud console: <origin>/api/auth/google/callback
 */
export async function GET(request: Request) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/?login=unconfigured", request.url));
  }

  const origin = new URL(request.url).origin;
  const state = crypto.randomBytes(16).toString("hex");

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", `${origin}/api/auth/google/callback`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const response = new NextResponse(null, { status: 302, headers: { Location: authUrl.toString() } });
  response.cookies.set("rt_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
