"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import SortDropdown from "./SortDropdown";

const SORTS = [
  { value: "name", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "recent", label: "Recently Added" },
  { value: "birth", label: "Birth Year" },
];

// How many cards mount at once. The catalog outgrew "hundreds" (it's
// 3,500+ authors now) — rendering every card in one pass was the actual
// weight in the page, independent of the trimmed-payload fix in page.jsx.
// Search/filter/sort still run over the FULL in-memory list (still instant,
// no network round-trip); this only caps how much of that result mounts to
// the DOM at a time.
const PAGE_SIZE = 60;

// Client-side search + country filter + sort over the full authors list —
// fetched once, filtered/sorted in-browser with no per-keystroke network
// round-trip. Rendering is paginated (see PAGE_SIZE) so that "instant" stays
// true even as the catalog grows into the thousands.
export default function AuthorsBrowser({ authors }) {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [sort, setSort] = useState("name");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const countries = useMemo(() => {
    const counts = new Map();
    authors.forEach((a) => { if (a.country) counts.set(a.country, (counts.get(a.country) || 0) + 1); });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14);
  }, [authors]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = authors.filter((a) => {
      if (country && a.country !== country) return false;
      if (term && !a.name.toLowerCase().includes(term)) return false;
      return true;
    });
    const sorted = [...list];
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "name-desc") sorted.sort((a, b) => b.name.localeCompare(a.name));
    else if (sort === "recent") sorted.sort((a, b) => b.id - a.id);
    else if (sort === "birth") sorted.sort((a, b) => (b.birth_year || 0) - (a.birth_year || 0));
    return sorted;
  }, [authors, q, country, sort]);

  // Any change to what's being shown resets how much is mounted — otherwise
  // switching filters could leave `visible` past the end of a now-shorter
  // list, or hide results 60-120 behind an unnecessary extra click.
  useEffect(() => { setVisible(PAGE_SIZE); }, [q, country, sort]);

  const shown = filtered.slice(0, visible);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Authors</h1>
          <p className="text-muted mt-1 text-sm">{filtered.length} of {authors.length} authors</p>
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
        {shown.map((a) => (
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

      {!filtered.length && (
        <div className="py-24 text-center">
          <Icon name="search" size={40} className="text-muted mx-auto" />
          <p className="mt-4 text-lg font-semibold">No authors found</p>
          <p className="text-muted mt-1 text-sm">Try a different search or clear filters.</p>
        </div>
      )}

      {visible < filtered.length && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <button onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn-primary !px-8">
            <Icon name="chevronDown" size={14} /> Load More
          </button>
          <p className="text-muted text-xs">{shown.length} of {filtered.length} shown</p>
        </div>
      )}
    </div>
  );
}
