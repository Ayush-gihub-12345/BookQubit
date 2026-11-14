// Dependency-free SVG charts. Colours come from theme CSS variables so every theme works.

export function BarChart({ values, labels, unit = "", height = 120, ariaLabel }) {
  const max = Math.max(1, ...values);
  const w = 24 * values.length;
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${w} ${height + 18}`} className="w-full" role="img" aria-label={ariaLabel}>
        {values.map((v, i) => {
          const h = Math.round((v / max) * height);
          return (
            <g key={i}>
              <title>{`${labels[i]}: ${v}${unit}`}</title>
              <rect x={i * 24 + 4} y={height - h} width="16" height={Math.max(h, v ? 2 : 0)} rx="3" fill="var(--color-brand-500)" opacity={v ? 1 : 0.15} />
              <text x={i * 24 + 12} y={height + 13} textAnchor="middle" fontSize="8" fill="var(--muted)">{labels[i]}</text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

const LEVEL = ["var(--line)", "color-mix(in srgb, var(--color-brand-500) 30%, var(--surface))", "color-mix(in srgb, var(--color-brand-500) 55%, var(--surface))", "color-mix(in srgb, var(--color-brand-500) 80%, var(--surface))", "var(--color-brand-600)"];

/** GitHub-style contribution grid: columns = weeks (Sunday first), rows = weekdays. */
export function Heatmap({ cells }) {
  const weeks = Math.ceil(cells.length / 7);
  const size = 11, gap = 3;
  const w = weeks * (size + gap), h = 7 * (size + gap);
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="min-w-[640px]" role="img" aria-label="Reading activity over the last year">
        {cells.map((c, i) => (
          <rect key={c.day} x={Math.floor(i / 7) * (size + gap)} y={(i % 7) * (size + gap)} width={size} height={size} rx="2" fill={LEVEL[c.level]}>
            <title>{c.day}</title>
          </rect>
        ))}
      </svg>
    </div>
  );
}

/** Progress ring: `pct` 0-100, children rendered in the centre. */
export function Ring({ pct, size = 120, stroke = 10, children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-brand-600)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, Math.max(0, pct)) / 100)} style={{ transition: "stroke-dashoffset .6s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

/** Horizontal share bars for a distribution [{name, n}]. */
export function ShareBars({ items }) {
  const total = items.reduce((n, i) => n + i.n, 0) || 1;
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.name} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 truncate">{i.name}</span>
          <span className="bg-line h-2 flex-1 overflow-hidden rounded-full"><span className="bg-brand-500 block h-full rounded-full" style={{ width: `${Math.round((i.n / total) * 100)}%` }} /></span>
          <span className="text-muted w-8 text-end tabular-nums">{i.n}</span>
        </li>
      ))}
    </ul>
  );
}
