"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Rating from "./Rating";
import BookCover from "./BookCover";
import Icon from "./Icon";

export default function ComicsBrowser({ comics }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(() => {
    const counts = new Map();
    comics.forEach((c) => { if (c.category) counts.set(c.category, (counts.get(c.category) || 0) + 1); });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [comics]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return comics.filter((c) => {
      if (category && c.category !== category) return false;
      if (term && !`${c.title} ${c.publisher || ""}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [comics, q, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Comics</h1>
          <p className="text-muted mt-1 text-sm">{filtered.length} of {comics.length} comics</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Icon name="search" size={14} className="text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search comics or publishers…" className="input !py-2 !pl-9 text-sm"
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="hscroll mt-5">
          {categories.map(([name, count]) => (
            <button key={name} onClick={() => setCategory(category === name ? "" : name)}
              className={`pill whitespace-nowrap ${category === name ? "!bg-brand-600 !text-white" : ""}`}>
              {name} <span className="ml-1 opacity-60">{count}</span>
            </button>
          ))}
          {category && (
            <button onClick={() => setCategory("")} className="pill group whitespace-nowrap">
              Clear <Icon name="x" size={11} className="ml-1.5 opacity-60 group-hover:opacity-100" />
            </button>
          )}
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((c) => (
          <Link key={c.id} href={`/comics/${c.slug}`} className="card group block overflow-hidden">
            <div className="relative aspect-[2/3] overflow-hidden bg-black/5 dark:bg-white/5">
              <BookCover title={c.title} author={c.publisher} cover_url={c.cover_url}
                imgClassName="transition duration-500 group-hover:scale-105" />
              {c.category && (
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                  {c.category}
                </span>
              )}
            </div>
            <div className="p-4">
              <h2 className="line-clamp-1 font-semibold group-hover:text-brand-600">{c.title}</h2>
              <p className="text-muted line-clamp-1 text-sm">{c.publisher}</p>
              <div className="mt-2"><Rating value={c.rating} /></div>
            </div>
          </Link>
        ))}
      </div>

      {!filtered.length && (
        <div className="py-24 text-center">
          <Icon name="search" size={40} className="text-muted mx-auto" />
          <p className="mt-4 text-lg font-semibold">No comics found</p>
          <p className="text-muted mt-1 text-sm">Try a different search or clear filters.</p>
        </div>
      )}
    </div>
  );
}
