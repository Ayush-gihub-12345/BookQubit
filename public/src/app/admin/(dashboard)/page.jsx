"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

const CARDS = [
  ["books", "book", "Books"],
  ["authors", "feather", "Authors"],
  ["publications", "building", "Publishers"],
  ["comics", "zap", "Comics"],
  ["users", "users", "Users"],
  ["reviews", "star", "Reviews"],
  ["discussions", "bookOpen", "Discussions"],
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => { fetch("/api/admin/stats").then((r) => r.json()).then(setStats); }, []);

  if (!stats) return <p className="text-muted text-sm">Loading dashboard…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="text-muted mt-1 text-sm">Platform overview and quick analytics</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
        <div className="rounded-2xl border border-white/10 bg-[#131c31] p-4">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Icon name="trendingUp" size={17} />
          </span>
          <p className="mt-3 text-2xl font-extrabold text-white">{stats.newUsers7d}</p>
          <p className="text-muted text-xs">New users (7d)</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
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
    </div>
  );
}
