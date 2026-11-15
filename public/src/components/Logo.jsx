// BookQubit logo v2: a Q made of an open book inside a ring, with a bookmark/magnifier tail and a "qubit" dot, on a
// gradient tile. Pure SVG, scales to any size. Three colour directions ship with the pack (aurora, lagoon, sunset);
// the header follows the theme (see lib/logoPalette.js), everything else uses Aurora, the recommended one.
// Gradient ids are unique per instance so several logos on one page never collide.
import { useId } from "react";
import { LOGO_PALETTES, DEFAULT_LOGO_PALETTE } from "@/lib/logoPalette";

export function LogoMark({ size = 34, palette = DEFAULT_LOGO_PALETTE, className = "", title }) {
  const id = useId().replace(/:/g, "");
  const p = LOGO_PALETTES[palette] || LOGO_PALETTES[DEFAULT_LOGO_PALETTE];
  const simple = size <= 24; // favicon-size: drop the book detail and the dot
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" className={className}
      role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.stops[0]} /><stop offset=".55" stopColor={p.stops[1]} /><stop offset="1" stopColor={p.stops[2]} />
        </linearGradient>
        <linearGradient id={`gl${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".28" /><stop offset=".5" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="512" height="512" rx="118" fill={`url(#bg${id})`} />
      <rect width="512" height="512" rx="118" fill={`url(#gl${id})`} />
      <g transform="translate(6 6)">
        <path d="M327.3,349.4 A132,132 0 1 1 349.4,327.3" fill="none" stroke="#fff" strokeWidth="46" strokeLinecap="round" />
        <path d="M332,332 L392,392" stroke={p.accent} strokeWidth="46" strokeLinecap="round" />
        {simple ? (
          <path d="M256,214 C236,200 206,196 184,202 L184,290 C206,284 236,288 256,302 C276,288 306,284 328,290 L328,202 C306,196 276,200 256,214 Z" fill="#fff" />
        ) : (
          <>
            <path d="M250,218 C232,204 204,200 184,206 L184,292 C204,286 232,290 250,304 Z" fill="#fff" />
            <path d="M262,218 C280,204 308,200 328,206 L328,292 C308,286 280,290 262,304 Z" fill="#fff" fillOpacity=".82" />
            <circle cx="256" cy="166" r="17" fill={p.accent} />
          </>
        )}
      </g>
    </svg>
  );
}

/** Wordmark in live text so it follows the theme; "qubit" carries the logo gradient. `className` sets the size. */
export function Wordmark({ palette = DEFAULT_LOGO_PALETTE, className = "" }) {
  const p = LOGO_PALETTES[palette] || LOGO_PALETTES[DEFAULT_LOGO_PALETTE];
  return (
    <span className={`text-[1.3rem] font-bold tracking-[-0.03em] ${className}`} style={{ fontFamily: "var(--font-sans)" }}>
      <span className="text-[var(--fg)]">book</span>
      <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(90deg, ${p.stops.join(", ")})`, WebkitTextFillColor: "transparent" }}>qubit</span>
    </span>
  );
}

export default function Logo({ size = 34, text = true, palette = DEFAULT_LOGO_PALETTE, className = "" }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <LogoMark size={size} palette={palette} />
      {text && <Wordmark palette={palette} />}
    </span>
  );
}
