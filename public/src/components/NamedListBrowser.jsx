"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import EmptyState from "./EmptyState";

// Generalized from the original CollectionsBrowser — the same
// search-box + card-grid treatment, reused for /categories and /tags so
// those stop being a bare count-list and a bare pill-list. `getHref` is a
// function rather than a fixed base path because collections link to their
// own route (`/collections/Name`) while categories/tags link to a filtered
// /books query (`/books?category=Name`) — both are just "a name maps to a
// URL", so one component covers both without inventing two near-duplicates.
export default function NamedListBrowser({
  items,
  getHref,
  title,
  subtitle,
  searchPlaceholder = "Search…",
  itemNoun = "book",
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((c) => c.name.toLowerCase().includes(term));
  }, [items, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
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

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Link key={c.name} href={getHref(c.name)} prefetch={false} className="card relative overflow-hidden p-8">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-500/10" />
            <h2 className="text-xl font-bold">{c.name}</h2>
            <p className="text-muted mt-1 text-sm">{c.count} {c.count === 1 ? itemNoun : `${itemNoun}s`}</p>
            <p className="mt-4 text-sm font-semibold text-brand-600">Explore →</p>
          </Link>
        ))}
      </div>

      {!filtered.length && <EmptyState title="Nothing found" subtitle="Try a different search term." />}
    </div>
  );
}
