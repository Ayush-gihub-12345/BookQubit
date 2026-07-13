"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { useToast } from "@/components/Toast";

// Safety cap on how many chunks a single "Run Now" click will walk through
// automatically (at 500 books/chunk, 30 chunks = up to 15,000 books) — the
// daily cap enforced server-side is the real limit; this just keeps one
// click from running forever in the browser.
const MAX_CLICK_CHUNKS = 30;

const CARDS = [
  ["books", "book", "Books"],
  ["authors", "feather", "Authors"],
  ["publications", "building", "Publishers"],
  ["comics", "zap", "Comics"],
  ["users", "users", "Readers"],
  ["reviews", "star", "Reviews"],
  ["discussions", "bookOpen", "Discussions"],
];

const MODERATION = [
  ["reports", "Reports", "shieldCheck"],
  ["contact", "Contact", "feather"],
  ["requests", "Book Requests", "bookmark"],
];

// Cron schedule is fixed in bulk-import/cron-worker/wrangler.jsonc ("0 */3 * * *")
// — every 3 hours, on the hour, UTC. Computed here rather than fetched, since
// Cloudflare doesn't expose a "next invocation" API; this just walks forward
// from now to the next UTC hour that's a multiple of 3.
function nextCronRun() {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), 0, 0, 0));
  while (next.getUTCHours() % 3 !== 0 || next <= now) {
    next.setUTCHours(next.getUTCHours() + 1);
  }
  return next;
}

export default function AdminDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [importChunks, setImportChunks] = useState(null);
  const [running, setRunning] = useState(false);
  const [importLog, setImportLog] = useState([]); // most-recent-first, one entry per chunk
  const [expandedLog, setExpandedLog] = useState(null);
  const stopRequested = useRef(false);

  const loadImportStatus = () =>
    fetch("/api/admin/import-status").then((r) => r.json()).then((d) => {
      setImportStatus(d.progress);
      setImportChunks(d.chunks);
    });

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
    loadImportStatus();
  }, []);

  // Processes one chunk per call and loops automatically, so the dashboard
  // can show live per-chunk progress instead of one silent multi-thousand-
  // book batch. Stops on: empty queue, daily cap hit, the safety iteration
  // cap, or the user clicking Stop.
  const runImportNow = async () => {
    setRunning(true);
    stopRequested.current = false;
    let sessionImported = 0;
    let iterations = 0;

    try {
      while (iterations < MAX_CLICK_CHUNKS && !stopRequested.current) {
        iterations += 1;
        const r = await fetch("/api/admin/import-run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ maxChunks: 1 }),
        });
        const d = await r.json();
        if (!r.ok) { toast([d.error, d.detail].filter(Boolean).join(" — ") || "Import run failed", "error"); break; }

        if (d.capped) {
          toast("Daily write cap reached — try again tomorrow.", "info");
          break;
        }
        if (d.chunksProcessed === 0) {
          if (iterations === 1) toast("Nothing to import — the queue is empty.", "info");
          break;
        }

        sessionImported += d.imported;
        setImportLog((prev) => [
          { id: `${Date.now()}-${iterations}`, imported: d.imported, skipped: d.skipped, titles: d.insertedTitles, time: new Date() },
          ...prev,
        ].slice(0, 50)); // bounded so the DOM doesn't grow unboundedly across a long session
        setImportChunks((prev) => prev && { ...prev, done: prev.done + 1 });

        if (d.remainingChunks === 0) break;
      }

      if (sessionImported > 0) toast(`Imported ${sessionImported.toLocaleString()} books this run.`);
      await loadImportStatus();
    } finally {
      setRunning(false);
    }
  };

  const stopImport = () => { stopRequested.current = true; };

  if (!stats) return <p className="text-muted text-sm">Loading dashboard…</p>;

  const pendingTotal = (stats.pending?.reports || 0) + (stats.pending?.contact || 0) + (stats.pending?.requests || 0);
  const maxSignups = Math.max(1, ...stats.signupsByMonth.map((m) => m.n));
  const maxReads = Math.max(1, ...stats.readsByMonth.map((m) => m.n));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="text-muted mt-1 text-sm">Platform overview and quick analytics</p>

      {/* Global reach */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f2018] p-4">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Icon name="globe" size={17} />
          </span>
          <p className="mt-3 text-2xl font-extrabold text-white">{stats.globalReach.countries}</p>
          <p className="text-muted text-xs">Countries in catalog</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-[#0f2018] p-4">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Icon name="palette" size={17} />
          </span>
          <p className="mt-3 text-2xl font-extrabold text-white">{stats.globalReach.languages}</p>
          <p className="text-muted text-xs">Languages in catalog</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#131c31] p-4">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600/15 text-brand-400">
            <Icon name="trendingUp" size={17} />
          </span>
          <p className="mt-3 text-2xl font-extrabold text-white">{stats.newUsers7d}</p>
          <p className="text-muted text-xs">New readers (7d)</p>
        </div>
        <Link href="/admin/reports"
          className={`rounded-2xl border p-4 transition ${pendingTotal > 0 ? "border-amber-500/30 bg-[#1c1a12] hover:border-amber-500/60" : "border-white/10 bg-[#131c31]"}`}>
          <span className={`grid h-9 w-9 place-items-center rounded-xl ${pendingTotal > 0 ? "bg-amber-500/15 text-amber-400" : "bg-brand-600/15 text-brand-400"}`}>
            <Icon name="bell" size={17} />
          </span>
          <p className="mt-3 text-2xl font-extrabold text-white">{pendingTotal}</p>
          <p className="text-muted text-xs">Pending moderation</p>
        </Link>
      </div>

      {/* Entity counts */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CARDS.map(([key, icon, label]) => (
          <Link key={key} href={`/admin/${key}`}
            className="rounded-2xl border border-white/10 bg-[#131c31] p-4 transition hover:border-brand-500/50">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600/15 text-brand-400">
              <Icon name={icon} size={17} />
            </span>
            <p className="mt-3 text-2xl font-extrabold text-white">{stats.counts[key]?.toLocaleString?.() ?? stats.counts[key]}</p>
            <p className="text-muted text-xs">{label}</p>
          </Link>
        ))}
      </div>

      {/* Growth trends */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#131c31] p-5">
          <p className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
            <Icon name="trendingUp" size={15} className="text-brand-400" /> New readers, last 6 months
          </p>
          <div className="flex h-24 items-end gap-2">
            {stats.signupsByMonth.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-semibold text-white">{m.n > 0 ? m.n : ""}</span>
                <div className="w-full rounded-t bg-brand-500/70" style={{ height: `${Math.max(3, (m.n / maxSignups) * 70)}px` }} />
                <span className="text-muted text-[10px]">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#131c31] p-5">
          <p className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
            <Icon name="bookOpen" size={15} className="text-emerald-400" /> Books finished, last 6 months
          </p>
          <div className="flex h-24 items-end gap-2">
            {stats.readsByMonth.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-semibold text-white">{m.n > 0 ? m.n : ""}</span>
                <div className="w-full rounded-t bg-emerald-500/70" style={{ height: `${Math.max(3, (m.n / maxReads) * 70)}px` }} />
                <span className="text-muted text-[10px]">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global distribution */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#131c31] p-5">
          <p className="mb-3 text-sm font-bold text-white">Catalog by Country</p>
          <div className="flex flex-wrap gap-2">
            {stats.topCountries.map((c) => (
              <span key={c.country} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                {c.country} <span className="text-white/40">· {c.n}</span>
              </span>
            ))}
            {!stats.topCountries.length && <p className="text-muted text-sm">No data yet.</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#131c31] p-5">
          <p className="mb-3 text-sm font-bold text-white">Catalog by Language</p>
          <div className="flex flex-wrap gap-2">
            {stats.byLanguage.map((l) => (
              <span key={l.lang} className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase text-slate-300">
                {l.lang} <span className="text-white/40 normal-case">· {l.n}</span>
              </span>
            ))}
            {!stats.byLanguage.length && <p className="text-muted text-sm">No data yet.</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#131c31] p-5">
          <p className="mb-3 text-sm font-bold text-white">Top Rated Books</p>
          <div className="space-y-2">
            {stats.topRated.map((b, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted truncate">{b.title} <span className="text-white/40">· {b.author}</span></span>
                <span className="shrink-0 text-amber-400">★ {b.rating}</span>
              </div>
            ))}
            {!stats.topRated.length && <p className="text-muted text-sm">No data yet.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#131c31] p-5">
          <p className="mb-3 text-sm font-bold text-white">Most Active Readers</p>
          <div className="space-y-2">
            {stats.mostActive.map((u, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted truncate">{u.name}</span>
                <span className="shrink-0 text-white/60">{u.n} shelf actions</span>
              </div>
            ))}
            {!stats.mostActive.length && <p className="text-muted text-sm">No data yet.</p>}
          </div>
        </div>
      </div>

      {/* Moderation queue */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-[#131c31] p-5">
        <p className="mb-3 text-sm font-bold text-white">Moderation Queue</p>
        <div className="grid grid-cols-3 gap-3">
          {MODERATION.map(([key, label, icon]) => (
            <Link key={key} href={`/admin/${key}`}
              className={`rounded-xl border p-3 text-center transition ${stats.pending[key] > 0 ? "border-amber-500/30 hover:border-amber-500/60" : "border-white/10 hover:border-brand-500/50"}`}>
              <Icon name={icon} size={16} className={stats.pending[key] > 0 ? "mx-auto text-amber-400" : "text-muted mx-auto"} />
              <p className="mt-2 text-lg font-bold text-white">{stats.pending[key] || 0}</p>
              <p className="text-muted text-[11px]">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Bulk import (Open Library cron worker) */}
      {importStatus && importChunks && (() => {
        const queueEmpty = importChunks.total > 0 && importChunks.done >= importChunks.total;
        const capReached = importStatus.imported_today >= importStatus.daily_cap;
        const runDisabled = running || queueEmpty || capReached;
        return (
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#131c31] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-bold text-white">
              <Icon name="trendingUp" size={15} className="text-brand-400" /> Bulk Import (Open Library)
            </p>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                queueEmpty ? "bg-emerald-500/15 text-emerald-400" : "bg-brand-600/15 text-brand-400"
              }`}>
                {queueEmpty ? "Queue empty" : "In progress"}
              </span>
              {running ? (
                <button onClick={stopImport} className="btn-ghost !px-3 !py-1.5 text-xs !border-red-500/40 !text-red-400">
                  <Icon name="x" size={13} /> Stop
                </button>
              ) : (
                <button
                  onClick={runImportNow}
                  disabled={runDisabled}
                  title={capReached ? "Daily write cap reached — resets at UTC midnight" : queueEmpty ? "Nothing queued to import" : "Run import passes now"}
                  className="btn-primary !px-3 !py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon name="zap" size={13} /> Run Now
                </button>
              )}
            </div>
          </div>
          <p className="text-muted mt-2 text-[11px]">
            Daily write cap: {(importStatus.imported_today || 0).toLocaleString()} / {importStatus.daily_cap.toLocaleString()} used today
            {capReached && <span className="text-amber-400"> — resets at UTC midnight</span>}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div>
              <p className="text-lg font-bold text-white">{importStatus.total_imported.toLocaleString()}</p>
              <p className="text-muted text-[11px]">Imported</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{importStatus.total_skipped.toLocaleString()}</p>
              <p className="text-muted text-[11px]">Skipped (duplicates)</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{importChunks.done} / {importChunks.total}</p>
              <p className="text-muted text-[11px]">Chunks processed</p>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{importStatus.last_run_at ? new Date(importStatus.last_run_at).toLocaleString() : "—"}</p>
              <p className="text-muted text-[11px]">Last run</p>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-400">
                {queueEmpty
                  ? "Queue empty"
                  : nextCronRun().toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-muted text-[11px]">Next scheduled run</p>
            </div>
          </div>
          {importChunks.total > 0 && (
            <div className="bg-line mt-4 h-1.5 w-full overflow-hidden rounded-full">
              <div className="h-full bg-brand-500" style={{ width: `${Math.min(100, (importChunks.done / importChunks.total) * 100)}%` }} />
            </div>
          )}

          {(running || importLog.length > 0) && (
            <div className="border-line mt-4 border-t pt-4">
              <p className="text-muted mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                {running && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />}
                Live import activity
              </p>
              <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                {running && importLog.length === 0 && (
                  <p className="text-muted text-xs">Starting…</p>
                )}
                {importLog.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-white/10 bg-[#0d1526] p-2.5">
                    <button
                      onClick={() => setExpandedLog(expandedLog === entry.id ? null : entry.id)}
                      className="flex w-full items-center justify-between gap-2 text-left"
                    >
                      <span className="text-xs text-slate-300">
                        <span className="font-semibold text-emerald-400">+{entry.imported}</span> imported
                        {entry.skipped > 0 && <span className="text-muted"> · {entry.skipped} duplicate{entry.skipped === 1 ? "" : "s"}</span>}
                      </span>
                      <span className="text-muted flex shrink-0 items-center gap-1.5 text-[10px]">
                        {entry.time.toLocaleTimeString()}
                        <Icon name="chevronDown" size={11} className={expandedLog === entry.id ? "rotate-180" : ""} />
                      </span>
                    </button>
                    {expandedLog === entry.id && entry.titles.length > 0 && (
                      <ul className="mt-2 max-h-40 space-y-0.5 overflow-y-auto border-t border-white/10 pt-2">
                        {entry.titles.map((title, i) => (
                          <li key={i} className="text-muted truncate text-[11px]">
                            <Icon name="check" size={10} className="mr-1 inline text-emerald-500" /> {title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        );
      })()}
    </div>
  );
}
