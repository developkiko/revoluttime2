import { NextRequest, NextResponse } from "next/server";
import { kvPut } from "@/lib/ultra/kv";
import { corsHeaders } from "@/lib/ultra/cors";
import { sessionFromRequest } from "@/lib/ultra/session";


export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    // Email берётся из серверной сессии, а не из тела запроса
    const session = await sessionFromRequest(request);
    const email = session?.email || "";
    if (email) {
      await kvPut(
        "heartbeat:" + email,
        JSON.stringify({
          ts: new Date().toISOString(),
          page: body.page || "",
          sw: body.sw || 0,
          sh: body.sh || 0,
        }),
        300
      );
    }
  } catch (e) {
    console.error("[heartbeat]", e);
  }
  return NextResponse.json({ ok: true }, { headers: corsHeaders(request) });
}
