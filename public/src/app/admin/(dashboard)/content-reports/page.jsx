"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

const LABEL = { discussion_post: "Chat message", user: "Reader", quote: "Quote", review: "Review", mindspace: "MindSpace" };

export default function AdminContentReportsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/content-reports?page=${page}`).then((r) => r.json())
      .then((d) => { setRows(d.rows || []); setTotal(d.total || 0); setPages(d.pages || 1); setUnavailable(!!d.unavailable); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const post = (method, body) => fetch("/api/admin/content-reports", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(load);

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-white"><Icon name="shieldCheck" size={20} /> Community reports</h1>
      <p className="text-muted mt-1 text-sm">{total.toLocaleString()} reports from readers about chat messages, readers and other community content. Open ones first.</p>

      {unavailable && <p className="mt-5 text-sm text-amber-300">Reports aren&apos;t set up yet. Apply migrations/main/0001_search_safety.sql to the main database.</p>}
      <div className="mt-5 space-y-3">
        {loading ? <p className="text-muted text-sm">Loading…</p> : !unavailable && rows.length === 0 ? <p className="text-muted text-sm">No reports. Nothing to review.</p> : rows.map((r) => (
          <div key={r.id} className={`rounded-2xl border p-4 ${r.resolved ? "border-white/10 bg-[#131c31] opacity-60" : "border-amber-500/30 bg-[#1c1a12]"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <span><span className="font-semibold text-white">{LABEL[r.target_type] || r.target_type}</span>
                <span className="text-muted ml-2 text-xs">{r.created_at?.slice(0, 10)} · reported {r.times_reported}×</span></span>
              <span className="flex gap-3 text-xs">
                <button onClick={() => post("PATCH", { id: r.id, resolved: !r.resolved })} className="text-brand-400 hover:underline">{r.resolved ? "Reopen" : "Mark resolved"}</button>
                {r.target_type === "discussion_post" && r.post_body != null && !r.resolved && (
                  <button onClick={() => confirm("Delete this message? This can't be undone.") && post("POST", { action: "remove", id: r.id })} className="text-red-400 hover:underline">Delete message</button>
                )}
              </span>
            </div>
            {r.post_body != null && <p className="mt-2 rounded-lg bg-black/20 p-3 text-sm text-slate-200">&ldquo;{r.post_body}&rdquo; <span className="text-muted">— {r.post_user_name || "Reader"}</span></p>}
            {r.post_body == null && <p className="text-muted mt-2 text-xs">Target: {r.target_id}</p>}
            {r.reason && <p className="mt-2 text-sm text-slate-300">Reason: {r.reason}</p>}
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
