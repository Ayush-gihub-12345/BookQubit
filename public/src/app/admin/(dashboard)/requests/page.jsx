"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

const STATUS_STYLE = {
  pending: "border-amber-500/30 bg-[#1c1a12]",
  added: "border-emerald-500/30 bg-[#10201a] opacity-70",
  declined: "border-white/10 bg-[#131c31] opacity-50",
};

export default function AdminRequestsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/requests?page=${page}`).then((r) => r.json())
      .then((d) => { setRows(d.rows || []); setTotal(d.total || 0); setPages(d.pages || 1); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const setStatus = async (id, status) => {
    await fetch("/api/admin/requests", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    load();
  };
  const remove = async (id) => {
    if (!confirm("Delete this request?")) return;
    await fetch("/api/admin/requests", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-white"><Icon name="bookmark" size={20} /> Book Requests</h1>
      <p className="text-muted mt-1 text-sm">{total.toLocaleString()} requests — pending shown first</p>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-muted text-sm">No requests yet.</p>
        ) : rows.map((r) => (
          <div key={r.id} className={`rounded-2xl border p-4 ${STATUS_STYLE[r.status] || STATUS_STYLE.pending}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">
                <span className="font-semibold text-white">{r.title}</span>
                {r.author && <span className="text-muted ml-2">by {r.author}</span>}
                <span className="text-muted ml-2 text-xs">
                  {r.user_name ? `requested by ${r.user_name}` : "anonymous"} · {r.created_at?.slice(0, 10)}
                </span>
              </div>
              <div className="flex shrink-0 gap-3 text-xs">
                {r.status !== "added" && (
                  <button onClick={() => setStatus(r.id, "added")} className="text-emerald-400 hover:underline">Mark added</button>
                )}
                {r.status !== "declined" && (
                  <button onClick={() => setStatus(r.id, "declined")} className="text-muted hover:underline">Decline</button>
                )}
                {r.status !== "pending" && (
                  <button onClick={() => setStatus(r.id, "pending")} className="text-brand-400 hover:underline">Reset</button>
                )}
                <button onClick={() => remove(r.id)} className="text-red-400 hover:underline">Delete</button>
              </div>
            </div>
            {r.note && <p className="mt-2 text-sm text-slate-300">{r.note}</p>}
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
