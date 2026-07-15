"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";

// Client-side search + country filter over the full authors list — the
// catalog here is small enough (hundreds, not the books-scale thousands)
// that fetching once and filtering in-browser is instant, no per-keystroke
// network round-trip needed.
export default function AuthorsBrowser({ authors }) {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");

  const countries = useMemo(() => {
    const counts = new Map();
    authors.forEach((a) => { if (a.country) counts.set(a.country, (counts.get(a.country) || 0) + 1); });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14);
  }, [authors]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return authors.filter((a) => {
      if (country && a.country !== country) return false;
      if (term && !a.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [authors, q, country]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Authors</h1>
          <p className="text-muted mt-1 text-sm">{filtered.length} of {authors.length} authors</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Icon name="search" size={14} className="text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search authors…" className="input !py-2 !pl-9 text-sm"
          />
        </div>
      </div>

      {countries.length > 0 && (
        <div className="hscroll mt-5">
          {countries.map(([name, count]) => (
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

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <Link key={a.id} href={`/authors/${a.slug}`} className="card flex gap-4 p-5">
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

      {!filtered.length && (
        <div className="py-24 text-center">
          <Icon name="search" size={40} className="text-muted mx-auto" />
          <p className="mt-4 text-lg font-semibold">No authors found</p>
          <p className="text-muted mt-1 text-sm">Try a different search or clear filters.</p>
        </div>
      )}
    </div>
  );
}
