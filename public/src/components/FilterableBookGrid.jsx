"use client";

import { useMemo, useState } from "react";
import BookCard from "./BookCard";
import Icon from "./Icon";

const SORTS = [
  ["", "Default"],
  ["rating", "Top Rated"],
  ["new", "Newest"],
  ["title", "Title A–Z"],
];
const RATINGS = [["", "Any rating"], ["4.5", "4.5+"], ["4", "4.0+"], ["3", "3.0+"]];

// Instant in-browser filter/sort bar for already-fetched, page-scoped book
// lists (collections, category/tag results) — zero network latency since the
// full list is already on the client; filtering is pure JS.
export default function FilterableBookGrid({ books, emptyMessage = "No books found." }) {
  const [sort, setSort] = useState("");
  const [minRating, setMinRating] = useState("");
  const [format, setFormat] = useState("");

  const formats = useMemo(() => [...new Set(books.map((b) => b.format).filter(Boolean))], [books]);

  const filtered = useMemo(() => {
    let list = books;
    if (minRating) list = list.filter((b) => (b.rating || 0) >= Number(minRating));
    if (format) list = list.filter((b) => b.format === format);
    if (sort === "rating") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sort === "new") list = [...list].sort((a, b) => String(b.published || "").localeCompare(String(a.published || "")));
    else if (sort === "title") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [books, sort, minRating, format]);

  const active = minRating || format;

  return (
    <div>
      {/* Filter bar — applies instantly, no reload */}
      <div className="border-line bg-surface sticky top-16 z-10 -mx-4 flex flex-wrap items-center gap-2 border-y px-4 py-3 lg:static lg:mx-0 lg:rounded-2xl lg:border">
        <span className="text-muted flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
          <Icon name="layers" size={13} /> Filters
        </span>
        <div className="flex flex-1 flex-wrap gap-2">
          {SORTS.map(([v, label]) => (
            <button key={label} onClick={() => setSort(v)}
              className={`pill !text-xs ${sort === v ? "!bg-brand-600 !text-white" : ""}`}>
              {label}
            </button>
          ))}
          <span className="border-line mx-1 hidden h-5 w-px sm:block" />
          {RATINGS.map(([v, label]) => (
            <button key={label} onClick={() => setMinRating(v)}
              className={`pill !text-xs ${minRating === v ? "!bg-brand-600 !text-white" : ""}`}>
              {v && <span className="text-amber-300">★</span>} {label}
            </button>
          ))}
          {formats.length > 1 && (
            <>
              <span className="border-line mx-1 hidden h-5 w-px sm:block" />
              {formats.map((fmt) => (
                <button key={fmt} onClick={() => setFormat(format === fmt ? "" : fmt)}
                  className={`pill !text-xs ${format === fmt ? "!bg-brand-600 !text-white" : ""}`}>
                  {fmt}
                </button>
              ))}
            </>
          )}
        </div>
        {active && (
          <button onClick={() => { setMinRating(""); setFormat(""); }} className="text-xs font-semibold text-brand-600 hover:underline">
            Reset
          </button>
        )}
      </div>

      <p className="text-muted mt-4 text-sm">{filtered.length} of {books.length} books</p>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Icon name="search" size={32} className="text-muted mx-auto" />
          <p className="text-muted mt-3 text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {filtered.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      )}
    </div>
  );
}
