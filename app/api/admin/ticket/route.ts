import * as crypto from "node:crypto";
import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { getSessionUser, type SessionUser } from "@/lib/auth-session";
import { db, dbConfigured, dbOne } from "@/lib/ultra/db";

/**
 * Admin-ticket bridge for the separate admin app (revtime2-admin → adm-rt.vercel.app).
 *
 * The admin app never authenticates on its own: it redirects the browser here,
 * and only users whose MAIN-SITE session carries the admin role get a short-lived
 * one-time ticket minted and are bounced back. Everyone else receives the site's
 * regular 404 page — the admin surface stays invisible.
 *
 *   GET  /api/admin/ticket        → mint ticket, 302 → {ADMIN_APP_URL}/?ticket=…
 *   POST /api/admin/ticket        → server-to-server verify for the admin app
 *                                    {ticket} → {ok, email, name, picture, provider}
 *
 * Ticket = base64url(JSON{email,name,picture,provider,nonce,exp}) + "." +
 * HMAC-SHA256(payload, AUTH_SESSION_SECRET), 120 s TTL, nonce consumed once via
 * Neon (`admin_tickets`; without DATABASE_URL the expiry window is the only guard).
 * No shared secret is ever sent to the admin app — it only forwards the ticket here.
 */

const TICKET_TTL_MS = 120_000;
const SIGN_PREFIX = "adm_ticket.v1.";

function adminAppUrl(): string {
  return (process.env.ADMIN_APP_URL || "https://adm-rt.vercel.app").replace(/\/+$/, "");
}

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminUser(user: SessionUser | null): boolean {
  if (!user) return false;
  return user.isAdmin === true || adminEmails().includes(user.email.toLowerCase());
}

function secret(): string | undefined {
  const s = process.env.AUTH_SESSION_SECRET;
  return s && s.length >= 16 ? s : undefined;
}

function sign(payload: string, key: string): string {
  return crypto.createHmac("sha256", key).update(payload).digest("base64url");
}

export async function GET() {
  const user = await getSessionUser();
  if (!isAdminUser(user)) notFound();
  const key = secret();
  if (!key) notFound();

  const payload = Buffer.from(
    JSON.stringify({
      email: user!.email,
      name: user!.name,
      picture: user!.picture,
      provider: user!.provider,
      nonce: crypto.randomUUID(),
      exp: Date.now() + TICKET_TTL_MS,
    })
  ).toString("base64url");

  const ticket = `${payload}.${sign(SIGN_PREFIX + payload, key)}`;
  return NextResponse.redirect(
    new URL(`/?ticket=${encodeURIComponent(ticket)}`, adminAppUrl()),
    302
  );
}

export async function POST(request: Request) {
  const key = secret();
  if (!key) return Response.json({ ok: false, error: "not_configured" }, { status: 503 });

  let ticket = "";
  try {
    const body = (await request.json()) as { ticket?: unknown };
    if (typeof body?.ticket === "string") ticket = body.ticket;
  } catch {
    // fallthrough
  }
  const [payload, signature] = ticket.split(".");
  if (!payload || !signature) {
    return Response.json({ ok: false, error: "invalid" }, { status: 401 });
  }

  const expected = sign(SIGN_PREFIX + payload, key);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return Response.json({ ok: false, error: "invalid" }, { status: 401 });
  }

  let data: {
    email: string;
    name: string;
    picture?: string;
    provider: SessionUser["provider"];
    nonce: string;
    exp: number;
  } | null = null;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return Response.json({ ok: false, error: "invalid" }, { status: 401 });
  }
  if (
    !data?.email ||
    !data.nonce ||
    typeof data.exp !== "number" ||
    data.exp < Date.now()
  ) {
    return Response.json({ ok: false, error: "invalid_or_expired" }, { status: 401 });
  }

  // One-time use: the nonce is burned on first verification (best-effort —
  // without DATABASE_URL only the short expiry guards replays).
  if (dbConfigured()) {
    try {
      await db(
        `CREATE TABLE IF NOT EXISTS admin_tickets (
           nonce text PRIMARY KEY,
           email text NOT NULL,
           created_at timestamptz NOT NULL DEFAULT now()
         )`,
        []
      );
      await db(
        `DELETE FROM admin_tickets WHERE created_at < now() - interval '1 hour'`,
        []
      );
      const inserted = await dbOne<{ nonce: string }>(
        `INSERT INTO admin_tickets (nonce, email) VALUES ($1, $2)
         ON CONFLICT (nonce) DO NOTHING
         RETURNING nonce`,
        [data.nonce, data.email]
      );
      if (!inserted) {
        return Response.json({ ok: false, error: "already_used" }, { status: 401 });
      }
    } catch (error) {
      console.error("[admin-ticket] nonce burn failed:", error);
      return Response.json({ ok: false, error: "storage_unavailable" }, { status: 503 });
    }
  }

  return Response.json({
    ok: true,
    email: data.email,
    name: data.name,
    picture: data.picture,
    provider: data.provider,
  });
}
