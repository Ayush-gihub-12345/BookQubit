import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Site-wide default Open Graph image. Book pages set their own (real cover);
// this is the fallback for all other pages so shared links show a branded card.
// NOTE: Satori requires EVERY element with children to declare display: flex.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0e1220 0%, #241f66 60%, #4f46e5 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "84px",
              height: "84px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              fontSize: "46px",
              fontWeight: 800,
            }}
          >
            B
          </div>
          <div style={{ display: "flex", fontSize: "68px", fontWeight: 800, letterSpacing: "-1px" }}>
            <span style={{ color: "#ffffff" }}>Book</span>
            <span style={{ color: "#a5b4fc" }}>Qubit</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: "26px", fontSize: "30px", color: "#c7cbe8" }}>
          Discover, summarize, and buy great books
        </div>
      </div>
    ),
    size
  );
}
