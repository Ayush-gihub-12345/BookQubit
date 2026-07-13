"use client";

// Catches errors thrown by the root layout itself — must render its own
// <html>/<body> and can't rely on globals.css/Tailwind having loaded, so
// this stays plain inline styles by design, not an oversight.
export default function GlobalError({ reset }) {
  return (
    <html>
      <body style={{ display: "grid", placeItems: "center", minHeight: "100vh", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ marginTop: 8, color: "#6b7280" }}>BookQubit hit an unexpected error. Please try again.</p>
          <button
            onClick={reset}
            style={{ marginTop: 20, padding: "10px 20px", borderRadius: 999, background: "#4f46e5", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
