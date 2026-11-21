import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getSessionUser,
  isAdminEmail,
  setSessionCookie,
  type SessionUser,
} from "@/lib/auth-session";
import { attachProvider, resolveAnchor, stampRefCode } from "@/lib/auth-links";

interface FacebookTokens {
  access_token?: string;
  error?: { message?: string };
}

interface FacebookUserInfo {
  id?: string;
  name?: string;
  email?: string;
  picture?: { data?: { url?: string } };
}

/**
 * Facebook OAuth callback: state check → code exchange → /me profile.
 * Link mode (rt_oauth_link cookie, set by /start?link=1) attaches the
 * Facebook identity to the CURRENT session anchor and returns to the
 * cabinet; otherwise a full sign-in session is issued.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/?login=${reason}`, url.origin));

  if (!appId || !appSecret) return fail("unconfigured");
  if (!code || url.searchParams.get("error")) return fail("cancelled");

  const store = await cookies();
  const expectedState = store.get("rt_oauth_state")?.value;
  if (!state || !expectedState || state !== expectedState) {
    return fail("state_mismatch");
  }

  const tokenResponse = await fetch(
    "https://graph.facebook.com/v23.0/oauth/access_token?" +
      new URLSearchParams({
        code,
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: `${url.origin}/api/auth/facebook/callback`,
      })
  );
  const tokens = (await tokenResponse.json()) as FacebookTokens;
  if (!tokenResponse.ok || !tokens.access_token) return fail("token_error");

  const meResponse = await fetch(
    "https://graph.facebook.com/v23.0/me?fields=id,name,email,picture.type(large)&access_token=" +
      encodeURIComponent(tokens.access_token)
  );
  const me = (await meResponse.json()) as FacebookUserInfo;
  if (!meResponse.ok || !me.id) return fail("userinfo_error");

  // Facebook accounts may not expose an email — synthesize a stable one.
  const providerId = me.id;
  const providerEmail = me.email ?? `${me.id}@facebook.revoluttime`;
  const picture = me.picture?.data?.url;
  const name = me.name ?? providerEmail.split("@")[0];

  const linkCookie = store.get("rt_oauth_link")?.value === "1";
  store.set("rt_oauth_state", "", { path: "/", maxAge: 0 });
  store.set("rt_oauth_link", "", { path: "/", maxAge: 0 });

  if (linkCookie) {
    const session = await getSessionUser();
    if (session) {
      await attachProvider(session.email, "facebook", providerId);
      return NextResponse.redirect(
        new URL("/cabinet#profile", url.origin)
      );
    }
    // No session to link onto — fall through to a regular sign-in.
  }

  const anchor = await resolveAnchor("facebook", providerId, providerEmail);
  await attachProvider(anchor, "facebook", providerId);
  await stampRefCode(anchor);

  const user: SessionUser = {
    email: anchor,
    name,
    provider: "facebook",
    picture,
    isAdmin: isAdminEmail(anchor),
  };
  const ok = await setSessionCookie(user);
  if (!ok) return fail("unconfigured");
  return NextResponse.redirect(new URL("/?login=facebook", url.origin));
}
