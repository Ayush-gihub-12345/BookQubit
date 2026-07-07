"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const RECENT_KEY = "bq_recent";
const readRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
};
const pushRecent = (q) => {
  const list = [q, ...readRecent().filter((x) => x !== q)].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
};

export default function SearchBar({ lang, placeholder, big = false, onNavigate }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [recent, setRecent] = useState([]);
  const [active, setActive] = useState(-1);
  const router = useRouter();
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const close = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    const hotkey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", hotkey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", hotkey);
    };
  }, []);

  // flat list of navigable items for keyboard control
  const items = res
    ? [
        ...res.books.map((b) => ({ type: "book", label: b.title, href: `/books/${encodeURIComponent(b.slug)}`, ...b })),
        ...res.authors.map((a) => ({ type: "author", label: a.name, href: `/authors/${a.slug}`, ...a })),
        ...res.tags.map((t) => ({ type: "tag", label: t.name, href: `/books?tag=${encodeURIComponent(t.name)}` })),
      ]
    : [];

  const onChange = (value) => {
    setQ(value); setActive(-1);
    clearTimeout(timer.current);
    if (value.trim().length < 2) { setRes(null); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/suggest?q=${encodeURIComponent(value.trim())}&lang=${lang}`);
        setRes(await r.json());
      } catch { setRes(null); }
      setLoading(false);
    }, 220);
  };

  const go = (href, label) => {
    if (label) pushRecent(label);
    setOpen(false); setQ(""); setRes(null); setActive(-1);
    onNavigate?.();
    router.push(href);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (!items.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % items.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + items.length) % items.length); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); go(items[active].href, items[active].label); }
  };

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) { pushRecent(q.trim()); go(`/books?q=${encodeURIComponent(q.trim())}`); }
  };

  const mark = (text) => {
    const i = text.toLowerCase().indexOf(q.trim().toLowerCase());
    if (i < 0 || !q.trim()) return text;
    return (
      <>{text.slice(0, i)}<mark className="rounded bg-brand-500/25 px-0.5 text-inherit">{text.slice(i, i + q.trim().length)}</mark>{text.slice(i + q.trim().length)}</>
    );
  };

  const empty = res && !res.books.length && !res.authors.length && !res.tags.length;
  const showRecent = open && !res && recent.length > 0;
  let idx = -1;

  return (
    <div ref={boxRef} className="relative">
      <form onSubmit={submit}>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => { setRecent(readRecent()); setOpen(true); }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`input !rounded-full pl-11 pr-16 ${big ? "py-3 text-[15px] shadow-lg shadow-black/5" : "w-64 py-2 text-sm"}`}
          role="combobox"
          aria-expanded={open}
        />
        {q ? (
          <button type="button" onClick={() => { setQ(""); setRes(null); }}
            className="text-muted absolute right-4 top-1/2 -translate-y-1/2 text-sm hover:opacity-70">✕</button>
        ) : (
          big && (
            <kbd className="border-line text-muted pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold sm:block">
              Ctrl K
            </kbd>
          )
        )}
      </form>

      {open && (loading || res || showRecent) && (
        <div className={`bg-surface border-line absolute z-50 mt-2 max-h-[70vh] overflow-auto rounded-2xl border shadow-2xl ${big ? "left-0 right-0" : "right-0 w-96"}`}>
          {showRecent && (
            <div className="p-2">
              <p className="text-muted px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide">Recent searches</p>
              {recent.map((r) => (
                <button key={r} onClick={() => { setQ(r); onChange(r); }}
                  className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm hover:bg-brand-50 dark:hover:bg-white/5">
                  <span className="opacity-50">🕘</span> {r}
                </button>
              ))}
            </div>
          )}

          {loading && <p className="text-muted px-4 py-3 text-sm">Searching…</p>}
          {empty && !loading && <p className="text-muted px-4 py-3 text-sm">No matches for “{q}”</p>}

          {res?.books.length > 0 && (
            <div className="p-2">
              <p className="text-muted px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide">Books</p>
              {res.books.map((b) => {
                idx += 1; const i = idx;
                return (
                  <button key={b.slug} onClick={() => go(`/books/${encodeURIComponent(b.slug)}`, b.title)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left ${active === i ? "bg-brand-50 dark:bg-white/5" : ""}`}>
                    {b.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.cover_url} alt="" className="h-12 w-8 rounded object-cover shadow" />
                    ) : <span className="grid h-12 w-8 place-items-center rounded bg-black/10 text-xs">📕</span>}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{mark(b.title)}</span>
                      <span className="text-muted block truncate text-xs">{b.author} {b.rating ? `· ★ ${b.rating}` : ""}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {res?.authors.length > 0 && (
            <div className="border-line border-t p-2">
              <p className="text-muted px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide">Authors</p>
              {res.authors.map((a) => {
                idx += 1; const i = idx;
                return (
                  <button key={a.slug} onClick={() => go(`/authors/${a.slug}`, a.name)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left ${active === i ? "bg-brand-50 dark:bg-white/5" : ""}`}>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600/15 text-sm font-bold text-brand-600">{a.name[0]}</span>
                    <span className="text-sm font-medium">{mark(a.name)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {res?.tags.length > 0 && (
            <div className="border-line flex flex-wrap gap-2 border-t p-3">
              {res.tags.map((t) => {
                idx += 1; const i = idx;
                return (
                  <button key={t.name} onClick={() => go(`/books?tag=${encodeURIComponent(t.name)}`, t.name)}
                    onMouseEnter={() => setActive(i)}
                    className={`pill ${active === i ? "!bg-brand-600 !text-white" : ""}`}>
                    #{t.name}
                  </button>
                );
              })}
            </div>
          )}

          {res && !empty && (
            <button onClick={() => go(`/books?q=${encodeURIComponent(q.trim())}`, q.trim())}
              className="border-line block w-full border-t px-4 py-3 text-center text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:hover:bg-white/5">
              View all results for “{q}” →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
