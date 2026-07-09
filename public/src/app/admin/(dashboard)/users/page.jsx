"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

export const dynamicParams = true;

export default function AdminUsersPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), ...(q ? { q } : {}) });
    fetch(`/api/admin/users?${qs}`).then((r) => r.json())
      .then((d) => { setRows(d.rows || []); setTotal(d.total || 0); setPages(d.pages || 1); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (id) => {
    if (!confirm("Delete this user and all their shelf data, follows, and discussions?")) return;
    await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white"><Icon name="users" size={20} /> Users</h1>
          <p className="text-muted mt-1 text-sm">{total.toLocaleString()} registered readers</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }} className="relative">
          <Icon name="search" size={13} className="text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name…"
            className="w-48 rounded-lg border border-white/10 bg-[#131c31] py-2 pl-8 pr-3 text-sm text-white outline-none focus:border-brand-500" />
        </form>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-muted text-xs uppercase tracking-wide">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Shelf entries</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={4} className="text-muted px-4 py-8 text-center">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={4} className="text-muted px-4 py-8 text-center">No users found.</td></tr>
            ) : rows.map((u) => (
              <tr key={u.id} className="hover:bg-white/5">
                <td className="flex items-center gap-2.5 px-4 py-3 text-slate-300">
                  {u.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.photo_url} alt="" className="h-6 w-6 rounded-full" />
                  ) : (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-[10px] font-bold text-white">{(u.name || "R")[0]}</span>
                  )}
                  {u.name}
                </td>
                <td className="px-4 py-3 text-slate-400">{u.created_at?.slice(0, 10)}</td>
                <td className="px-4 py-3 text-slate-400">{u.shelf_count}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => remove(u.id)} className="text-red-400 hover:underline">Delete</button></td>
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
