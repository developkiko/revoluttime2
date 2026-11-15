import { NextRequest, NextResponse } from "next/server";
import { kvGet } from "@/lib/ultra/kv";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body?.email || "").toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    const exists = (await kvGet("user:" + email)) !== null;
    return NextResponse.json({ exists });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
