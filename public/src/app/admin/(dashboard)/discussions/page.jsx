"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

export default function AdminDiscussionsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/discussions?page=${page}`).then((r) => r.json())
      .then((d) => { setRows(d.rows || []); setTotal(d.total || 0); setPages(d.pages || 1); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (id) => {
    if (!confirm("Delete this discussion and all its replies?")) return;
    await fetch("/api/admin/discussions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-white"><Icon name="bookOpen" size={20} /> Discussions</h1>
      <p className="text-muted mt-1 text-sm">{total.toLocaleString()} community threads</p>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-muted text-xs uppercase tracking-wide">
            <tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Author</th><th className="px-4 py-3">Replies</th><th className="px-4 py-3">Created</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="text-muted px-4 py-8 text-center">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="text-muted px-4 py-8 text-center">No discussions yet.</td></tr>
            ) : rows.map((d) => (
              <tr key={d.id} className="hover:bg-white/5">
                <td className="max-w-xs truncate px-4 py-3 text-slate-300">
                  <Link href={`/community/${d.id}`} target="_blank" className="hover:text-brand-400">{d.title}</Link>
                </td>
                <td className="px-4 py-3 text-slate-400">{d.name}</td>
                <td className="px-4 py-3 text-slate-400">{d.replies}</td>
                <td className="px-4 py-3 text-slate-400">{d.created_at?.slice(0, 10)}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => remove(d.id)} className="text-red-400 hover:underline">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
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
