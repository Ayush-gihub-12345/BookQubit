"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

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

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => { fetch("/api/admin/stats").then((r) => r.json()).then(setStats); }, []);

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
    </div>
  );
}
