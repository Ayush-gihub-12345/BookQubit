"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import BookCover from "./BookCover";

// One search-and-pick slot. Debounced live search against /api/suggest
// (the same endpoint the Ctrl+K search bar uses), showing book results only.
function BookSlot({ lang, index, picked, onPick, onClear }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const onChange = (value) => {
    setQ(value);
    if (value.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    fetch(`/api/suggest?q=${encodeURIComponent(value.trim())}&lang=${lang}`)
      .then((r) => r.json())
      .then((d) => setResults(d.books || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  };

  if (picked) {
    return (
      <div className="card flex items-center gap-3 p-3">
        <div className="h-16 w-11 shrink-0 overflow-hidden rounded shadow">
          <BookCover title={picked.title} author={picked.author} cover_url={picked.cover_url} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-semibold">{picked.title}</p>
          <p className="text-muted line-clamp-1 text-xs">{picked.author}</p>
        </div>
        <button onClick={onClear} aria-label="Remove" className="text-muted shrink-0 hover:text-red-500">
          <Icon name="x" size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="border-line bg-surface flex items-center gap-2 rounded-xl border border-dashed p-3">
        <span className="text-muted grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600/10 text-xs font-bold text-brand-600">
          {index + 1}
        </span>
        <input
          value={q} onChange={(e) => onChange(e.target.value)}
          placeholder="Search for a book…" className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      {q.trim().length >= 2 && (
        <div className="bg-surface border-line absolute left-0 right-0 top-full z-20 mt-1.5 max-h-64 overflow-auto rounded-xl border shadow-xl">
          {loading && <p className="text-muted px-3 py-3 text-sm">Searching…</p>}
          {!loading && results.length === 0 && <p className="text-muted px-3 py-3 text-sm">No matches</p>}
          {results.map((b) => (
            <button
              key={b.slug}
              onClick={() => { onPick(b); setQ(""); setResults([]); }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-brand-50 dark:hover:bg-white/5"
            >
              <div className="h-12 w-8 shrink-0 overflow-hidden rounded shadow">
                <BookCover title={b.title} author={b.author} cover_url={b.cover_url} />
              </div>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{b.title}</span>
                <span className="text-muted block truncate text-xs">{b.author}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Builds a /compare/{slug}-vs-{slug} URL from up to 4 picked books — matching
// the exact search-phrase pattern ("X vs Y") this page type is meant to rank for.
export default function ComparePicker({ lang, suggestions = [] }) {
  const [picks, setPicks] = useState([null, null]);
  const router = useRouter();

  const setPick = (i, book) => setPicks((prev) => prev.map((p, idx) => (idx === i ? book : p)));
  const addSlot = () => setPicks((prev) => (prev.length < 4 ? [...prev, null] : prev));

  const readyCount = picks.filter(Boolean).length;
  const go = () => {
    const slugs = picks.filter(Boolean).map((b) => b.slug);
    if (slugs.length < 2) return;
    router.push(`/compare/${slugs.join("-vs-")}`);
  };

  return (
    <div>
      <div className="space-y-3">
        {picks.map((p, i) => (
          <BookSlot
            key={i} lang={lang} index={i} picked={p}
            onPick={(b) => setPick(i, b)}
            onClear={() => setPick(i, null)}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {picks.length < 4 && (
          <button onClick={addSlot} className="btn-ghost !py-2 text-sm">
            <Icon name="check" size={14} /> Add another book
          </button>
        )}
        <button onClick={go} disabled={readyCount < 2} className="btn-primary !py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40">
          <Icon name="layers" size={14} /> Compare {readyCount >= 2 ? `${readyCount} books` : ""}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-10">
          <p className="text-muted mb-3 text-[11px] font-bold uppercase tracking-wider">Popular comparisons</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <a key={s.href} href={s.href} className="pill">{s.label}</a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
