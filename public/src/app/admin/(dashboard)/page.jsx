"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

// Deliberately minimal. This page was ~600 lines and drove the entire bulk
// import from the browser: burst sizing, a 6-second polling loop, idle
// detection, progress/ETA maths, plus charts (signups per month, reads per
// month, top countries, by-language) that nobody acted on and that cost a
// pile of GROUP BYs on every load.
//
// The import now has its own live dashboard on the cron worker itself
// (start/stop, pipeline view, health), which is where that belongs — it
// keeps running whether or not a browser is open. What's left here is the
// part an admin actually opens this page for: how much content exists,
// what needs moderating, and where to go next.
const IMPORT_DASHBOARD_URL = "https://bookqubit-import-cron.webpagewale.workers.dev";

const CONTENT = [
  ["books", "book", "Books"],
  ["authors", "feather", "Authors"],
  ["publications", "building", "Publishers"],
  ["comics", "zap", "Comics"],
];

const COMMUNITY = [
  ["users", "users", "Readers"],
  ["reviews", "star", "Reviews"],
  ["discussions", "bookOpen", "Discussions"],
];

const MODERATION = [
  ["reports", "Reports", "shieldCheck"],
  ["contact", "Contact", "feather"],
  ["requests", "Book Requests", "bookmark"],
];

const card = "rounded-2xl border border-white/10 bg-[#131c31] p-5";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("stats failed"))))
      .then(setStats)
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <div className={card}>
        <p className="text-sm text-red-400">Couldn’t load stats. Refresh to retry.</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${card} h-24 animate-pulse`} />
        ))}
      </div>
    );
  }

  const n = (v) => (v || 0).toLocaleString();
  const pendingTotal =
    (stats.pending.reports || 0) + (stats.pending.contact || 0) + (stats.pending.requests || 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-muted text-sm">Catalog and community at a glance.</p>
        </div>
        <a
          href={IMPORT_DASHBOARD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-brand-500/60"
        >
          <Icon name="zap" size={14} /> Import dashboard
        </a>
      </div>

      {/* Catalog — counts come from the maintained catalog_counts row, so
          this costs one row lookup rather than a scan per table. */}
      <p className="text-muted mb-2 text-[11px] font-semibold uppercase tracking-wide">Catalog</p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {CONTENT.map(([key, icon, label]) => (
          <Link key={key} href={`/admin/${key}`} className={`${card} transition hover:border-brand-500/50`}>
            <div className="flex items-center justify-between">
              <Icon name={icon} size={16} className="text-brand-400" />
              <Icon name="arrowRight" size={13} className="text-muted" />
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{n(stats.counts[key])}</p>
            <p className="text-muted text-xs">{label}</p>
          </Link>
        ))}
      </div>

      {/* Community */}
      <p className="text-muted mb-2 mt-6 text-[11px] font-semibold uppercase tracking-wide">Community</p>
      <div className="grid grid-cols-3 gap-4">
        {COMMUNITY.map(([key, icon, label]) => (
          <div key={key} className={card}>
            <Icon name={icon} size={16} className="text-brand-400" />
            <p className="mt-3 text-2xl font-bold text-white">{n(stats.counts[key])}</p>
            <p className="text-muted text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Moderation — the one thing on this page that's actually a to-do
          list, so it says plainly whether anything needs attention. */}
      <p className="text-muted mb-2 mt-6 text-[11px] font-semibold uppercase tracking-wide">
        Moderation {pendingTotal > 0 && <span className="text-amber-400">· {pendingTotal} pending</span>}
      </p>
      <div className="grid grid-cols-3 gap-4">
        {MODERATION.map(([key, label, icon]) => {
          const count = stats.pending[key] || 0;
          return (
            <Link
              key={key}
              href={`/admin/${key}`}
              className={`${card} text-center transition ${
                count > 0 ? "!border-amber-500/40 hover:!border-amber-500/70" : "hover:border-brand-500/50"
              }`}
            >
              <Icon name={icon} size={16} className={`mx-auto ${count > 0 ? "text-amber-400" : "text-muted"}`} />
              <p className="mt-2 text-lg font-bold text-white">{count}</p>
              <p className="text-muted text-[11px]">{label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/books/new" className="btn-primary !py-2 text-sm">
          <Icon name="book" size={14} /> Add a book
        </Link>
        <Link href="/admin/settings" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-brand-500/60">
          Settings
        </Link>
      </div>
    </div>
  );
}
