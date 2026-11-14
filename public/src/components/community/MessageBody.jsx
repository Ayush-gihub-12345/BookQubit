"use client";

import { useState } from "react";

// Spoiler syntax in chat: ||hidden text||. Stored as plain text (no schema change); rendered as a
// blurred, click-to-reveal span. Everything is rendered as React text nodes, so it cannot inject markup.
function Spoiler({ children }) {
  const [shown, setShown] = useState(false);
  return (
    <span
      role="button" tabIndex={0} aria-label={shown ? "Spoiler" : "Spoiler, activate to reveal"}
      onClick={() => setShown(true)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShown(true); } }}
      className={`rounded px-1 transition ${shown ? "bg-black/10 dark:bg-white/10" : "cursor-pointer bg-black/20 blur-[5px] select-none dark:bg-white/20"}`}
    >
      {children}
    </span>
  );
}

export function splitSpoilers(body) {
  const parts = [];
  const re = /\|\|([^|]+?)\|\|/g;
  let last = 0, m;
  while ((m = re.exec(body))) {
    if (m.index > last) parts.push({ text: body.slice(last, m.index), spoiler: false });
    parts.push({ text: m[1], spoiler: true });
    last = m.index + m[0].length;
  }
  if (last < body.length) parts.push({ text: body.slice(last), spoiler: false });
  return parts;
}

export default function MessageBody({ body }) {
  return (
    <p className="whitespace-pre-line leading-relaxed">
      {splitSpoilers(String(body || "")).map((p, i) => (p.spoiler ? <Spoiler key={i}>{p.text}</Spoiler> : <span key={i}>{p.text}</span>))}
    </p>
  );
}
