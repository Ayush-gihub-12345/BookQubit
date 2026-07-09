"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

export default function AdminEntityList({ entity, label, icon, listCols }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), ...(q ? { q } : {}) });
    fetch(`/api/admin/${entity}?${qs}`)
      .then((r) => r.json())
      .then((data) => { setRows(data.rows || []); setTotal(data.total || 0); setPages(data.pages || 1); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [entity, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const search = (e) => { e.preventDefault(); setPage(1); load(); };

  const remove = async (id) => {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    await fetch(`/api/admin/${entity}/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white"><Icon name={icon} size={20} /> {label}</h1>
          <p className="text-muted mt-1 text-sm">{total.toLocaleString()} records</p>
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={search} className="relative">
            <Icon name="search" size={13} className="text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
              className="w-48 rounded-lg border border-white/10 bg-[#131c31] py-2 pl-8 pr-3 text-sm text-white outline-none focus:border-brand-500" />
          </form>
          <Link href={`/admin/${entity}/new`} className="btn-primary !py-2 text-sm">
            <Icon name="check" size={14} /> New
          </Link>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-muted text-xs uppercase tracking-wide">
            <tr>
              {listCols.map((c) => <th key={c} className="px-4 py-3 font-semibold">{c.replace(/_/g, " ")}</th>)}
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={listCols.length + 1} className="text-muted px-4 py-8 text-center">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={listCols.length + 1} className="text-muted px-4 py-8 text-center">No records found.</td></tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-white/5">
                  {listCols.map((c) => (
                    <td key={c} className="max-w-xs truncate px-4 py-3 text-slate-300">
                      {typeof row[c] === "number" && (c === "featured" || c === "bestseller" || c === "verified")
                        ? (row[c] ? "Yes" : "No")
                        : String(row[c] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/${entity}/${row.id}`} className="mr-3 text-brand-400 hover:underline">Edit</Link>
                    <button onClick={() => remove(row.id)} className="text-red-400 hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            )}
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
