import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { parseProvider, unlinkProvider } from "@/lib/auth-links";

/**
 * Unlink a sign-in method from the current account. Refuses to remove the
 * last remaining method (owner rule): the client shows the
 * "невозможно отвязать единственный способ входа" notice.
 */
export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "not_authorized" }, { status: 401 });
  }

  let body: { provider?: string } = {};
  try {
    body = (await request.json()) as { provider?: string };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const provider = body.provider ? parseProvider(body.provider) : null;
  if (!provider) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const result = await unlinkProvider(session.email, provider);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "error" },
      { status: result.error === "last_method" ? 409 : 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
