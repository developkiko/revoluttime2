import { NextRequest, NextResponse } from "next/server";
import { kvGetJson, kvPut } from "@/lib/ultra/kv";
import { dualWrite } from "@/lib/ultra/storage-mode";
import { sessionFromRequest } from "@/lib/ultra/session";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const date = body.date || new Date().toISOString().slice(0, 10);
    const ip =
      body.ip ||
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "";
    const country =
      body.geo?.country ||
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-vercel-ip-country") ||
      "";
    const cityRaw =
      body.geo?.city ||
      request.headers.get("x-vercel-ip-city") ||
      "";
    let city = "";
    try {
      city = cityRaw ? decodeURIComponent(cityRaw) : "";
    } catch {
      city = String(cityRaw || "");
    }

    // userId привязывается через серверную сессию (подделать из браузера нельзя)
    const session = await sessionFromRequest(request);
    const sessionEmail = session?.email?.trim().toLowerCase() || "";

    const entry = {
      ts: new Date().toISOString(),
      userId: sessionEmail || body.userId || body.email || "",
      page: body.page || "/",
      ip,
      geo: { country: country || "", city },
      ua: body.userAgent || body.ua || request.headers.get("user-agent") || "",
      referer: body.referer || body.referrer || request.headers.get("referer") || "",
      tg: body.tg || body.tgInfo || null,
    };
    const visitId = crypto.randomUUID();

    await dualWrite(
      `visit:${visitId}`,
      async () => {
        const list = await kvGetJson<any[]>("visit:" + date, []);
        list.push(entry);
        const trimmed = list.length > 2000 ? list.slice(-2000) : list;
        await kvPut("visit:" + date, JSON.stringify(trimmed), 60 * 60 * 24 * 30);

        let dates = await kvGetJson<string[]>("visit_dates", []);
        if (!dates.includes(date)) {
          dates.push(date);
          dates.sort().reverse();
          if (dates.length > 60) dates = dates.slice(0, 60);
          await kvPut("visit_dates", JSON.stringify(dates));
        }
      },
      async () => {
        const { insertVisit } = await import("@/lib/ultra/db-data");
        await insertVisit({
          id: visitId,
          date,
          ts: entry.ts,
          user_id: entry.userId || null,
          visitor_id: null,
          page: entry.page,
          ip: entry.ip,
          geo: entry.geo,
          ua: entry.ua,
          referer: entry.referer,
        });
      }
    );
  } catch (e) {
    console.error("[visits]", e);
  }
  return NextResponse.json({ ok: true });
}
