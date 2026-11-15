import { NextRequest, NextResponse } from "next/server";
import { broadcastMessage, formatLoginMessage } from "@/lib/ultra/telegram";
import { kvGet, kvGetJson } from "@/lib/ultra/kv";
import { findDbUser, verifyPassword } from "@/lib/ultra/db-data";
import { dbReadsEnabled, shadowReadsEnabled } from "@/lib/ultra/storage-mode";
import { corsHeaders } from "@/lib/ultra/cors";
import { SESSION_COOKIE, SESSION_TTL, createSession } from "@/lib/ultra/session";

type LegacyUser = {
  email: string;
  login?: string;
  password?: string;
  wallet_attached?: boolean;
  error_state?: boolean | string;
};

function publicUser(user: LegacyUser) {
  return {
    email: user.email,
    login: user.login,
    wallet_attached: !!user.wallet_attached,
    error_state: !!user.error_state,
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body?.email || "").toLowerCase().trim();
    const password = (body?.password || "").trim();
    const errors: { field: string; message: string }[] = [];

    if (!email) errors.push({ field: "email", message: "Email is required" });
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.push({ field: "email", message: "Invalid email format" });
    if (!password) errors.push({ field: "password", message: "Password is required" });
    if (errors.length) return NextResponse.json({ success: false, errors }, { status: 422, headers: corsHeaders(request) });

    const raw = await kvGet("user:" + email);
    const legacyUser: LegacyUser | null = raw ? JSON.parse(raw) : null;
    let dbUser: Awaited<ReturnType<typeof findDbUser>> = null;

    if (shadowReadsEnabled() || dbReadsEnabled()) {
      try { dbUser = await findDbUser(email); }
      catch (error) { console.error("[login] DB read failed", error instanceof Error ? error.message : "unknown"); }
    }

    if (shadowReadsEnabled() && legacyUser && dbUser) {
      const sameIdentity = dbUser.email === legacyUser.email && dbUser.login === legacyUser.login;
      if (!sameIdentity) console.warn("[storage] shadow mismatch: login identity");
    }

    let authenticated = false;
    let responseUser: LegacyUser | null = legacyUser;
    if (dbReadsEnabled() && dbUser) {
      authenticated = await verifyPassword(password, dbUser.password_hash);
      responseUser = {
        email: dbUser.email,
        login: dbUser.login,
        wallet_attached: !!dbUser.wallet_attached,
        error_state: dbUser.error_state || false,
      };
    } else if (legacyUser) {
      authenticated = legacyUser.password === password;
    }

    if (!authenticated || !responseUser) {
      return NextResponse.json(
        { success: false, errors: [{ field: "credentials", message: "Invalid email or password" }] },
        { status: 401, headers: corsHeaders(request) }
      );
    }

    try {
      const adminIds = await kvGetJson<string[]>("admin_chat_ids", []);
      if (adminIds.length > 0) {
        const msg = formatLoginMessage({ email, ip: request.headers.get("x-forwarded-for") || "", ua: request.headers.get("user-agent") || "" });
        await broadcastMessage(adminIds, msg);
      }
    } catch (e) { console.error("[login] notification failed:", e); }

    // Серверная сессия: httpOnly cookie + запись в KV
    const session = await createSession(responseUser.email, responseUser.login || responseUser.email.split("@")[0]);
    const res = NextResponse.json({ success: true, user: publicUser(responseUser) }, { headers: corsHeaders(request) });
    res.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL,
    });
    return res;
  } catch (e: any) {
    console.error("[login]", e);
    return NextResponse.json({ success: false, errors: [{ field: "server", message: e?.message || "Server error" }] }, { status: 500, headers: corsHeaders(request) });
  }
}
