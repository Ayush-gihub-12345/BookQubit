"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

const LABEL = {
  catalog: ["Catalog", "Books, authors, publishers, collections, facets and home shelves"],
  community: ["Community", "Discussions and leaderboard"],
  feed: ["Feed", "The /feed pages"],
  search: ["Search", "Cached search results"],
  settings: ["Site settings", "Admin-edited settings"],
  spaces: ["Public MindSpaces", "Server-rendered public spaces"],
};

const pct = (n, total) => (total ? `${Math.round((n / total) * 100)}%` : "–");

export default function AdminCachePage() {
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");

  const load = () => fetch("/api/admin/cache").then((r) => r.json()).then(setData).catch(() => setMsg("Couldn't load cache details."));
  useEffect(() => { load(); }, []);

  async function clear(group) {
    setBusy(group); setMsg("");
    const r = await fetch("/api/admin/cache", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ group }) });
    const j = await r.json().catch(() => ({}));
    setMsg(j.ok ? `Cleared ${group === "all" ? "all caches" : LABEL[group]?.[0] || group}. Pages rebuild as they are visited.` : j.message || "Couldn't clear that.");
    setBusy("");
    load();
  }

  if (!data) return <p className="text-muted text-sm">Loading…</p>;
  const s = data.stats;
  const answered = s.mem + s.edge + s.kv + s.d1;
  const lookups = answered + s.miss;

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-white"><Icon name="zap" size={20} /> Caches</h1>
      <p className="text-muted mt-1 max-w-2xl text-sm">
        Pages are cached in four layers (memory, edge, KV, database) for short, predictable lifetimes. Edits made here clear the catalog cache
        automatically. Use these buttons only if something looks out of date.
      </p>

      <section className="mt-6 grid gap-3 sm:grid-cols-4">
        {[["Answered from cache", pct(answered, lookups)], ["From memory", s.mem], ["From KV", s.kv], ["Rebuilt from source", s.miss]].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-white/10 bg-[#131c31] p-4">
            <p className="text-2xl font-bold text-white">{v}</p>
            <p className="text-muted text-xs">{k}</p>
          </div>
        ))}
      </section>
      <p className="text-muted mt-2 text-xs">
        Since this server instance started {Math.round(s.uptimeSeconds / 60)} min ago. Refreshed behind a response: {s.swr}. Refreshed before serving: {s.refresh}.
        Fell back to an old copy after a failed refresh: {s.staleError}. KV {data.kvBound ? (s.kvPaused ? "is paused after an error" : "is on") : "is not bound here"}.
      </p>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Clear a group</h2>
          <button onClick={() => confirm("Clear every cache group? The next visitors will rebuild pages from the database.") && clear("all")} disabled={!!busy}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white disabled:opacity-50">Clear all</button>
        </div>
        <ul className="mt-3 divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#131c31]">
          {data.groups.map((g) => (
            <li key={g} className="flex items-center justify-between gap-4 p-4">
              <span className="min-w-0">
                <span className="block font-medium text-white">{LABEL[g]?.[0] || g} <span className="text-muted text-xs font-normal">version {data.versions[g] || 0}</span></span>
                <span className="text-muted block text-xs">{LABEL[g]?.[1]}</span>
              </span>
              <button onClick={() => clear(g)} disabled={!!busy} className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15 disabled:opacity-50">
                {busy === g ? "Clearing…" : "Clear"}
              </button>
            </li>
          ))}
        </ul>
      </section>
      {msg && <p role="status" className="mt-4 text-sm text-amber-300">{msg}</p>}

      <p className="text-muted mt-8 text-xs">
        Lifetimes: lists {Math.round(data.ttl.lists / 60)} min · lookups {Math.round(data.ttl.static / 60)} min · live counters {data.ttl.short}s.
        An expired copy is served instantly for a short while while it refreshes; older than that, it refreshes first and the old copy is used only if the refresh fails (up to {Math.round(data.ttl.staleIfErrorSeconds / 3600)} h).
      </p>
    </div>
  );
}
