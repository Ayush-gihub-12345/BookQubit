"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

// Two-step creation flow: pick a book or author first, then (only then) the
// title/tags/description fields unlock. No file/image attachments by design.
export default function NewDiscussionModal({ user, presetBook, onClose, onCreated }) {
  const [target, setTarget] = useState(presetBook ? { type: "book", slug: presetBook.slug, label: presetBook.title } : null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState({ books: [], authors: [] });
  const [title, setTitle] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (q.trim().length < 2) { setResults({ books: [], authors: [] }); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/suggest?q=${encodeURIComponent(q.trim())}&lang=en`);
        const d = await r.json();
        setResults({ books: d.books || [], authors: d.authors || [] });
      } catch { setResults({ books: [], authors: [] }); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const submit = async (e) => {
    e.preventDefault();
    if (!target || !title.trim()) return;
    setBusy(true); setError("");
    try {
      const idToken = await user.getIdToken();
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8);
      const r = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken, title: title.trim(), body: description.trim(), tags,
          bookSlug: target.type === "book" ? target.slug : undefined,
          authorSlug: target.type === "author" ? target.slug : undefined,
        }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Couldn't start the discussion"); return; }
      onCreated(d.id);
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="card w-full max-w-lg p-6 hover:!translate-y-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Start a Discussion</h2>
          <button onClick={onClose} className="text-muted hover:text-brand-600"><Icon name="x" size={18} /></button>
        </div>

        {!target ? (
          <div className="mt-4">
            <p className="text-muted mb-2 text-sm">First, pick the book or author this discussion is about.</p>
            <div className="relative">
              <Icon name="search" size={14} className="text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search books or authors…" className="input w-full !pl-9" autoFocus />
            </div>
            <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
              {results.books.map((b) => (
                <button key={b.slug} onClick={() => setTarget({ type: "book", slug: b.slug, label: b.title })}
                  className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm hover:bg-brand-50 dark:hover:bg-white/5">
                  <Icon name="book" size={14} className="text-brand-600 shrink-0" /> {b.title} <span className="text-muted">— {b.author}</span>
                </button>
              ))}
              {results.authors.map((a) => (
                <button key={a.slug} onClick={() => setTarget({ type: "author", slug: a.slug, label: a.name })}
                  className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm hover:bg-brand-50 dark:hover:bg-white/5">
                  <Icon name="feather" size={14} className="text-brand-600 shrink-0" /> {a.name}
                </button>
              ))}
              {q.trim().length >= 2 && !results.books.length && !results.authors.length && (
                <p className="text-muted px-2 py-2 text-sm">No matches for "{q}".</p>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-brand-600/10 px-3 py-2 text-sm">
              <span className="flex items-center gap-2 text-brand-600">
                <Icon name={target.type === "book" ? "book" : "feather"} size={14} /> {target.label}
              </span>
              {!presetBook && (
                <button type="button" onClick={() => setTarget(null)} className="text-muted hover:text-brand-600 text-xs">Change</button>
              )}
            </div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="Discussion title" className="input w-full" />
            <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Tags, comma separated (optional)" className="input w-full" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
              placeholder="What do you want to talk about?" className="input w-full resize-none" />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={busy || !title.trim()} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40">
              {busy ? "Starting…" : "Start Discussion"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
