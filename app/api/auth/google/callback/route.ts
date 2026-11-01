import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setSessionCookie, type SessionUser } from "@/lib/auth-session";

interface GoogleTokens {
  access_token?: string;
  error?: string;
}

interface GoogleUserInfo {
  email?: string;
  name?: string;
  picture?: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/?login=${reason}`, url.origin));

  if (!clientId || !clientSecret) {
    return fail("unconfigured");
  }
  if (!code || url.searchParams.get("error")) {
    return fail("cancelled");
  }

  const store = await cookies();
  const expectedState = store.get("rt_oauth_state")?.value;
  if (!state || !expectedState || state !== expectedState) {
    return fail("state_mismatch");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${url.origin}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  const tokens = (await tokenResponse.json()) as GoogleTokens;
  if (!tokenResponse.ok || !tokens.access_token) {
    return fail("token_error");
  }

  const userinfoResponse = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  );
  const userinfo = (await userinfoResponse.json()) as GoogleUserInfo;
  if (!userinfoResponse.ok || !userinfo.email) {
    return fail("userinfo_error");
  }

  const user: SessionUser = {
    email: userinfo.email,
    name: userinfo.name ?? userinfo.email.split("@")[0],
    provider: "google",
    picture: userinfo.picture,
  };
  const ok = await setSessionCookie(user);
  if (!ok) return fail("unconfigured");

  store.set("rt_oauth_state", "", { path: "/", maxAge: 0 });
  return NextResponse.redirect(new URL("/?login=google", url.origin));
}
