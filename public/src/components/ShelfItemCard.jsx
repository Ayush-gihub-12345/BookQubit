"use client";

import { useState } from "react";
import Link from "next/link";
import BookCover from "./BookCover";
import Icon from "./Icon";

const STATUSES = [
  { id: "want", label: "Want", icon: "bookmark" },
  { id: "reading", label: "Reading", icon: "bookOpen" },
  { id: "read", label: "Read", icon: "check" },
];

// Editable shelf card for the dashboard: change status, track reading
// progress, and rate — all inline, no need to open the book page.
export default function ShelfItemCard({ entry, getIdToken, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const s = entry;

  const patch = async (fields) => {
    setBusy(true);
    onUpdate({ ...s, ...fields }); // optimistic
    try {
      await fetch("/api/shelf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: await getIdToken(), slug: s.book_slug, ...fields }),
      });
    } finally { setBusy(false); }
  };

  return (
    <div className="card overflow-hidden">
      <Link href={`/books/${encodeURIComponent(s.book_slug)}`} className="group block">
        <div className="relative aspect-[2/3] overflow-hidden bg-black/5">
          <BookCover title={s.title || s.book_slug} author={s.author} cover_url={s.cover_url}
            imgClassName="transition group-hover:scale-105" />
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
            {s.status === "read" ? "Read" : s.status === "reading" ? `Reading · ${s.progress || 0}%` : "Want to read"}
          </span>
        </div>
        <div className="p-3 pb-2">
          <p className="line-clamp-1 text-sm font-semibold">{s.title || s.book_slug}</p>
          <p className="text-muted line-clamp-1 text-xs">{s.author}</p>
          {s.rating ? <p className="mt-0.5 text-xs text-amber-400">{"★".repeat(s.rating)}</p> : null}
        </div>
      </Link>

      <button
        onClick={(e) => { e.preventDefault(); setEditing((v) => !v); }}
        className="text-muted flex w-full items-center justify-center gap-1 border-t border-line px-2 py-1.5 text-[11px] font-medium hover:text-brand-600"
      >
        <Icon name={editing ? "chevronDown" : "chevronDown"} size={11} className={editing ? "rotate-180" : ""} />
        {editing ? "Close" : "Edit"}
      </button>

      {editing && (
        <div className="space-y-3 border-t border-line p-3">
          <div className="grid grid-cols-3 gap-1">
            {STATUSES.map((st) => (
              <button
                key={st.id}
                disabled={busy}
                onClick={() => patch({ status: st.id })}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-semibold transition ${
                  s.status === st.id ? "bg-brand-600 text-white" : "border-line border hover:border-brand-500"
                }`}
              >
                <Icon name={st.icon} size={13} /> {st.label}
              </button>
            ))}
          </div>

          {s.status === "reading" && (
            <div>
              <div className="text-muted mb-1 flex justify-between text-[10px]">
                <span>Progress</span><span>{s.progress || 0}%</span>
              </div>
              <input
                type="range" min="0" max="100" step="5"
                value={s.progress || 0}
                onChange={(e) => patch({ progress: Number(e.target.value) })}
                className="w-full accent-[var(--color-brand-600)]"
              />
            </div>
          )}

          <div className="flex items-center justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} disabled={busy}
                onClick={() => patch({ rating: n, status: s.status || "read" })}
                className={`text-base transition hover:scale-125 ${(s.rating || 0) >= n ? "text-amber-400" : "text-muted opacity-30"}`}
                aria-label={`Rate ${n} stars`}
              >★</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
