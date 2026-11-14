"use client";

import { wrapText } from "@/lib/feed";

const SIZE = { w: 1080, h: 1350 }; // 4:5 — fits Instagram, X and WhatsApp status without cropping

/** Render a shareable quote card to a PNG Blob (canvas, no dependencies). */
export async function quoteImage({ text, title, author }) {
  const c = document.createElement("canvas");
  c.width = SIZE.w; c.height = SIZE.h;
  const g = c.getContext("2d");
  const light = !document.documentElement.dataset.theme || ["light", "sepia", "ocean", "forest", "rose"].includes(document.documentElement.dataset.theme);
  g.fillStyle = light ? "#faf9f6" : "#0b0f17"; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = light ? "#047857" : "#34d399"; g.fillRect(80, 120, 96, 8);

  const serif = 'Newsreader, Georgia, "Times New Roman", serif';
  let size = 64, lines;
  const max = SIZE.w - 160;
  for (; size >= 36; size -= 4) { // shrink until the quote fits in ~11 lines
    g.font = `500 ${size}px ${serif}`;
    lines = wrapText((s) => g.measureText(s).width, `“${text}”`, max);
    if (lines.length <= 11) break;
  }
  g.fillStyle = light ? "#0f172a" : "#e6ebf3";
  g.textBaseline = "top";
  lines.slice(0, 12).forEach((l, i) => g.fillText(l, 80, 200 + i * size * 1.35));

  g.font = `600 36px ${serif}`;
  g.fillStyle = light ? "#0f172a" : "#e6ebf3";
  g.fillText(title || "", 80, SIZE.h - 240);
  g.font = `400 30px ${serif}`; g.fillStyle = light ? "#64707f" : "#94a0b4";
  g.fillText(author || "", 80, SIZE.h - 190);
  g.font = "600 28px system-ui, sans-serif"; g.fillStyle = light ? "#047857" : "#34d399";
  g.fillText("BookQubit", 80, SIZE.h - 110);

  return new Promise((resolve) => c.toBlob(resolve, "image/png"));
}

/** Share via the native sheet when files are supported, otherwise download the PNG. */
export async function shareQuoteImage(opts) {
  const blob = await quoteImage(opts);
  if (!blob) return false;
  const file = new File([blob], "bookqubit-quote.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: opts.title }); return true; } catch { return false; /* cancelled */ }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "bookqubit-quote.png"; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return true;
}
