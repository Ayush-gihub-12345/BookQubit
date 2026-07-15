"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";

export default function CollectionsBrowser({ collections }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return collections;
    return collections.filter((c) => c.name.toLowerCase().includes(term));
  }, [collections, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Collections</h1>
          <p className="text-muted mt-1 text-sm">Themed reading journeys, curated for you</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Icon name="search" size={14} className="text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search collections…" className="input !py-2 !pl-9 text-sm"
          />
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Link key={c.name} href={`/collections/${encodeURIComponent(c.name)}`} className="card relative overflow-hidden p-8">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-500/10" />
            <h2 className="text-xl font-bold">{c.name}</h2>
            <p className="text-muted mt-1 text-sm">{c.count} {c.count === 1 ? "book" : "books"}</p>
            <p className="mt-4 text-sm font-semibold text-brand-600">Explore →</p>
          </Link>
        ))}
      </div>

      {!filtered.length && (
        <div className="py-24 text-center">
          <Icon name="search" size={40} className="text-muted mx-auto" />
          <p className="mt-4 text-lg font-semibold">No collections found</p>
          <p className="text-muted mt-1 text-sm">Try a different search term.</p>
        </div>
      )}
    </div>
  );
}
