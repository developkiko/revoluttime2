"use client";

/**
 * Корневой crash-boundary (layout тоже упал): собственные html/body,
 * без i18n-провайдера — текст нейтральный.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0b0d14",
          color: "#e5e7eb",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p
            style={{
              fontSize: "5rem",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              color: "rgba(239,68,68,.2)",
              margin: 0,
              userSelect: "none",
            }}
          >
            500
          </p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Something went wrong</h1>
          {error.digest && (
            <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>{error.digest}</p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              background: "#6366f1",
              color: "#fff",
              fontWeight: 600,
              border: 0,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- crash-boundary вне роутера */}
          <a
            href="/"
            style={{
              display: "block",
              marginTop: "0.75rem",
              color: "#818cf8",
              fontSize: "0.9rem",
            }}
          >
            revoluttime.de
          </a>
        </div>
      </body>
    </html>
  );
}
