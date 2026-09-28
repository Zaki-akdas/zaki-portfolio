"use client";

// Last-resort boundary: renders only when the root layout itself throws, so it
// must supply its own <html>/<body> (it fully replaces the root layout).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#05060d", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "24px",
          }}
        >
          <p style={{ letterSpacing: "0.3em", textTransform: "uppercase", fontSize: 13, color: "#818cf8" }}>
            Critical failure
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 700, color: "#fff", margin: "16px 0 0" }}>
            The site hit an unexpected error
          </h1>
          <p style={{ maxWidth: 440, color: "#94a3b8", marginTop: 16 }}>
            Something went wrong at the application root. Reload to try again.
          </p>
          {error?.digest && (
            <p style={{ fontFamily: "monospace", fontSize: 12, color: "#475569", marginTop: 12 }}>
              ref: {error.digest}
            </p>
          )}
          <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: 44,
                borderRadius: 9999,
                border: "none",
                background: "#6366f1",
                color: "#05060d",
                fontWeight: 600,
                padding: "12px 24px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
            <a
              href="/"
              style={{
                minHeight: 44,
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#e2e8f0",
                padding: "12px 24px",
                textDecoration: "none",
              }}
            >
              Go home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
