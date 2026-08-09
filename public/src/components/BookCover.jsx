"use client";

import { useState } from "react";

// Renders the real cover image, or a designed placeholder "cover" with the
// book's title and author on a gradient picked deterministically from the title.
// Falls back to the placeholder automatically if the real image URL 404s.
const GRADIENTS = [
  "linear-gradient(135deg,#1e3a5f,#4a7ba6)",
  "linear-gradient(135deg,#5f1e3a,#a64a6b)",
  "linear-gradient(135deg,#3a5f1e,#6ba64a)",
  "linear-gradient(135deg,#4a1e5f,#8a4aa6)",
  "linear-gradient(135deg,#5f4a1e,#a6894a)",
  "linear-gradient(135deg,#1e5f5a,#4aa69e)",
  "linear-gradient(135deg,#37474f,#78909c)",
  "linear-gradient(135deg,#4e342e,#a1887f)",
];

const hash = (s = "") => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

// Open Library serves three fixed sizes per cover: -S, -M (~180px) and -L
// (~500px+). The import stores the -L URL, but grid/list cards render these
// at roughly 150-200px wide, so every card was downloading an image several
// times larger than it displays — Lighthouse flagged ~1,561 KiB (desktop) /
// 496 KiB (mobile) of wasted image bytes on the homepage alone.
//
// Only the hero keeps -L, since that one IS displayed large (and is the LCP
// element). Anything else steps down to -M. Untouched if the URL isn't an
// Open Library cover, so custom/admin-set covers are never rewritten.
function sizedCover(url, priority) {
  if (priority || !url) return url;
  return url.replace(/^(https:\/\/covers\.openlibrary\.org\/b\/[a-z]+\/[^/]+)-L\.jpg$/i, "$1-M.jpg");
}

export default function BookCover({ title, author, cover_url, className = "", imgClassName = "", priority = false }) {
  const [broken, setBroken] = useState(false);

  if (cover_url && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={sizedCover(cover_url, priority)}
        alt={`Cover of ${title}${author ? ` by ${author}` : ""}`}
        loading={priority ? "eager" : "lazy"}
        // The hero cover is the homepage's Largest Contentful Paint element.
        // `eager` only stops it being deferred — it still queues behind
        // everything discovered earlier, which is what Lighthouse reports as
        // "LCP request discovery". fetchPriority moves it to the front.
        // Deliberately not set elsewhere: prioritising everything prioritises
        // nothing, and grid covers should stay lazy and low priority.
        fetchPriority={priority ? "high" : undefined}
        decoding={priority ? "sync" : "async"}
        onError={() => setBroken(true)}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    );
  }
  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden p-[8%] text-white ${className}`}
      style={{ background: GRADIENTS[hash(title) % GRADIENTS.length], containerType: "inline-size" }}
      role="img"
      aria-label={`Cover of ${title}${author ? ` by ${author}` : ""}`}
    >
      {/* spine + sheen */}
      <span className="absolute inset-y-0 left-0 w-[6%] bg-black/25" />
      <span className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent" />
      <span className="mt-[10%] block border-y border-white/40 py-[6%] text-center font-[var(--font-display)] font-bold leading-snug [font-size:clamp(10px,10cqw,20px)]">
        <span className="line-clamp-4">{title}</span>
      </span>
      {author && (
        <span className="block truncate pl-[8%] text-center italic opacity-90 [font-size:clamp(8px,7cqw,13px)]">
          {author}
        </span>
      )}
    </div>
  );
}
