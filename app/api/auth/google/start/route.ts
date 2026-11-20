import * as crypto from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Redirects to Google's OAuth consent screen (code flow, openid scopes).
 * Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID and the redirect URI registered in
 * the Google Cloud console: <origin>/api/auth/google/callback
 *
 * ?link=1 links the provider onto the CURRENT session (cabinet "привязать")
 * instead of replacing it — the callback reads the rt_oauth_link cookie.
 */
export async function GET(request: Request) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/?login=unconfigured", request.url));
  }

  const url = new URL(request.url);
  const origin = url.origin;
  const linkMode = url.searchParams.get("link") === "1";
  const state = crypto.randomBytes(16).toString("hex");

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", `${origin}/api/auth/google/callback`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const response = new NextResponse(null, { status: 302, headers: { Location: authUrl.toString() } });
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };
  response.cookies.set("rt_oauth_state", state, cookieOptions);
  if (linkMode) response.cookies.set("rt_oauth_link", "1", cookieOptions);
  else response.cookies.set("rt_oauth_link", "", { path: "/", maxAge: 0 });
  return response;
}
