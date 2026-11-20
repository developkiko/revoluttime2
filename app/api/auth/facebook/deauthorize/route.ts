import * as crypto from "node:crypto";
import { NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/ultra/db";

/**
 * Facebook "Отменить авторизацию" (Deauthorize Callback URL). Facebook POSTs
 * an application/x-www-form-urlencoded signed_request when a user removes the
 * app from their Facebook account — we detach the Facebook identity from any
 * linked account and must answer 200.
 */
export async function POST(request: Request) {
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  let userId: string | null = null;

  try {
    const form = await request.formData();
    const signedRequest = form.get("signed_request");
    if (typeof signedRequest === "string" && appSecret) {
      const [signature, payload] = signedRequest.split(".");
      const expected = crypto
        .createHmac("sha256", appSecret)
        .update(payload)
        .digest()
        .toString("base64url");
      const a = Buffer.from(signature);
      const b = Buffer.from(expected);
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
        const data = JSON.parse(
          Buffer.from(payload, "base64url").toString()
        ) as { user_id?: string };
        userId = data.user_id ?? null;
      }
    }
  } catch {
    // malformed payload — still answer 200 per Facebook requirements
  }

  if (userId && dbConfigured()) {
    await db(
      `UPDATE auth_links SET facebook_id = NULL, updated_at = now() WHERE facebook_id = $1`,
      [userId]
    ).catch(() => {});
  }

  return new NextResponse("OK", { status: 200 });
}
