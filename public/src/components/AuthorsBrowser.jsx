"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import SortDropdown from "./SortDropdown";

const SORTS = [
  { value: "name", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "recent", label: "Recently Added" },
  { value: "birth", label: "Birth Year" },
];

const PER_PAGE = 60;
// Author search is a cheap in-memory filter server-side (no DB read — see
// queryAuthors in repo.js), so this only needs to avoid a network call per
// keystroke, not protect a database. Much lighter than the book search's
// 4-char/500ms rule, which exists to guard an actual SQL scan.
const SEARCH_DEBOUNCE_MS = 250;

// API-driven: fetches one page at a time from /api/authors instead of
// receiving the whole catalog and filtering in the browser. The catalog
// outgrew "fetch once, filter client-side" — verified live that shipping
// the full ~3,900-row list as hydration props broke the page's server
// render outright (React's streaming reveal script for that page's content
// never got emitted, leaving the page blank at any screen size). See
// queryAuthors() in repo.js for the full story.
export default function AuthorsBrowser({ lang, initialAuthors, initialHasMore, countries }) {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [sort, setSort] = useState("name");
  const [authors, setAuthors] = useState(initialAuthors);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const firstRun = useRef(true);
  const reqId = useRef(0);
  const debounceRef = useRef(null);

  const fetchPage = async (targetPage, replace) => {
    const id = ++reqId.current;
    const qs = new URLSearchParams({
      lang, sort, perPage: String(PER_PAGE), page: String(targetPage),
      ...(q.trim() ? { q: q.trim() } : {}),
      ...(country ? { country } : {}),
    });
    const json = await fetch(`/api/authors?${qs}`).then((r) => r.json());
    if (id !== reqId.current) return; // a newer request superseded this one
    setAuthors((prev) => (replace ? json.authors : [...prev, ...json.authors]));
    setHasMore(json.hasMore);
    setPage(targetPage);
  };

  // Filter/search/sort change -> debounce, then replace the list from page 1.
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      fetchPage(1, true).finally(() => setLoading(false));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, country, sort]);

  const loadMore = async () => {
    setLoadingMore(true);
    try { await fetchPage(page + 1, false); } finally { setLoadingMore(false); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Authors</h1>
          <p className="text-muted mt-1 text-sm">
            {authors.length}{hasMore ? "+" : ""} authors{country ? ` in ${country}` : ""}{q.trim() ? ` matching "${q.trim()}"` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Icon name="search" size={14} className="text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search authors…" className="input !py-2 !pl-9 text-sm"
            />
          </div>
          <SortDropdown value={sort} options={SORTS} onChange={setSort} />
        </div>
      </div>

      {countries.length > 0 && (
        <div className="hscroll mt-5">
          {countries.map(({ name, count }) => (
            <button key={name} onClick={() => setCountry(country === name ? "" : name)}
              className={`pill whitespace-nowrap ${country === name ? "!bg-brand-600 !text-white" : ""}`}>
              {name} <span className="ml-1 opacity-60">{count}</span>
            </button>
          ))}
          {country && (
            <button onClick={() => setCountry("")} className="pill group whitespace-nowrap">
              Clear <Icon name="x" size={11} className="ml-1.5 opacity-60 group-hover:opacity-100" />
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="card h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((a) => (
            <Link key={a.id} href={`/authors/${a.slug}`} prefetch={false} className="card flex gap-4 p-5">
              {a.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.image_url} alt={a.name} className="h-20 w-20 rounded-full object-cover" loading="lazy" />
              ) : (
                <div className="tint-brand grid h-20 w-20 shrink-0 place-items-center rounded-full text-2xl font-bold text-brand-600">
                  {a.name[0]}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-semibold">{a.name}</h2>
                <p className="text-muted text-xs">{[a.country, a.birth_year].filter(Boolean).join(" · ")}</p>
                <p className="text-muted mt-1 line-clamp-2 text-sm">{a.bio}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !authors.length && (
        <div className="py-24 text-center">
          <Icon name="search" size={40} className="text-muted mx-auto" />
          <p className="mt-4 text-lg font-semibold">No authors found</p>
          <p className="text-muted mt-1 text-sm">Try a different search or clear filters.</p>
        </div>
      )}

      {!loading && hasMore && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <button onClick={loadMore} disabled={loadingMore} className="btn-primary !px-8">
            {loadingMore ? <span className="spinner" /> : <Icon name="chevronDown" size={14} />}
            {loadingMore ? "Loading…" : "Load More"}
          </button>
          <p className="text-muted text-xs">{authors.length} loaded</p>
        </div>
      )}
    </div>
  );
}
