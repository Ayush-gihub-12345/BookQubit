"use client";

import { useMemo, useState } from "react";
import BookCard from "./BookCard";
import Icon from "./Icon";
import EmptyState from "./EmptyState";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

// Instant in-browser filter/sort bar for already-fetched, page-scoped book
// lists (collections, category/tag results) — zero network latency since the
// full list is already on the client; filtering is pure JS.
export default function FilterableBookGrid({ books, emptyMessage }) {
  const tr = t(useLang());
  const SORTS = [
    ["", tr("sortDefault")],
    ["rating", tr("sortHighestRated")],
    ["new", tr("sortNewest")],
    ["title", tr("sortTitleAZ")],
  ];
  const RATINGS = [["", tr("anyRating")], ["4.5", "4.5+"], ["4", "4.0+"], ["3", "3.0+"]];
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
      <div className="border-line bg-surface sticky top-14 z-10 -mx-4 flex flex-wrap items-center gap-2 border-y px-4 py-3 sm:top-16 lg:static lg:mx-0 lg:rounded-xl lg:border">
        <span className="text-muted flex items-center gap-1.5 text-xs font-semibold">
          <Icon name="layers" size={13} /> {tr("filtersLabel")}
        </span>
        <div className="flex flex-1 flex-wrap gap-2">
          {SORTS.map(([v, label]) => (
            <button key={label} onClick={() => setSort(v)} aria-pressed={sort === v}
              className={`pill !text-xs ${sort === v ? "!bg-brand-600 !text-[var(--on-brand)]" : ""}`}>
              {label}
            </button>
          ))}
          <span className="border-line mx-1 hidden h-5 w-px sm:block" />
          {RATINGS.map(([v, label]) => (
            <button key={label} onClick={() => setMinRating(v)} aria-pressed={minRating === v}
              className={`pill !text-xs ${minRating === v ? "!bg-brand-600 !text-[var(--on-brand)]" : ""}`}>
              {v && <span aria-hidden="true">★</span>} {label}
            </button>
          ))}
          {formats.length > 1 && (
            <>
              <span className="border-line mx-1 hidden h-5 w-px sm:block" />
              {formats.map((fmt) => (
                <button key={fmt} onClick={() => setFormat(format === fmt ? "" : fmt)} aria-pressed={format === fmt}
                  className={`pill !text-xs ${format === fmt ? "!bg-brand-600 !text-[var(--on-brand)]" : ""}`}>
                  {fmt}
                </button>
              ))}
            </>
          )}
        </div>
        {active && (
          <button onClick={() => { setMinRating(""); setFormat(""); }} className="text-xs font-semibold text-brand-600 hover:underline">
            {tr("resetLabel")}
          </button>
        )}
      </div>

      <p className="text-muted mt-4 text-sm">{tr("filteredOfTotalBooks", { filtered: filtered.length, total: books.length })}</p>

      {filtered.length === 0 ? (
        <EmptyState compact title={emptyMessage || tr("noBooksFoundLabel")} />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      )}
    </div>
  );
}
