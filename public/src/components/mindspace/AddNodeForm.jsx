"use client";

import { useEffect, useRef, useState } from "react";
import { authFetch } from "@/lib/authFetch";

const KINDS = [["note", "Note"], ["question", "Question"], ["quote", "Quote"], ["link", "Link"], ["book", "Book"]];

export default function AddNodeForm({ space, lang, onAdded }) {
  const [kind, setKind] = useState("note");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const timer = useRef(null);

  // Book picker: debounced catalog search (same hybrid endpoint as site search).
  useEffect(() => {
    if (kind !== "book" || q.trim().length < 2) { setResults([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const r = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&lang=${lang}`);
      if (r.ok) setResults((await r.json()).books.slice(0, 6));
    }, 350);
    return () => clearTimeout(timer.current);
  }, [q, kind, lang]);

  async function add(payload) {
    setBusy(true); setError("");
    const r = await authFetch(`/api/mindspace/${space.id}/items`, { method: "POST", body: JSON.stringify({ entity: "node", ...payload }) });
    setBusy(false);
    if (r && r.ok) { setTitle(""); setBody(""); setUrl(""); setQ(""); setResults([]); onAdded(await r.json()); return; }
    const code = (await r?.json().catch(() => ({})))?.error;
    setError({
      node_limit: "This space has reached its 500-idea limit.", invalid_url: "Enter a full web address starting with http:// or https://.",
      empty_node: "Add a title or some notes first.", url_required: "Paste the link you want to save.",
    }[code] || "Couldn't add that. Try again.");
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (kind !== "book") add({ kind, title, body, url: kind === "link" ? url : undefined }); }} className="border-line bg-surface space-y-3 rounded-2xl border p-4">
      <div role="tablist" aria-label="Idea type" className="flex flex-wrap gap-1.5">
        {KINDS.map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => { setKind(k); setError(""); }}
            className={`rounded-full border px-3 py-1 text-xs ${kind === k ? "border-brand-600 bg-brand-600 text-white" : "border-line"}`}>{l}</button>
        ))}
      </div>

      {kind === "book" ? (
        <div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for a book" aria-label="Search for a book" className="border-line bg-surface w-full rounded-lg border px-3 py-2 text-sm" />
          <ul className="mt-2 space-y-1">
            {results.map((b) => (
              <li key={b.slug}><button type="button" disabled={busy} onClick={() => add({ kind: "book", bookSlug: b.slug, title: b.title })} className="hover:bg-brand-50 w-full rounded-lg px-3 py-2 text-start text-sm">
                <span className="font-medium">{b.title}</span> <span className="text-muted">· {b.author}</span></button></li>
            ))}
            {q.trim().length >= 2 && !results.length && <li className="text-muted px-3 text-sm">No books found.</li>}
          </ul>
        </div>
      ) : (
        <>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder={kind === "question" ? "What are you wondering?" : "Title"} aria-label="Title" className="border-line bg-surface w-full rounded-lg border px-3 py-2 text-sm" />
          {kind === "link" && <input value={url} onChange={(e) => setUrl(e.target.value)} type="url" inputMode="url" placeholder="https://…" aria-label="Link address" className="border-line bg-surface w-full rounded-lg border px-3 py-2 text-sm" />}
          <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={20000} rows={3} placeholder={kind === "quote" ? "The passage" : "Notes (Markdown supported)"} aria-label="Notes" className="border-line bg-surface w-full rounded-lg border px-3 py-2 text-sm" />
          <button disabled={busy} className="btn-primary !px-4 !py-1.5 !text-sm disabled:opacity-50">Add to space</button>
        </>
      )}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
