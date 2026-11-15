import { NextRequest, NextResponse } from "next/server";
import { kvGetJson, kvPut } from "@/lib/ultra/kv";


export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const today = new Date().toISOString().slice(0, 10);
    const data = await kvGetJson<any>("visitors:" + today, { total: 0, unique: 0, ips: [] });
    data.total = (data.total || 0) + 1;
    if (!Array.isArray(data.ips)) data.ips = [];
    if (!data.ips.includes(ip)) data.ips.push(ip);
    data.unique = data.ips.length;
    if (data.ips.length > 5000) data.ips = data.ips.slice(-5000);
    await kvPut("visitors:" + today, JSON.stringify(data), 172800);
  } catch (e) {
    console.error("[visitors]", e);
  }
  return NextResponse.json({ ok: true });
}
