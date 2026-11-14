"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import EmptyState from "./EmptyState";

// Generalized from the original CollectionsBrowser — the same
// search-box + card-grid treatment, reused for /categories and /tags so
// those stop being a bare count-list and a bare pill-list.
//
// `hrefPrefix` is a plain string: each card links to hrefPrefix + the
// URL-encoded name. Collections use a path prefix (`/en/collections/`),
// categories and tags use a query prefix (`/en/books?category=`). It used to
// be a `getHref` FUNCTION, but this is a Client Component rendered from Server
// Component pages, and React cannot serialize a function across that boundary:
// the server render threw "Functions cannot be passed directly to Client
// Components" on every request to /categories, /collections and /tags (a hard
// 500 in dev; in production the page recovered by re-rendering in the browser,
// which hid the error). Props that cross the boundary must be plain data.
export default function NamedListBrowser({
  items,
  hrefPrefix,
  title,
  subtitle,
  searchPlaceholder, // caller should pass a translated string (see t("searchEllipsis"))
  itemNoun = "book",
  // No literal arrow glyph here on purpose — a hardcoded "→" would point the
  // wrong way for Arabic/Urdu, which read right-to-left. The caller-supplied
  // label carries whatever directionality its own language needs.
  exploreLabel = "Explore",
  noResultsTitle = "Nothing found",
  noResultsSubtitle = "Try a different search term.",
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((c) => c.name.toLowerCase().includes(term));
  }, [items, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
          {subtitle && <p className="text-muted mt-1 text-sm">{subtitle}</p>}
        </div>
        <div className="relative w-full sm:w-64">
          <Icon name="search" size={14} className="text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder} className="input !py-2 !pl-9 text-sm"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((c) => (
          <Link key={c.name} href={`${hrefPrefix}${encodeURIComponent(c.name)}`} prefetch={false} className="card group flex items-center justify-between gap-4 px-5 py-4" aria-label={`${c.name}: ${exploreLabel}`}>
            <span className="min-w-0">
              <span className="font-display block truncate text-lg font-semibold group-hover:text-brand-600">{c.name}</span>
              <span className="text-muted block text-sm">{c.count} {c.count === 1 ? itemNoun : `${itemNoun}s`}</span>
            </span>
            <Icon name="chevronDown" size={16} className="text-muted shrink-0 -rotate-90 group-hover:text-brand-600 rtl:rotate-90" />
          </Link>
        ))}
      </div>

      {!filtered.length && <EmptyState title={noResultsTitle} subtitle={noResultsSubtitle} />}
    </div>
  );
}
