import { NextRequest, NextResponse } from "next/server";
import { broadcastMessage, formatRegistrationMessage } from "@/lib/ultra/telegram";
import { kvGet, kvGetJson, kvPut } from "@/lib/ultra/kv";
import { createDbUser } from "@/lib/ultra/db-data";
import { dualWrite } from "@/lib/ultra/storage-mode";
import { corsHeaders } from "@/lib/ultra/cors";
import { SESSION_COOKIE, SESSION_TTL, createSession } from "@/lib/ultra/session";

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
    else if (password.length < 8)
      errors.push({ field: "password", message: "Password must be at least 8 characters" });
    if (errors.length) {
      return NextResponse.json({ success: false, errors }, { status: 422, headers: corsHeaders(request) });
    }

    if (await kvGet("user:" + email)) {
      return NextResponse.json(
        { success: false, errors: [{ field: "email", message: "Email already registered" }] },
        { status: 409, headers: corsHeaders(request) }
      );
    }

    const login = email.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 24) || "user";
    const user = {
      email,
      login,
      password,
      wallet_attached: false,
      payment_status: "none",
      error_state: false,
      created_at: new Date().toISOString(),
      ip: request.headers.get("x-forwarded-for") || "",
      ua: { raw: request.headers.get("user-agent") || "" },
      referer: request.headers.get("referer") || "",
    };

    await dualWrite(
      `user:${email}`,
      async () => {
        await kvPut("user:" + email, JSON.stringify(user));
        const list = await kvGetJson<string[]>("users_list", []);
        if (!list.includes(email)) {
          list.push(email);
          await kvPut("users_list", JSON.stringify(list));
        }
      },
      () => createDbUser({
        email,
        id: crypto.randomUUID(),
        password,
        login,
        created_at: user.created_at,
        ip: user.ip,
        ua: user.ua,
        referer: user.referer,
      })
    );

    try {
      const adminIds = await kvGetJson<string[]>("admin_chat_ids", []);
      if (adminIds.length > 0) {
        const msg = formatRegistrationMessage({ email, login });
        await broadcastMessage(adminIds, msg);
      }
    } catch (e) {
      console.error("[register] notification failed:", e);
    }

    // Авто-логин: серверная сессия сразу после регистрации
    const session = await createSession(email, login);
    const res = NextResponse.json(
      { success: true, login, user: { email, login } },
      { headers: corsHeaders(request) }
    );
    res.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL,
    });
    return res;
  } catch (e: any) {
    console.error("[register]", e);
    return NextResponse.json(
      { success: false, errors: [{ field: "server", message: e?.message || "Server error" }] },
      { status: 500, headers: corsHeaders(request) }
    );
  }
}
