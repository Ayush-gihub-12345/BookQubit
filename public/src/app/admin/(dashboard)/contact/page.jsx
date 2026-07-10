"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

export default function AdminContactPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/contact?page=${page}`).then((r) => r.json())
      .then((d) => { setRows(d.rows || []); setTotal(d.total || 0); setPages(d.pages || 1); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async (id, resolved) => {
    await fetch("/api/admin/contact", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, resolved }) });
    load();
  };
  const remove = async (id) => {
    if (!confirm("Delete this message?")) return;
    await fetch("/api/admin/contact", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-white"><Icon name="feather" size={20} /> Contact Messages</h1>
      <p className="text-muted mt-1 text-sm">{total.toLocaleString()} messages — unresolved shown first</p>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-muted text-sm">No messages yet.</p>
        ) : rows.map((r) => (
          <div key={r.id} className={`rounded-2xl border p-4 ${r.resolved ? "border-white/10 bg-[#131c31] opacity-60" : "border-amber-500/30 bg-[#1c1a12]"}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">
                <span className="font-semibold text-white">{r.name || "Anonymous"}</span>
                <a href={`mailto:${r.email}`} className="ml-2 text-brand-400 hover:underline">{r.email}</a>
                <span className="text-muted ml-2 text-xs">{r.created_at?.slice(0, 10)}</span>
              </div>
              <div className="flex shrink-0 gap-3 text-xs">
                <button onClick={() => toggle(r.id, !r.resolved)} className="text-brand-400 hover:underline">
                  {r.resolved ? "Mark unresolved" : "Mark resolved"}
                </button>
                <button onClick={() => remove(r.id)} className="text-red-400 hover:underline">Delete</button>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-300">{r.message}</p>
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
