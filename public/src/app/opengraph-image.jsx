import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Site-wide default Open Graph image. Book pages set their own (using the
// real cover), this is the fallback for every other page (home, listings,
// authors, etc.) so shared links never show a blank/broken preview card.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #0e1220 0%, #241f66 60%, #4f46e5 100%)",
          color: "#fff", fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{
            width: 84, height: 84, borderRadius: 20, background: "linear-gradient(135deg,#6366f1,#4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, fontWeight: 800,
          }}>B</div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, letterSpacing: -1 }}>
            <span>Book</span><span style={{ color: "#a5b4fc" }}>Qubit</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 26, fontSize: 30, color: "#c7cbe8" }}>
          Discover, summarize, and buy great books
        </div>
      </div>
    ),
    size
  );
}
