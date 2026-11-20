"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

// Admin -> Data quality: how complete the catalog is, with a few concrete rows to fix for each problem.
export default function QualityPage() {
  const [r, setR] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = (refresh) => {
    setBusy(true); setErr("");
    fetch("/api/admin/quality", refresh ? { method: "POST" } : undefined)
      .then((x) => (x.ok ? x.json() : Promise.reject()))
      .then(setR).catch(() => setErr("Couldn't compute the report. Is the catalog database available?"))
      .finally(() => setBusy(false));
  };
  useEffect(() => { load(false); }, []);

  const tone = (c) => (c.count == null ? "text-muted" : c.count === 0 ? "text-emerald-400" : c.pct != null && c.pct > 10 ? "text-red-400" : "text-amber-300");

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-white"><Icon name="shieldCheck" size={20} /> Data quality</h1>
      <p className="text-muted mt-1 max-w-2xl text-sm">
        How complete the catalog is. The report reads every book once, so it is computed on demand and kept for a day. Use Recompute after an import or a clean-up.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={() => load(true)} disabled={busy} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15 disabled:opacity-50">{busy ? "Working…" : "Recompute"}</button>
        {r && <span className="text-muted text-xs">Computed {new Date(r.computedAt).toLocaleString()} for {r.books.toLocaleString()} books ({r.lang})</span>}
      </div>
      {err && <p role="alert" className="mt-4 text-sm text-red-400">{err}</p>}
      {r && (
        <>
          <section className="mt-5 flex items-center gap-4 rounded-2xl border border-white/10 bg-[#131c31] p-5">
            <p className="text-5xl font-bold text-white">{r.score ?? "–"}<span className="text-muted text-base font-normal">/100</span></p>
            <p className="text-muted text-sm">Share of books that pass the five checks visitors notice most: cover, description, author, category and ISBN.</p>
          </section>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {r.checks.map((c) => (
              <li key={c.key} className="rounded-2xl border border-white/10 bg-[#131c31] p-4">
                <p className={`text-2xl font-bold ${tone(c)}`}>{c.count == null ? "n/a" : c.count.toLocaleString()}{c.pct != null && c.count > 0 ? <span className="text-muted ms-2 text-sm font-normal">{c.pct}%</span> : null}</p>
                <p className="text-muted text-xs">{c.label}</p>
                {r.samples[c.key]?.length > 0 && (
                  <ul className="mt-2 space-y-0.5 text-xs">
                    {r.samples[c.key].map((s) => (
                      <li key={s.id} className="truncate"><Link href={`/admin/books/${s.id}`} className="text-brand-400 hover:underline">{s.title}</Link>{s.isbn ? <span className="text-muted"> · {s.isbn}</span> : null}{s.n ? <span className="text-muted"> · {s.n} editions</span> : null}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
