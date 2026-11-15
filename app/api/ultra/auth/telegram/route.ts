import { createHash, createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { broadcastMessage, formatRegistrationMessage } from "@/lib/ultra/telegram";
import { kvGetJson, kvPut } from "@/lib/ultra/kv";
import { createDbTelegramUser, findDbUserByTelegramId, getDbSiteConfig, updateDbTelegramUser } from "@/lib/ultra/db-data";
import { dbReadsEnabled, dualWrite, dualWritesEnabled } from "@/lib/ultra/storage-mode";
import { SESSION_COOKIE, SESSION_TTL, createSession } from "@/lib/ultra/session";

type TelegramAuth = {
  id: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number | string;
  hash: string;
};

function telegramToken(): string {
  // CLIENT_BOT_TOKEN is the existing RevolutTIME client-bot secret.
  // A dedicated token name remains available for future bot separation.
  return process.env.TELEGRAM_LOGIN_BOT_TOKEN || process.env.CLIENT_BOT_TOKEN || "";
}

function verifyTelegramAuth(data: TelegramAuth, token: string): boolean {
  const authDate = Number(data.auth_date);
  const age = Math.floor(Date.now() / 1000) - authDate;
  if (!data.id || !data.hash || !Number.isFinite(age) || age < -60 || age > 86400) return false;

  const signedFields: Array<keyof TelegramAuth> = ["auth_date", "first_name", "id", "last_name", "photo_url", "username"];
  const checkString = signedFields
    .map((key) => [key, data[key]] as const)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = createHash("sha256").update(token).digest();
  const expected = createHmac("sha256", secretKey).update(checkString).digest("hex");

  try {
    const actualBuffer = Buffer.from(String(data.hash), "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

function requestMeta(request: NextRequest) {
  return {
    ip: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "",
    ua: { raw: request.headers.get("user-agent") || "" },
    referer: request.headers.get("referer") || "",
  };
}

function loginName(username: string | undefined, telegramId: string): string {
  const safeUsername = username?.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);
  return `${safeUsername || "telegram_user"}_${telegramId.slice(-6)}`;
}

function telegramEmail(telegramId: string): string {
  return `telegram_${telegramId}@accounts.revoluttime.de`;
}

export async function POST(request: NextRequest) {
  try {
    let config = await kvGetJson<Record<string, unknown>>("site_config", {});
    if (dbReadsEnabled()) {
      try {
        const dbConfig = await getDbSiteConfig();
        if (dbConfig) config = { ...config, ...dbConfig };
      } catch (error) {
        console.error("[telegram-auth] site config DB read failed", error instanceof Error ? error.message : "unknown");
      }
    }
    if (config.telegram_auth_enabled === false) {
      return NextResponse.json({ success: false, error: "Telegram authorization is disabled" }, { status: 403 });
    }

    const token = telegramToken();
    if (!token) {
      console.error("[telegram-auth] client bot token is not configured");
      return NextResponse.json({ success: false, error: "Telegram authorization is not configured" }, { status: 503 });
    }

    const data = await request.json() as TelegramAuth;
    if (!verifyTelegramAuth(data, token)) {
      return NextResponse.json({ success: false, error: "Invalid Telegram authorization" }, { status: 401 });
    }

    const telegramId = String(data.id);
    const email = telegramEmail(telegramId);
    const login = loginName(data.username, telegramId);
    const meta = requestMeta(request);
    const telegramPatch = {
      telegram_id: telegramId,
      telegram_username: data.username || null,
      telegram_photo_url: data.photo_url || null,
      auth_provider: "telegram",
      ...meta,
    };

    let existingDbUser = null;
    if (dbReadsEnabled() || dualWritesEnabled()) {
      try {
        existingDbUser = await findDbUserByTelegramId(telegramId);
      } catch (error) {
        console.error("[telegram-auth] DB lookup failed", error instanceof Error ? error.message : "unknown");
      }
    }

    const existingEmail = existingDbUser?.email || email;
    const existingKvUser = await kvGetJson<Record<string, unknown> | null>(`user:${existingEmail}`, null);
    const userEmail = String(existingKvUser?.email || existingDbUser?.email || existingEmail);
    const userLogin = String(existingKvUser?.login || existingDbUser?.login || login);
    const user = {
      ...(existingKvUser || {}),
      email: userEmail,
      login: userLogin,
      wallet_attached: Boolean(existingKvUser?.wallet_attached ?? existingDbUser?.wallet_attached ?? false),
      payment_status: String(existingKvUser?.payment_status || existingDbUser?.payment_status || "none"),
      error_state: Boolean(existingKvUser?.error_state ?? existingDbUser?.error_state ?? false),
      telegram_id: telegramId,
      telegram_username: data.username || null,
      telegram_photo_url: data.photo_url || null,
      auth_provider: existingKvUser?.auth_provider || "telegram",
      updated_at: new Date().toISOString(),
      ...meta,
    };

    const wasExisting = Boolean(existingKvUser || existingDbUser);
    await dualWrite(
      `telegram-user:${telegramId}`,
      async () => {
        await kvPut(`user:${userEmail}`, JSON.stringify(user));
        const users = await kvGetJson<string[]>("users_list", []);
        if (!users.includes(userEmail)) {
          users.push(userEmail);
          await kvPut("users_list", JSON.stringify(users));
        }
      },
      async () => {
        if (wasExisting) {
          await updateDbTelegramUser(userEmail, telegramPatch);
        } else {
          await createDbTelegramUser({
            email: userEmail,
            id: crypto.randomUUID(),
            login: userLogin,
            created_at: new Date().toISOString(),
            ...telegramPatch,
          });
        }
      }
    );

    if (!wasExisting) {
      try {
        const adminIds = await kvGetJson<string[]>("admin_chat_ids", []);
        if (adminIds.length > 0) {
          await broadcastMessage(adminIds, formatRegistrationMessage({ email: userEmail, login: userLogin }));
        }
      } catch (error) {
        console.error("[telegram-auth] admin notification failed", error instanceof Error ? error.message : "unknown");
      }
    }

    // Серверная сессия: httpOnly cookie + запись в KV
    const session = await createSession(userEmail, userLogin);
    const res = NextResponse.json({
      success: true,
      user: {
        email: userEmail,
        login: userLogin,
        wallet_attached: user.wallet_attached,
        error_state: user.error_state,
      },
    });
    res.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL,
    });
    return res;
  } catch (error) {
    console.error("[telegram-auth] failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ success: false, error: "Telegram authorization failed" }, { status: 500 });
  }
}
