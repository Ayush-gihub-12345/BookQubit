"use client";

// Ctrl K / "/" command palette (UI v2.1): live book and author suggestions, recent searches, every main page,
// and actions (Surprise me, switch theme). Arrow keys + Enter. "Search all" opens the full results on /books.
// Data: /api/search (books, from 2 characters, indexed full-text + semantic) and /api/suggest (authors, from 4
// characters: that route is deliberately gated, see its comment). Authors also come from /api/search (indexed, 2+ characters).
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { THEME_CHOICES, applyTheme } from "@/lib/themeClient";
import { useSurprise } from "@/components/surprise/SurpriseMe";
import { t } from "@/lib/i18n";

const RECENT = "bq-recent-searches";

export default function CommandPalette({ lang, open, onClose }) {
  const router = useRouter();
  const tr = t(lang);
  const { open: openSurprise } = useSurprise();
  const [q, setQ] = useState("");
  const [data, setData] = useState({ books: [], authors: [] });
  const [idx, setIdx] = useState(0);
  const [recent, setRecent] = useState([]);
  const input = useRef(null);
  const L = (h) => `/${lang}${h === "/" ? "" : h}`;

  useEffect(() => {
    if (!open) return;
    setQ(""); setIdx(0); setData({ books: [], authors: [] });
    try { setRecent(JSON.parse(localStorage.getItem(RECENT) || "[]")); } catch { setRecent([]); }
    const prev = document.activeElement;
    const id = setTimeout(() => input.current?.focus(), 10);
    document.body.style.overflow = "hidden";
    return () => { clearTimeout(id); document.body.style.overflow = ""; prev?.focus?.(); };
  }, [open]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setData({ books: [], authors: [] }); return; }
    const ctl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const [b, a] = await Promise.all([
          fetch(`/api/search?q=${encodeURIComponent(term)}&lang=${lang}`, { signal: ctl.signal }).then((r) => (r.ok ? r.json() : { books: [] })),
          term.length >= 4 ? fetch(`/api/suggest?q=${encodeURIComponent(term)}&lang=${lang}`, { signal: ctl.signal }).then((r) => (r.ok ? r.json() : { authors: [] })) : Promise.resolve({ authors: [] }),
        ]);
        // /api/search authors are indexed and work from 2 characters; /api/suggest (4+) is the fallback without the index.
        setData({ books: b.books || [], authors: (b.authors && b.authors.length ? b.authors : a.authors) || [] }); setIdx(0);
      } catch { /* aborted or offline: keep what we have */ }
    }, 180);
    return () => { clearTimeout(timer); ctl.abort(); };
  }, [q, lang]);

  const go = (href) => { onClose(); router.push(href); };
  const searchAll = (term) => {
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 6);
    try { localStorage.setItem(RECENT, JSON.stringify(next)); } catch { /* private mode */ }
    go(L(`/books?q=${encodeURIComponent(term)}`));
  };

  const PAGES = useMemo(() => [
    { key: "home", label: tr("homeWord"), href: "/", icon: "home" },
    { key: "feed", label: "Feed", href: "/feed", icon: "flame", desc: "Books, quotes and summaries" },
    { key: "books", label: tr("allBooksMenu"), href: "/books", icon: "book" },
    { key: "listen", label: "Listen", href: "/listen", icon: "headphones", desc: "Audio summaries and queues" },
    { key: "bestsellers", label: "Bestsellers", href: "/books?shelf=bestsellers", icon: "trophy" },
    { key: "classics", label: "Classics", href: "/books?shelf=classics", icon: "feather" },
    { key: "new", label: tr("newReleases"), href: "/books?sort=new", icon: "sparkles" },
    { key: "top", label: tr("topRated"), href: "/books?sort=rating", icon: "star" },
    { key: "comics", label: tr("comics"), href: "/comics", icon: "layers" },
    { key: "authors", label: tr("authors"), href: "/authors", icon: "feather" },
    { key: "publishers", label: tr("publishers"), href: "/publications", icon: "building" },
    { key: "collections", label: tr("collections"), href: "/collections", icon: "layers" },
    { key: "genres", label: tr("navAllGenres"), href: "/categories", icon: "hash" },
    { key: "compare", label: tr("compareWord"), href: "/compare", icon: "layers" },
    { key: "request", label: tr("requestABookTitle"), href: "/request-a-book", icon: "bookmark" },
    { key: "library", label: tr("navLibrary"), href: "/library", icon: "bookmark", desc: "Shelves, stats and goals" },
    { key: "mindspace", label: "MindSpace", href: "/mindspace", icon: "layers", desc: "Notes, quotes and ideas" },
    { key: "community", label: tr("communityTitle"), href: "/community", icon: "users" },
    { key: "connect", label: "Connect", href: "/connect", icon: "heart", desc: "Find readers like you" },
    { key: "ranking", label: tr("navBookwormRanking"), href: "/leaderboard", icon: "trophy" },
  ], [tr]);

  const items = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = [];
    if (term) out.push({ id: "all", group: "Search", label: `Search all for “${q.trim()}”`, icon: "search", run: () => searchAll(q.trim()) });
    data.books.slice(0, 5).forEach((b) => out.push({ id: `b-${b.slug}`, group: "Books", label: b.title, sub: b.author, cover: b.cover_url, icon: "book", run: () => go(L(`/books/${encodeURIComponent(b.slug)}`)) }));
    data.authors.slice(0, 3).forEach((a) => out.push({ id: `a-${a.slug}`, group: "Authors", label: a.name, icon: "feather", run: () => go(L(`/authors/${encodeURIComponent(a.slug)}`)) }));
    if (!term) recent.forEach((r) => out.push({ id: `r-${r}`, group: "Recent", label: r, icon: "clock", run: () => searchAll(r) }));
    out.push({ id: "surprise", group: "Actions", label: tr("navSurpriseMe"), sub: "Get a random great read", icon: "dice", run: () => { onClose(); openSurprise(); } });
    if (term) THEME_CHOICES.filter((th) => `theme ${th.name}`.toLowerCase().includes(term)).slice(0, 9)
      .forEach((th) => out.push({ id: `t-${th.id}`, group: "Actions", label: `Theme: ${th.name}`, icon: "palette", run: () => { applyTheme(th.id, router); onClose(); } }));
    PAGES.filter((p) => !term || p.label.toLowerCase().includes(term)).slice(0, term ? 6 : 8)
      .forEach((p) => out.push({ id: `n-${p.key}`, group: "Go to", label: p.label, sub: p.desc, icon: p.icon, run: () => go(L(p.href)) }));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, data, recent, lang, PAGES]);

  if (!open) return null;
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(items.length - 1, i + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    if (e.key === "Enter") { e.preventDefault(); items[idx]?.run(); }
    if (e.key === "Escape") onClose();
  };
  let lastGroup = "";
  return (
    <div className="fixed inset-0 z-[85] flex items-start justify-center sm:p-3 sm:pt-[10vh]" role="presentation">
      <button type="button" aria-label="Close search" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Search" className="panel animate-pop relative flex w-full max-w-2xl flex-col overflow-hidden max-sm:h-dvh max-sm:max-w-none max-sm:!rounded-none max-sm:border-0" onKeyDown={onKey}>
        <div className="flex items-center gap-2 border-b border-[var(--line)] px-3 sm:gap-3 sm:px-4 max-sm:pt-[env(safe-area-inset-top)]">
          <button type="button" className="btn-icon sm:hidden" onClick={onClose} aria-label="Back"><Icon name="arrowRight" size={20} className="rotate-180 rtl:rotate-0" /></button>
          <Icon name="search" size={20} className="text-[var(--muted)] max-sm:hidden" />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search books, authors…" enterKeyHint="search"
            role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-activedescendant={items[idx]?.id} autoComplete="off"
            className="h-14 flex-1 bg-transparent text-[17px] outline-none placeholder:text-[var(--muted)]" />
          <button type="button" className={`btn-icon !h-8 !w-8 !min-h-8 ${q ? "" : "max-sm:hidden"}`} onClick={q ? () => { setQ(""); input.current?.focus(); } : onClose} aria-label={q ? "Clear search" : "Close"}><Icon name="x" size={16} /></button>
        </div>
        <ul id="cmdk-list" role="listbox" className="max-h-[55dvh] overflow-y-auto p-2 max-sm:max-h-none max-sm:flex-1 max-sm:pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {items.map((it, i) => {
            const head = it.group !== lastGroup ? (lastGroup = it.group) : null;
            return (
              <li key={it.id} role="presentation">
                {head && <p className="eyebrow px-3 pb-1 pt-3 !text-[var(--muted)]">{head}</p>}
                <button type="button" id={it.id} role="option" aria-selected={i === idx} onMouseEnter={() => setIdx(i)} onClick={it.run}
                  className={`menu-item ${i === idx ? "!bg-[var(--surface-2)]" : ""}`}>
                  <span className="grid w-7 shrink-0 place-items-center text-[var(--muted)]">
                    {it.cover
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <span className="cover !rounded-[3px] block w-7 shrink-0"><img src={it.cover} alt="" loading="lazy" /></span>
                      : <Icon name={it.icon} size={17} />}
                  </span>
                  <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{it.label}</span>{it.sub && <span className="block truncate text-xs text-[var(--muted)]">{it.sub}</span>}</span>
                  {i === idx && <Icon name="cornerDownLeft" size={15} className="text-[var(--muted)]" />}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex gap-4 border-t border-[var(--line)] px-4 py-2.5 text-xs text-[var(--muted)] max-sm:hidden">
          <span><kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd> move</span><span><kbd className="kbd">Enter</kbd> open</span><span><kbd className="kbd">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
