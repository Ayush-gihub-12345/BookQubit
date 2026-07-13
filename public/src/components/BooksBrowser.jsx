"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BookCard from "./BookCard";
import BookCover from "./BookCover";
import Rating from "./Rating";
import Icon from "./Icon";

const PER_PAGE = 32;

const SORTS = [
  ["", "Relevance"],
  ["rating", "Top Rated"],
  ["new", "Newest"],
  ["title", "Title A–Z"],
];
const RATINGS = [["4.5", "4.5 & up"], ["4", "4.0 & up"], ["3", "3.0 & up"]];
const FORMATS = ["Paperback", "Hardcover", "EBook"];

// Instant, client-side catalog browser: filter/sort clicks apply immediately
// via a lightweight fetch to /api/books (no full page reload). Results load
// 32 at a time — only "Load More" triggers the next batch, appended to the
// list, so changing a filter never silently pulls hundreds of rows at once.
export default function BooksBrowser({ lang, initialParams, initialData, facets }) {
  const { page: _ignoredPage, ...initialFilters } = initialParams;
  const [params, setParams] = useState(initialFilters);
  const [books, setBooks] = useState(initialData.books);
  const [total, setTotal] = useState(initialData.total);
  const [pages, setPages] = useState(initialData.pages);
  const [page, setPage] = useState(initialData.page || 1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchInput, setSearchInput] = useState(initialFilters.q || "");
  const debounceRef = useRef(null);
  const firstRun = useRef(true);
  const reqId = useRef(0);

  const apply = (patch) => setParams((prev) => ({ ...prev, ...patch }));

  // Filter/sort change -> reset to page 1 and replace the list
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    const id = ++reqId.current;
    setLoading(true);
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries({ ...params, lang, perPage: PER_PAGE }).filter(([, v]) => v))
    );
    fetch(`/api/books?${qs}`)
      .then((r) => r.json())
      .then((json) => {
        if (id !== reqId.current) return; // stale response, ignore
        setBooks(json.books);
        setTotal(json.total);
        setPages(json.pages);
        setPage(1);
        setLoading(false);
        const url = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
        window.history.replaceState(null, "", `/books${url.size ? `?${url}` : ""}`);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, lang]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries({ ...params, lang, perPage: PER_PAGE, page: nextPage }).filter(([, v]) => v))
    );
    try {
      const json = await fetch(`/api/books?${qs}`).then((r) => r.json());
      setBooks((prev) => [...prev, ...json.books]);
      setPage(nextPage);
    } finally { setLoadingMore(false); }
  };

  // debounce free-text search
  const onSearchChange = (v) => {
    setSearchInput(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => apply({ q: v || undefined }), 350);
  };

  const { q, category, collection, tag, format, country, rating, mood, sort, view } = params;
  const isList = view === "list";

  const activeFilters = [
    q && { key: "q", label: `“${q}”` },
    category && { key: "category", label: category },
    collection && { key: "collection", label: collection },
    tag && { key: "tag", label: `#${tag}` },
    rating && { key: "rating", label: `★ ${rating}+` },
    format && { key: "format", label: format },
    country && { key: "country", label: country },
    mood && { key: "mood", label: mood },
  ].filter(Boolean);

  const Toggle = ({ active, onClick, children }) => (
    <button onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition hover:bg-brand-50 dark:hover:bg-white/5 ${active ? "bg-brand-50 font-semibold text-brand-600 dark:bg-white/5" : ""}`}>
      {children}
    </button>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-muted text-xs">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-1.5">/</span>
        <span>Books</span>
        {category && (<><span className="mx-1.5">/</span><span className="text-brand-600">{category}</span></>)}
      </nav>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {q ? `Results for “${q}”` : category || collection || (tag && `#${tag}`) || "All Books"}
          </h1>
          <p className="text-muted mt-1 text-sm">
            {total.toLocaleString()} {total === 1 ? "book" : "books"}
            {pages > 1 && ` · showing ${books.length}`}
            {loading && <span className="ml-2 inline-flex items-center gap-1 text-brand-600"><span className="spinner" /> updating</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-52">
            <Icon name="search" size={14} className="text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={searchInput} onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search this list…" className="input !py-2 !pl-9 text-sm" />
          </div>
          <div className="border-line bg-surface hidden rounded-xl border p-1 text-xs font-semibold sm:flex">
            {SORTS.map(([v, label]) => (
              <button key={label} onClick={() => apply({ sort: v || undefined })}
                className={`rounded-lg px-3 py-1.5 transition ${(sort || "") === v ? "bg-brand-600 text-white shadow" : "hover:text-brand-600"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="border-line bg-surface flex rounded-xl border p-1">
            <button onClick={() => apply({ view: undefined })} aria-label="Grid view"
              className={`rounded-lg px-2.5 py-1.5 ${!isList ? "bg-brand-600 text-white" : "text-muted hover:text-brand-600"}`}>
              <Icon name="grid" size={14} />
            </button>
            <button onClick={() => apply({ view: "list" })} aria-label="List view"
              className={`rounded-lg px-2.5 py-1.5 ${isList ? "bg-brand-600 text-white" : "text-muted hover:text-brand-600"}`}>
              <Icon name="menu" size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* mobile sort */}
      <div className="border-line bg-surface mt-3 flex rounded-xl border p-1 text-xs font-semibold sm:hidden">
        {SORTS.map(([v, label]) => (
          <button key={label} onClick={() => apply({ sort: v || undefined })}
            className={`flex-1 rounded-lg px-2 py-1.5 transition ${(sort || "") === v ? "bg-brand-600 text-white shadow" : ""}`}>
            {label}
          </button>
        ))}
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeFilters.map((fl) => (
            <button key={fl.key} onClick={() => apply({ [fl.key]: undefined })} className="pill group">
              {fl.label} <Icon name="x" size={11} className="ml-1.5 opacity-60 group-hover:opacity-100" />
            </button>
          ))}
          <button onClick={() => { setSearchInput(""); setParams({}); }} className="text-xs font-semibold text-brand-600 hover:underline">
            Clear all
          </button>
        </div>
      )}

      <div className="hscroll mt-4 lg:hidden">
        {facets.categories.map((c) => (
          <button key={c.name} onClick={() => apply({ category: category === c.name ? undefined : c.name })}
            className={`pill whitespace-nowrap ${category === c.name ? "!bg-brand-600 !text-white" : ""}`}>
            {c.name} <span className="ml-1 opacity-60">{c.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden space-y-7 lg:block">
          <div>
            <p className="text-muted mb-3 text-[11px] font-bold uppercase tracking-wider">Categories</p>
            <ul className="space-y-1">
              {facets.categories.map((c) => (
                <li key={c.name}>
                  <Toggle active={category === c.name} onClick={() => apply({ category: category === c.name ? undefined : c.name })}>
                    <span className="line-clamp-1">{c.name}</span>
                    <span className="text-muted text-xs">{c.count}</span>
                  </Toggle>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-muted mb-3 text-[11px] font-bold uppercase tracking-wider">Rating</p>
            <ul className="space-y-1">
              {RATINGS.map(([v, label]) => (
                <li key={v}>
                  <button onClick={() => apply({ rating: rating === v ? undefined : v })}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition hover:bg-brand-50 dark:hover:bg-white/5 ${rating === v ? "bg-brand-50 font-semibold text-brand-600 dark:bg-white/5" : ""}`}>
                    <span className="text-amber-400">★</span> {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-muted mb-3 text-[11px] font-bold uppercase tracking-wider">Format</p>
            <ul className="space-y-1">
              {FORMATS.map((fmt) => (
                <li key={fmt}>
                  <Toggle active={format === fmt} onClick={() => apply({ format: format === fmt ? undefined : fmt })}>
                    {fmt}
                  </Toggle>
                </li>
              ))}
            </ul>
          </div>

          {facets.moods?.length > 0 && (
            <div>
              <p className="text-muted mb-3 text-[11px] font-bold uppercase tracking-wider">Mood</p>
              <ul className="space-y-1">
                {facets.moods.slice(0, 8).map((m) => (
                  <li key={m.name}>
                    <Toggle active={mood === m.name} onClick={() => apply({ mood: mood === m.name ? undefined : m.name })}>
                      <span className="line-clamp-1">{m.name}</span>
                      <span className="text-muted text-xs">{m.count}</span>
                    </Toggle>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {facets.collections.length > 0 && (
            <div>
              <p className="text-muted mb-3 text-[11px] font-bold uppercase tracking-wider">Collections</p>
              <ul className="space-y-1">
                {facets.collections.slice(0, 8).map((c) => (
                  <li key={c.name}>
                    <Toggle active={collection === c.name} onClick={() => apply({ collection: collection === c.name ? undefined : c.name })}>
                      <span className="line-clamp-1">{c.name}</span>
                      <span className="text-muted text-xs">{c.count}</span>
                    </Toggle>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
          {books.length === 0 ? (
            <div className="py-24 text-center">
              <Icon name="search" size={40} className="text-muted mx-auto" />
              <p className="mt-4 text-lg font-semibold">No books found</p>
              <p className="text-muted mt-1 text-sm">Try adjusting your filters or search terms.</p>
              <button onClick={() => { setSearchInput(""); setParams({}); }} className="btn-primary mt-5 inline-flex">Clear filters</button>
            </div>
          ) : isList ? (
            <div className="space-y-4">
              {books.map((b) => (
                <Link key={b.id} href={`/books/${encodeURIComponent(b.slug)}`}
                  className="card flex gap-5 p-4 hover:!translate-y-0">
                  <div className="h-36 w-24 shrink-0 overflow-hidden rounded-lg shadow">
                    <BookCover title={b.title} author={b.author} cover_url={b.cover_url} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold hover:text-brand-600">{b.title}</h2>
                    <p className="text-muted text-sm">{b.author}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                      <Rating value={b.rating} />
                      {b.category && <span className="pill !text-[10px]">{b.category}</span>}
                      {b.page_count && <span className="text-muted">{b.page_count} pages</span>}
                      {b.published && <span className="text-muted">{b.published}</span>}
                    </div>
                    <p className="text-muted mt-2 line-clamp-2 text-sm leading-relaxed">{b.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
              {books.map((b) => <BookCard key={b.id} book={b} />)}
            </div>
          )}

          {page < pages && (
            <div className="mt-10 flex flex-col items-center gap-2">
              <button onClick={loadMore} disabled={loadingMore} className="btn-primary !px-8">
                {loadingMore ? <span className="spinner" /> : <Icon name="chevronDown" size={14} />}
                {loadingMore ? "Loading…" : `Load ${Math.min(PER_PAGE, total - books.length)} more books`}
              </button>
              <p className="text-muted text-xs">{books.length} of {total.toLocaleString()} loaded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
