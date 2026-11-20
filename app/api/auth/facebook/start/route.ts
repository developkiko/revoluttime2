import * as crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Redirects to the Facebook OAuth dialog (code flow). Requires
 * FACEBOOK_APP_ID; redirect URI registered in the Facebook app settings:
 * <origin>/api/auth/facebook/callback
 *
 * ?link=1 links the provider onto the CURRENT session (cabinet "привязать")
 * instead of replacing it — the callback reads the rt_oauth_link cookie.
 */
export async function GET(request: Request) {
  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    return NextResponse.redirect(new URL("/?login=unconfigured", request.url));
  }

  const url = new URL(request.url);
  const origin = url.origin;
  const linkMode = url.searchParams.get("link") === "1";
  const state = crypto.randomBytes(16).toString("hex");

  const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", `${origin}/api/auth/facebook/callback`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "email,public_profile");
  authUrl.searchParams.set("state", state);

  const store = await cookies();
  const response = new NextResponse(null, {
    status: 302,
    headers: { Location: authUrl.toString() },
  });
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
