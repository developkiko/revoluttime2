// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — API route: /api/contact
// Приём формы контактов → прокси на Cloudflare Worker для отправки в TG
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { kvGetJson } from "@/lib/ultra/kv";
import { dbReadsEnabled } from "@/lib/ultra/storage-mode";
import { getDbSiteConfig } from "@/lib/ultra/db-data";

const ADMIN_API = process.env.ADMIN_API_URL || "https://admin.ultra-proxy.pro";
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || "";

/** Same logic as /api/ultra/site-config, called in-process (no self-HTTP). */
async function isCaptchaRequired(): Promise<boolean> {
  try {
    let cfg: Record<string, unknown> | null = null;
    if (dbReadsEnabled()) {
      cfg = await getDbSiteConfig();
    }
    if (!cfg) {
      cfg = await kvGetJson<Record<string, unknown>>("site_config", {});
    }
    const captcha = (cfg?.captcha ?? {}) as {
      enabled?: boolean;
      forms?: { contact?: boolean };
    };
    if (captcha.enabled === false) return false;
    if (captcha.forms?.contact === false) return false;
    return true;
  } catch {
    return true;
  }
}

async function verifyTurnstile(token: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true;
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${encodeURIComponent(TURNSTILE_SECRET)}&response=${encodeURIComponent(token)}`,
  });
  const data = await res.json();
  return data.success === true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, turnstile_token } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Имя обязательно" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Сообщение обязательно" }, { status: 400 });
    }

    const needCaptcha = await isCaptchaRequired();
    if (needCaptcha) {
      const captchaOk = await verifyTurnstile(turnstile_token || "");
      if (!captchaOk) {
        return NextResponse.json({ error: "Ошибка проверки captcha" }, { status: 403 });
      }
    }

    try {
      const res = await fetch(`${ADMIN_API}/api/contact/forward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      const data = await res.json();
      return NextResponse.json(data);
    } catch (err) {
      console.error("[contact] forward failed:", err);
      return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
    }
  } catch (err) {
    console.error("[contact] Error:", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
