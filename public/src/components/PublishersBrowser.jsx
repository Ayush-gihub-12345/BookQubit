"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";

export default function PublishersBrowser({ publications }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");

  const types = useMemo(() => {
    const counts = new Map();
    publications.forEach((p) => { if (p.type) counts.set(p.type, (counts.get(p.type) || 0) + 1); });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [publications]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return publications.filter((p) => {
      if (type && p.type !== type) return false;
      if (term && !p.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [publications, q, type]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Publishers</h1>
          <p className="text-muted mt-1 text-sm">{filtered.length} of {publications.length} publishers</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Icon name="search" size={14} className="text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search publishers…" className="input !py-2 !pl-9 text-sm"
          />
        </div>
      </div>

      {types.length > 0 && (
        <div className="hscroll mt-5">
          {types.map(([name, count]) => (
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

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <Link key={p.id} href={`/publications/${p.slug}`} className="card p-5">
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

      {!filtered.length && (
        <div className="py-24 text-center">
          <Icon name="search" size={40} className="text-muted mx-auto" />
          <p className="mt-4 text-lg font-semibold">No publishers found</p>
          <p className="text-muted mt-1 text-sm">Try a different search or clear filters.</p>
        </div>
      )}
    </div>
  );
}
