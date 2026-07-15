"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { useToast } from "@/components/Toast";

// How many chunks a single "Run Now" click asks the worker to run
// (at ~10 books/chunk, 50 = up to ~500 books). The worker itself chains
// through all of these server-side (see cron-worker/src/index.js's burst
// handling) — the browser only needs to make one request to kick it off,
// and the import keeps running in Cloudflare's infrastructure even if this
// tab is closed. The daily write cap enforced server-side is the real ceiling.
const BURST_CHUNKS = 50;
// How often to poll import-status while a burst is running, to show totals
// climbing live. Stops automatically once totals haven't moved for a while.
const POLL_INTERVAL_MS = 6000;
const POLL_IDLE_STOPS = 3; // consecutive no-change polls before we assume it's done

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
  const [importLog, setImportLog] = useState([]); // most-recent-first, one entry per poll/chunk
  const [expandedLog, setExpandedLog] = useState(null);
  const pollTimer = useRef(null);
  const idlePolls = useRef(0);

  const loadImportStatus = () =>
    fetch("/api/admin/import-status").then((r) => r.json()).then((d) => {
      setImportStatus(d.progress);
      setImportChunks(d.chunks);
      return d.progress;
    });

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
    loadImportStatus();
    return () => clearTimeout(pollTimer.current);
  }, []);

  // The actual import now runs server-side (the worker chains itself via a
  // self service-binding + ctx.waitUntil — see cron-worker/src/index.js),
  // so it survives this tab closing. This just polls import_progress's
  // running totals to show live progress, and stops polling once totals
  // haven't moved for a few checks in a row (burst finished, cap hit, or
  // someone hit Stop).
  const pollProgress = (prevTotals) => {
    pollTimer.current = setTimeout(async () => {
      const progress = await loadImportStatus().catch(() => null);
      if (!progress) { pollProgress(prevTotals); return; }

      const totals = {
        imported: progress.total_imported, authors: progress.total_authors_imported || 0,
        publishers: progress.total_publishers_imported || 0,
      };
      const delta = {
        imported: totals.imported - prevTotals.imported,
        authors: totals.authors - prevTotals.authors,
        publishers: totals.publishers - prevTotals.publishers,
      };
      const moved = delta.imported > 0 || delta.authors > 0 || delta.publishers > 0;

      if (moved) {
        idlePolls.current = 0;
        setImportLog((prev) => [
          { id: `${Date.now()}`, imported: delta.imported, skipped: 0, authorsImported: delta.authors, publishersImported: delta.publishers, source: null, titles: [], time: new Date() },
          ...prev,
        ].slice(0, 50));
      } else {
        idlePolls.current += 1;
      }

      const capReached = progress.imported_today >= progress.daily_cap;
      if (capReached || idlePolls.current >= POLL_IDLE_STOPS) {
        setRunning(false);
        if (capReached) toast("Daily write cap reached — try again tomorrow.", "info");
        return;
      }
      pollProgress(totals);
    }, POLL_INTERVAL_MS);
  };

  // Kicks off a server-side burst (the worker chains through BURST_CHUNKS
  // on its own) and starts polling for progress — one request is enough;
  // closing this tab afterward does not stop the import.
  const runImportNow = async () => {
    setRunning(true);
    idlePolls.current = 0;
    try {
      const r = await fetch("/api/admin/import-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ burst: BURST_CHUNKS }),
      });
      const d = await r.json();
      if (!r.ok) {
        toast([d.error, d.detail].filter(Boolean).join(" — ") || "Import run failed", "error");
        setRunning(false);
        return;
      }
      if (d.capped) {
        toast("Daily write cap reached — try again tomorrow.", "info");
        setRunning(false);
        return;
      }
      const nothingHappened = d.imported === 0 && d.authorsImported === 0 && d.publishersImported === 0 && d.chunksProcessed === 0;
      if (nothingHappened) {
        toast("Nothing imported this pass — try again shortly.", "info");
        setRunning(false);
        return;
      }
      setImportLog((prev) => [
        { id: `${Date.now()}-0`, imported: d.imported, skipped: d.skipped, authorsImported: d.authorsImported || 0, publishersImported: d.publishersImported || 0, source: d.source, titles: d.insertedTitles, time: new Date() },
        ...prev,
      ].slice(0, 50));
      toast("Import started — running in the background, safe to leave this page.");

      const progress = await loadImportStatus();
      pollProgress({
        imported: progress.total_imported, authors: progress.total_authors_imported || 0,
        publishers: progress.total_publishers_imported || 0,
      });
    } catch {
      toast("Import run failed to start.", "error");
      setRunning(false);
    }
  };

  const stopImport = async () => {
    clearTimeout(pollTimer.current);
    setRunning(false);
    try {
      await fetch("/api/admin/import-stop", { method: "POST" });
      toast("Stop requested — the current chunk will finish, then the import halts.", "info");
    } catch {
      toast("Failed to send stop request.", "error");
    }
  };

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
                <span className="shrink-0 text-amber-400">★ {Number(b.rating).toFixed(1)}</span>
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
        // Note: a queue being empty does NOT mean there's nothing to do — the
        // live Open Library fetch runs regardless of whether a local queue
        // was ever loaded, so it's not a reason to disable "Run Now".
        const runDisabled = running || capReached;
        const pct = importChunks.total > 0 ? Math.min(100, (importChunks.done / importChunks.total) * 100) : 0;
        const capPct = importStatus.daily_cap > 0 ? Math.min(100, (importStatus.imported_today / importStatus.daily_cap) * 100) : 0;

        // Rough ETA: infer avg books/chunk from what's actually been processed
        // so far, then project it across the chunks still queued.
        const totalProcessed = importStatus.total_imported + importStatus.total_skipped;
        const avgPerChunk = importChunks.done > 0 ? totalProcessed / importChunks.done : null;
        const remainingChunks = Math.max(0, importChunks.total - importChunks.done);
        const estRemainingBooks = avgPerChunk ? Math.round(avgPerChunk * remainingChunks) : null;
        const estDaysLeft = estRemainingBooks && importStatus.daily_cap
          ? Math.max(1, Math.ceil(estRemainingBooks / importStatus.daily_cap))
          : null;

        const ringColor = queueEmpty ? "text-emerald-400" : capReached ? "text-amber-400" : "text-brand-400";
        const RADIUS = 20;
        const CIRC = 2 * Math.PI * RADIUS;

        return (
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#131c31] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-[52px] w-[52px] shrink-0">
                <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
                  <circle cx="26" cy="26" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                  <circle
                    cx="26" cy="26" r={RADIUS} fill="none" strokeWidth="5" strokeLinecap="round"
                    stroke="currentColor" className={ringColor}
                    strokeDasharray={CIRC}
                    strokeDashoffset={CIRC - (pct / 100) * CIRC}
                    style={{ transition: "stroke-dashoffset 0.4s ease" }}
                  />
                </svg>
                <span className="absolute inset-0 grid place-items-center text-[11px] font-bold text-white">
                  {importChunks.total > 0 ? `${Math.round(pct)}%` : "—"}
                </span>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-white">
                  <Icon name="trendingUp" size={15} className="text-brand-400" /> Bulk Import (Open Library)
                </p>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  capReached ? "bg-amber-500/15 text-amber-400" : "bg-brand-600/15 text-brand-400"
                }`}>
                  {capReached ? "Daily cap reached" : running ? "Running now…" : "In progress"}
                </span>
              </div>
            </div>
            {running ? (
              <button onClick={stopImport} className="btn-ghost !px-3 !py-1.5 text-xs !border-red-500/40 !text-red-400">
                <Icon name="x" size={13} /> Stop
              </button>
            ) : (
              <button
                onClick={runImportNow}
                disabled={runDisabled}
                title={capReached ? "Daily write cap reached — resets at UTC midnight" : "Run import passes now"}
                className="btn-primary !px-3 !py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="zap" size={13} /> Run Now
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px]">
            <p className="text-muted">
              Daily write cap: {(importStatus.imported_today || 0).toLocaleString()} / {importStatus.daily_cap.toLocaleString()} used today
              {capReached && <span className="text-amber-400"> — resets at UTC midnight</span>}
            </p>
            <p className="text-muted">{Math.round(capPct)}%</p>
          </div>
          <div className="bg-line mt-1.5 h-1.5 w-full overflow-hidden rounded-full">
            <div className={`h-full ${capReached ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${capPct}%` }} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            <div>
              <p className="text-lg font-bold text-white">{importStatus.total_imported.toLocaleString()}</p>
              <p className="text-muted text-[11px]">Books imported</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{importStatus.total_skipped.toLocaleString()}</p>
              <p className="text-muted text-[11px]">Skipped (duplicates)</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{(importStatus.total_authors_imported || 0).toLocaleString()}</p>
              <p className="text-muted text-[11px]">Author pages added</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{(importStatus.total_publishers_imported || 0).toLocaleString()}</p>
              <p className="text-muted text-[11px]">Publisher pages added</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{importChunks.done} / {importChunks.total}</p>
              <p className="text-muted text-[11px]">Chunks processed</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{estDaysLeft ? `~${estDaysLeft}d` : "—"}</p>
              <p className="text-muted text-[11px]">Est. time left</p>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{importStatus.last_run_at ? new Date(importStatus.last_run_at).toLocaleString() : "—"}</p>
              <p className="text-muted text-[11px]">Last run</p>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-400">
                {nextCronRun().toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-muted text-[11px]">Next scheduled run</p>
            </div>
          </div>
          {importChunks.total > 0 && (
            <div className="bg-line mt-4 h-1.5 w-full overflow-hidden rounded-full">
              <div className="h-full bg-brand-500" style={{ width: `${pct}%`, transition: "width 0.4s ease" }} />
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
                        <span className="font-semibold text-emerald-400">+{entry.imported}</span> books
                        {entry.authorsImported > 0 && <span className="text-muted"> · +{entry.authorsImported} authors</span>}
                        {entry.publishersImported > 0 && <span className="text-muted"> · +{entry.publishersImported} publishers</span>}
                        {entry.skipped > 0 && <span className="text-muted"> · {entry.skipped} duplicate{entry.skipped === 1 ? "" : "s"}</span>}
                        {entry.source && <span className="text-muted"> · {entry.source}</span>}
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
