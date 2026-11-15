/**
 * CORS allowlist for the www API.
 * Origins come from UP_ALLOWED_ORIGINS (comma-separated env var);
 * defaults cover the site itself plus the admin panel and the legacy
 * CF worker that call upload-avatar. Requests without an Origin
 * header (curl, server-to-server) get no CORS headers at all.
 */
const DEFAULT_ALLOWED_ORIGINS =
  "https://revolut-time.vercel.app,https://admin.revoluttime.de,https://adm-rt.vercel.app";

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  if (!origin) return {};
  const allowed = (process.env.UP_ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!allowed.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}
