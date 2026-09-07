"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import EmptyState from "./EmptyState";
import { FollowButton } from "./FollowButton";
import { t } from "@/lib/i18n";

const MEDAL_STYLE = ["text-amber-400", "text-muted", "text-amber-700"];

// Same search+card treatment as NamedListBrowser, adapted for reader rows
// (avatar, follow button) instead of plain name/count cards — reuses the
// already-fetched, already-cached top-readers/most-followed lists rather
// than issuing any new query.
export default function ReadersBrowser({ topReaders, popularReaders, lang }) {
  const tr = t(lang);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("top");

  const source = tab === "top" ? topReaders : popularReaders;
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return source;
    return source.filter((r) => r.name?.toLowerCase().includes(term));
  }, [source, q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Readers</h1>
          <p className="text-muted mt-1 text-sm">Browse the BookQubit community</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Icon name="search" size={14} className="text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search readers…" className="input !py-2 !pl-9 text-sm"
          />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button onClick={() => setTab("top")} className={`pill !text-sm ${tab === "top" ? "!bg-brand-600 !text-white" : ""}`}>
          <Icon name="trendingUp" size={14} /> Top Readers
        </button>
        <button onClick={() => setTab("popular")} className={`pill !text-sm ${tab === "popular" ? "!bg-brand-600 !text-white" : ""}`}>
          <Icon name="heart" size={14} /> Most Followed
        </button>
      </div>

      {filtered.length > 0 ? (
        <ol className="mt-6 space-y-2.5">
          {filtered.map((r, i) => (
            <li key={r.id}>
              <div className="card flex items-center gap-4 p-4 hover:!translate-y-0">
                <Link href={`/readers/${r.slug || r.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <span className={`flex w-9 shrink-0 items-center justify-center text-lg font-bold ${i < 3 ? MEDAL_STYLE[i] : "text-muted"}`}>
                    {i < 3 ? <Icon name="award" size={22} /> : `#${i + 1}`}
                  </span>
                  {r.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.photo_url} alt="" className="h-11 w-11 shrink-0 rounded-full" />
                  ) : (
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 font-bold text-white">
                      {(r.name || "R")[0].toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{r.name}</p>
                    <p className="text-muted text-xs">
                      {tab === "top"
                        ? `${r.reads} books read${r.favoriteGenre ? ` · loves ${r.favoriteGenre}` : ""}`
                        : `${r.followers} follower${r.followers === 1 ? "" : "s"}`}
                    </p>
                  </div>
                </Link>
                <FollowButton type="reader" id={r.id} label="Follow" />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState title={tr("noReadersFound")} subtitle={tr("noResultsTryAdjusting")} />
      )}
    </div>
  );
}
