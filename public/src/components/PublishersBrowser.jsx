"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import SortDropdown from "./SortDropdown";

const SORTS = [
  { value: "name", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "recent", label: "Recently Added" },
  { value: "founded", label: "Oldest Founded" },
];

const PER_PAGE = 60;
const SEARCH_DEBOUNCE_MS = 250;

// Same fix as AuthorsBrowser — API-driven pagination instead of shipping the
// whole ~2,300-row publisher list as hydration props, which was breaking
// the page's server render outright.
export default function PublishersBrowser({ lang, initialPublications, initialHasMore, types }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("name");
  const [publications, setPublications] = useState(initialPublications);
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
      ...(type ? { type } : {}),
    });
    const json = await fetch(`/api/publishers?${qs}`).then((r) => r.json());
    if (id !== reqId.current) return;
    setPublications((prev) => (replace ? json.publications : [...prev, ...json.publications]));
    setHasMore(json.hasMore);
    setPage(targetPage);
  };

  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      fetchPage(1, true).finally(() => setLoading(false));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type, sort]);

  const loadMore = async () => {
    setLoadingMore(true);
    try { await fetchPage(page + 1, false); } finally { setLoadingMore(false); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Publishers</h1>
          <p className="text-muted mt-1 text-sm">
            {publications.length}{hasMore ? "+" : ""} publishers{type ? ` · ${type}` : ""}{q.trim() ? ` matching "${q.trim()}"` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Icon name="search" size={14} className="text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search publishers…" className="input !py-2 !pl-9 text-sm"
            />
          </div>
          <SortDropdown value={sort} options={SORTS} onChange={setSort} />
        </div>
      </div>

      {types.length > 0 && (
        <div className="hscroll mt-5">
          {types.map(({ name, count }) => (
            <button key={name} onClick={() => setType(type === name ? "" : name)}
              className={`pill whitespace-nowrap ${type === name ? "!bg-brand-600 !text-white" : ""}`}>
              {name} <span className="ml-1 opacity-60">{count}</span>
            </button>
          ))}
          {type && (
            <button onClick={() => setType("")} className="pill group whitespace-nowrap">
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
          {publications.map((p) => (
            <Link key={p.id} href={`/publications/${p.slug}`} prefetch={false} className="card p-5">
              <div className="flex items-center gap-4">
                {p.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo_url} alt={p.name} className="h-14 w-14 rounded-xl object-cover" loading="lazy" />
                )}
                <div>
                  <h2 className="font-semibold">{p.name}</h2>
                  <p className="text-muted text-xs">{[p.type, p.headquarters].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
              <p className="text-muted mt-3 line-clamp-2 text-sm">{p.description}</p>
            </Link>
          ))}
        </div>
      )}

      {!loading && !publications.length && (
        <div className="py-24 text-center">
          <Icon name="search" size={40} className="text-muted mx-auto" />
          <p className="mt-4 text-lg font-semibold">No publishers found</p>
          <p className="text-muted mt-1 text-sm">Try a different search or clear filters.</p>
        </div>
      )}

      {!loading && hasMore && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <button onClick={loadMore} disabled={loadingMore} className="btn-primary !px-8">
            {loadingMore ? <span className="spinner" /> : <Icon name="chevronDown" size={14} />}
            {loadingMore ? "Loading…" : "Load More"}
          </button>
          <p className="text-muted text-xs">{publications.length} loaded</p>
        </div>
      )}
    </div>
  );
}
