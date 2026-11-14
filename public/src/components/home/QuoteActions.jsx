"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import SaveToMindSpace from "@/components/mindspace/SaveToMindSpace";

// Save-to-MindSpace and share for the quote of the day. Share uses the native sheet when there is one, else copies.
export default function QuoteActions({ quote }) {
  const [msg, setMsg] = useState("");
  const share = async () => {
    const text = `“${quote.text}” — ${quote.bookTitle}${quote.author ? `, ${quote.author}` : ""}`;
    try {
      if (navigator.share) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); setMsg("Copied"); setTimeout(() => setMsg(""), 2000); }
    } catch { /* cancelled */ }
  };
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
      <SaveToMindSpace node={{ kind: "quote", body: quote.text, bookSlug: quote.bookSlug, title: quote.bookTitle }} label="Save to MindSpace" className="btn-soft btn-sm" />
      <button type="button" className="btn-ghost btn-sm" onClick={share}><Icon name="share" size={15} />Share</button>
      <span role="status" className="text-brand-700 text-xs">{msg}</span>
    </div>
  );
}
