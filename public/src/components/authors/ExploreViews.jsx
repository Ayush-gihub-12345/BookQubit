"use client";

// Interactive author views: a world map of where authors come from, and a graph of who has written together.
// Plain SVG, no map or graph library, so there is nothing extra to download; the data arrives already aggregated.
import Link from "next/link";
import { useMemo, useState } from "react";
import { useLang } from "@/lib/useLang";

const W = 360, H = 180;
const proj = ([lat, lon]) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];

function AuthorChips({ authors, lang }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {authors.slice(0, 40).map((a) => (
        <li key={a.slug}><Link href={`/${lang}/authors/${a.slug}`} prefetch={false} className="pill !h-8 !text-[13px]">{a.name}</Link></li>
      ))}
      {authors.length > 40 && <li className="text-muted self-center text-xs">+{authors.length - 40} more</li>}
    </ul>
  );
}

export function WorldMap({ countries }) {
  const lang = useLang();
  const [sel, setSel] = useState(countries[0]?.name || null);
  const max = Math.max(1, ...countries.map((c) => c.count));
  const cur = countries.find((c) => c.name === sel);
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="card overflow-hidden p-3 hover:!translate-y-0 sm:p-4">
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label="World map of author countries" className="h-auto w-full">
          <rect width={W} height={H} rx="6" fill="var(--surface-2)" />
          {[-60, -30, 0, 30, 60].map((lat) => <line key={lat} x1="0" x2={W} y1={((90 - lat) / 180) * H} y2={((90 - lat) / 180) * H} stroke="var(--line)" strokeWidth=".4" />)}
          {[-120, -60, 0, 60, 120].map((lon) => <line key={lon} y1="0" y2={H} x1={((lon + 180) / 360) * W} x2={((lon + 180) / 360) * W} stroke="var(--line)" strokeWidth=".4" />)}
          {countries.filter((c) => c.ll).map((c) => {
            const [x, y] = proj(c.ll);
            const r = 3 + Math.sqrt(c.count / max) * 9;
            const on = c.name === sel;
            return (
              <g key={c.name} tabIndex={0} role="button" aria-label={`${c.name}: ${c.count} authors`} onClick={() => setSel(c.name)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSel(c.name)} className="cursor-pointer outline-none">
                <circle cx={x} cy={y} r={r + 3} fill="var(--color-brand-500)" opacity={on ? 0.25 : 0} />
                <circle cx={x} cy={y} r={r} fill="var(--color-brand-500)" opacity={on ? 0.95 : 0.6} stroke="var(--bg)" strokeWidth=".8" />
                {(on || r > 7) && <text x={x} y={y - r - 2} textAnchor="middle" fontSize="5.2" fontWeight="700" fill="var(--fg)">{c.name}</text>}
              </g>
            );
          })}
        </svg>
        <p className="text-muted mt-2 text-xs">Bubble size shows how many authors. Tap a country.</p>
      </div>
      <aside className="card p-5 hover:!translate-y-0" aria-live="polite">
        {cur ? (
          <>
            <h2 className="font-display text-xl font-bold">{cur.flag} {cur.name}</h2>
            <p className="text-muted text-sm">{cur.count} {cur.count === 1 ? "author" : "authors"}</p>
            <AuthorChips authors={cur.authors} lang={lang} />
          </>
        ) : <p className="text-muted text-sm">Pick a country on the map.</p>}
        <h3 className="mt-6 text-sm font-bold">All countries</h3>
        <ul className="mt-2 grid grid-cols-2 gap-1 text-sm">
          {countries.map((c) => (
            <li key={c.name}>
              <button type="button" onClick={() => setSel(c.name)} className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-start hover:bg-[var(--surface-2)] ${c.name === sel ? "bg-[var(--surface-2)] font-semibold" : ""}`}>
                <span className="truncate">{c.flag} {c.name}</span><span className="text-muted ms-1 text-xs">{c.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

export function CoAuthorGraph({ pairs, slugs }) {
  const lang = useLang();
  const { nodes, edges } = useMemo(() => {
    const deg = new Map();
    for (const [a, b, n] of pairs) { deg.set(a, (deg.get(a) || 0) + n); deg.set(b, (deg.get(b) || 0) + n); }
    const top = [...deg.entries()].sort((x, y) => y[1] - x[1]).slice(0, 36).map(([name]) => name);
    const set = new Set(top);
    const cx = 200, cy = 200, R = 160;
    const nodes = top.map((name, i) => { const t = (i / top.length) * Math.PI * 2 - Math.PI / 2; return { name, x: cx + R * Math.cos(t), y: cy + R * Math.sin(t), d: deg.get(name) }; });
    return { nodes, edges: pairs.filter(([a, b]) => set.has(a) && set.has(b)) };
  }, [pairs]);
  const [sel, setSel] = useState(nodes[0]?.name || null);
  const pos = Object.fromEntries(nodes.map((n) => [n.name, n]));
  const mates = pairs.filter(([a, b]) => a === sel || b === sel).map(([a, b, n]) => [a === sel ? b : a, n]);
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="card p-3 hover:!translate-y-0 sm:p-4">
        <svg viewBox="0 0 400 400" role="group" aria-label="Co-author network" className="mx-auto h-auto w-full max-w-[560px]">
          {edges.map(([a, b, n], i) => <line key={i} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} stroke="var(--color-brand-500)" strokeOpacity={a === sel || b === sel ? 0.9 : 0.22} strokeWidth={a === sel || b === sel ? 1 + n * 0.5 : 0.6} />)}
          {nodes.map((n) => {
            const on = n.name === sel;
            return (
              <g key={n.name} tabIndex={0} role="button" aria-label={`${n.name}, ${n.d} collaborations`} onClick={() => setSel(n.name)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSel(n.name)} className="cursor-pointer outline-none">
                <circle cx={n.x} cy={n.y} r={4 + Math.min(8, n.d)} fill={on ? "var(--color-brand-500)" : "var(--surface)"} stroke="var(--color-brand-500)" strokeWidth="1.4" />
                <text x={n.x} y={n.y + (n.y > 200 ? 20 : -14)} textAnchor="middle" fontSize="7" fontWeight={on ? 800 : 500} fill="var(--fg)">{n.name.length > 18 ? n.name.slice(0, 17) + "…" : n.name}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <aside className="card p-5 hover:!translate-y-0" aria-live="polite">
        <h2 className="font-display text-xl font-bold">{sel}</h2>
        <p className="text-muted text-sm">{mates.length} {mates.length === 1 ? "collaborator" : "collaborators"}</p>
        {slugs[sel] && <Link href={`/${lang}/authors/${slugs[sel]}`} prefetch={false} className="btn-ghost btn-sm mt-3">View profile</Link>}
        <ul className="mt-4 space-y-1.5 text-sm">
          {mates.slice(0, 12).map(([name, n]) => (
            <li key={name} className="flex items-center justify-between gap-2">
              <button type="button" onClick={() => pos[name] && setSel(name)} className="truncate text-start hover:text-brand-700">{name}</button>
              <span className="text-muted text-xs">{n} {n === 1 ? "book" : "books"}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
