"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

export default function AdminReviewsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/reviews?page=${page}`).then((r) => r.json())
      .then((d) => { setRows(d.rows || []); setTotal(d.total || 0); setPages(d.pages || 1); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (userId, bookSlug) => {
    if (!confirm("Remove this review?")) return;
    await fetch("/api/admin/reviews", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, bookSlug }) });
    load();
  };

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-white"><Icon name="star" size={20} /> Reviews</h1>
      <p className="text-muted mt-1 text-sm">{total.toLocaleString()} published reviews — moderate as needed</p>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-muted text-sm">No reviews yet.</p>
        ) : rows.map((r) => (
          <div key={`${r.user_id}-${r.book_slug}`} className="rounded-2xl border border-white/10 bg-[#131c31] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">
                <span className="font-semibold text-white">{r.name}</span>
                <span className="text-muted"> on </span>
                <Link href={`/books/${encodeURIComponent(r.book_slug)}`} target="_blank" className="text-brand-400 hover:underline">{r.title || r.book_slug}</Link>
                {r.rating && <span className="ml-2 text-amber-400">{"★".repeat(r.rating)}</span>}
                {r.spoiler ? <span className="ml-2 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-400">SPOILER</span> : null}
              </div>
              <button onClick={() => remove(r.user_id, r.book_slug)} className="shrink-0 text-xs text-red-400 hover:underline">Remove</button>
            </div>
            <p className="text-muted mt-2 line-clamp-3 text-sm">{r.review}</p>
            <p className="text-muted mt-1 text-[11px]">{r.updated_at?.slice(0, 10)}</p>
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-white/10 px-3 py-1.5 disabled:opacity-30">←</button>
          <span className="text-muted">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-white/10 px-3 py-1.5 disabled:opacity-30">→</button>
        </div>
      )}
    </div>
  );
}
