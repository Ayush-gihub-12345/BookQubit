"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/authFetch";

// Reading challenges for the year: books, genres, countries, pages. Progress comes from the books the reader finished.
export default function ChallengesPanel({ year, className = "" }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [targets, setTargets] = useState({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    authFetch(`/api/library/challenges?year=${year}`)
      .then((r) => (r && r.ok ? r.json() : Promise.reject(r)))
      .then(setData)
      .catch((r) => setError(r?.status === 503 ? "Challenges are not available right now." : "Couldn't load your challenges."));
  }, [year]);
  useEffect(() => { load(); }, [load]);

  const send = async (method, body) => {
    setBusy(true);
    try {
      const res = await authFetch("/api/library/challenges", { method, headers: { "content-type": "application/json" }, body: JSON.stringify({ year, ...body }) });
      if (!res.ok) { setError("That didn't work. Try again."); return; }
      setError(""); load();
    } finally { setBusy(false); }
  };

  return (
    <section className={`border-line bg-surface rounded-2xl border p-5 ${className}`}>
      <h2 className="font-editorial text-lg font-semibold">{year} challenges</h2>
      {error && <p role="alert" className="text-muted mt-3 text-sm">{error}</p>}
      {!data && !error && <div className="skeleton mt-3 h-24" aria-hidden />}
      {data && (
        <div className="mt-3 space-y-4">
          {data.challenges.length === 0 && <p className="text-muted text-sm">Pick a challenge below. Your progress is counted from the books you finish.</p>}
          {data.challenges.map((c) => (
            <div key={c.kind}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <p className="font-semibold">{c.label}{c.complete && <span className="ms-2 text-emerald-500">Done</span>}</p>
                <p className="text-muted">{c.done.toLocaleString()} / {c.target.toLocaleString()} {c.unit}</p>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--fg)_14%,transparent)]" role="progressbar" aria-valuenow={c.pct} aria-valuemin={0} aria-valuemax={100} aria-label={c.label}>
                <div className="h-full rounded-full bg-marker" style={{ width: `${c.pct}%` }} />
              </div>
              {c.items.length > 0 && <p className="text-muted mt-1.5 line-clamp-2 text-xs">{c.items.join(" · ")}</p>}
              <button type="button" disabled={busy} onClick={() => send("DELETE", { kind: c.kind })} className="text-muted mt-1 text-xs hover:underline">Leave this challenge</button>
            </div>
          ))}
          {data.available.length > 0 && (
            <ul className="space-y-2 border-t border-[var(--line)] pt-3">
              {data.available.map((a) => {
                const v = targets[a.kind] ?? a.suggested;
                return (
                  <li key={a.kind} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="min-w-0 flex-1">{a.label}</span>
                    <label className="sr-only" htmlFor={`ch-${a.kind}`}>Target {a.unit}</label>
                    <input id={`ch-${a.kind}`} type="number" inputMode="numeric" min={a.min} max={a.max} value={v}
                      onChange={(e) => setTargets((t) => ({ ...t, [a.kind]: e.target.value }))} className="input !min-h-9 !w-24 text-sm" />
                    <button type="button" disabled={busy} onClick={() => send("POST", { kind: a.kind, target: Number(v) })} className="btn-soft btn-sm">Join</button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
