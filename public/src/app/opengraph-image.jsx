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
          background: "#0f5b57",
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
              background: "#f2c230", color: "#4d3a00",
              fontSize: "46px",
              fontWeight: 800,
            }}
          >
            B
          </div>
          <div style={{ display: "flex", fontSize: "68px", fontWeight: 800, letterSpacing: "-1px" }}>
            <span style={{ color: "#ffffff" }}>Book</span>
            <span style={{ color: "#9fdcd4" }}>Qubit</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: "26px", fontSize: "30px", color: "#cde6e2" }}>
          Discover, summarize, and buy great books
        </div>
      </div>
    ),
    size
  );
}
