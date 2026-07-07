"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SearchBar({ lang, placeholder, big = false, onNavigate }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const router = useRouter();
  const boxRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const close = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const onChange = (value) => {
    setQ(value);
    clearTimeout(timer.current);
    if (value.trim().length < 2) { setRes(null); setOpen(false); return; }
    setLoading(true); setOpen(true);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/suggest?q=${encodeURIComponent(value.trim())}&lang=${lang}`);
        setRes(await r.json());
      } catch { setRes(null); }
      setLoading(false);
    }, 250);
  };

  const go = (href) => {
    setOpen(false); setQ("");
    onNavigate?.();
    router.push(href);
  };

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) go(`/books?q=${encodeURIComponent(q.trim())}`);
  };

  const empty = res && !res.books.length && !res.authors.length && !res.tags.length;

  return (
    <div ref={boxRef} className="relative">
      <form onSubmit={submit}>
        <input
          value={q}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => q.trim().length >= 2 && setOpen(true)}
          placeholder={placeholder}
          className={`input ${big ? "py-3.5 pl-11 text-base shadow-xl" : "w-52 py-2 text-sm"}`}
        />
        {big && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-50">🔍</span>}
      </form>

      {open && (
        <div className={`bg-surface border-line absolute z-50 mt-2 max-h-[70vh] overflow-auto rounded-2xl border shadow-2xl ${big ? "left-0 right-0" : "right-0 w-80"}`}>
          {loading && <p className="text-muted px-4 py-3 text-sm">Searching…</p>}
          {empty && !loading && <p className="text-muted px-4 py-3 text-sm">No matches for “{q}”</p>}

          {res?.books.length > 0 && (
            <div className="p-2">
              <p className="text-muted px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide">Books</p>
              {res.books.map((b) => (
                <button key={b.slug} onClick={() => go(`/books/${encodeURIComponent(b.slug)}`)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-brand-50 dark:hover:bg-white/5">
                  {b.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.cover_url} alt="" className="h-12 w-8 rounded object-cover" />
                  ) : <span className="grid h-12 w-8 place-items-center rounded bg-black/10 text-xs">📕</span>}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{b.title}</span>
                    <span className="text-muted block truncate text-xs">{b.author} {b.rating ? `· ★ ${b.rating}` : ""}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {res?.authors.length > 0 && (
            <div className="border-line border-t p-2">
              <p className="text-muted px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide">Authors</p>
              {res.authors.map((a) => (
                <button key={a.slug} onClick={() => go(`/authors/${a.slug}`)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-brand-50 dark:hover:bg-white/5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600/15 text-sm font-bold text-brand-600">{a.name[0]}</span>
                  <span className="text-sm font-medium">{a.name}</span>
                </button>
              ))}
            </div>
          )}

          {res?.tags.length > 0 && (
            <div className="border-line flex flex-wrap gap-2 border-t p-3">
              {res.tags.map((t) => (
                <button key={t.name} onClick={() => go(`/books?tag=${encodeURIComponent(t.name)}`)} className="pill">
                  #{t.name}
                </button>
              ))}
            </div>
          )}

          {res && !empty && (
            <button onClick={() => go(`/books?q=${encodeURIComponent(q.trim())}`)}
              className="border-line block w-full border-t px-4 py-3 text-center text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:hover:bg-white/5">
              View all results →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
