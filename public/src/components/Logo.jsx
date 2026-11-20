// BookQubit mark, redrawn to match the site: a "Q" whose ring holds an open book, with a bookmark ribbon as its tail and a
// small "qubit" dot above the pages. No background tile: the mark is drawn in the active THEME's own brand colour (shifted
// slightly toward the logo violet), so it matches all nine themes and custom themes, and stays sharp at small sizes.
// Gradient ids are unique per instance so several logos on one page never collide.
import { useId } from "react";

const BRAND = "var(--color-brand-500)";
const MIX = "color-mix(in oklab, var(--color-brand-500) 55%, var(--color-qubit-500, #8b6cff))";

export function LogoMark({ size = 34, className = "", title }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" className={className}
      role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: BRAND }} /><stop offset="1" style={{ stopColor: MIX }} />
        </linearGradient>
      </defs>
      {/* ring, open at the bottom right where the ribbon leaves */}
      <path d="M306.4,368.4 A150,150 0 1 1 368.4,306.4" fill="none" stroke={`url(#g${id})`} strokeWidth="58" strokeLinecap="round" />
      {/* bookmark ribbon tail */}
      <path transform="translate(344 344) rotate(-45)" d="M-27,-6 h54 v126 l-27,-30 l-27,30 z" fill={`url(#g${id})`} stroke={`url(#g${id})`} strokeWidth="10" strokeLinejoin="round" />
      {/* open book */}
      <path d="M228,208 C210,194 182,190 160,196 L160,288 C182,282 210,286 228,300 Z" fill={`url(#g${id})`} />
      <path d="M244,208 C262,194 290,190 312,196 L312,288 C290,282 262,286 244,300 Z" fill={`url(#g${id})`} opacity=".82" />
      {/* qubit dot */}
      <circle cx="236" cy="146" r="17" style={{ fill: "var(--color-qubit-500, #8b6cff)" }} />
    </svg>
  );
}

/** Wordmark in live text so it follows the theme; "qubit" carries the same gradient as the mark. `className` sets the size. */
export function Wordmark({ className = "" }) {
  return (
    <span className={`text-[1.3rem] font-bold tracking-[-0.03em] ${className}`} style={{ fontFamily: "var(--font-sans)" }}>
      <span className="text-[var(--fg)]">book</span>
      <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(90deg, ${BRAND}, ${MIX})`, WebkitTextFillColor: "transparent" }}>qubit</span>
    </span>
  );
}

export default function Logo({ size = 34, text = true, className = "" }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {text && <Wordmark />}
    </span>
  );
}
