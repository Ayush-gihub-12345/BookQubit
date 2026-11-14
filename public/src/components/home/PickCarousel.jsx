"use client";

import { Children, useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";

// "Today's pick" carousel (1 of N). Built to the WCAG rules that made the old auto-advancing slider a problem:
//  - autoplay is OFF for readers who prefer reduced motion, pauses while the pointer is over it or focus is inside,
//    and there is always a visible Pause / Play button (2.2.2);
//  - slides are real content (server-rendered by the parent), the inactive ones are `hidden`, so there is no layout jump;
//  - previous / next buttons, dots, arrow keys and swipe all work; the current position is announced politely
//    only when autoplay is off (so a screen reader isn't interrupted every few seconds).
const INTERVAL_MS = 8000;

export default function PickCarousel({ label, children }) {
  const slides = Children.toArray(children);
  const n = slides.length;
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const touch = useRef(null);

  // Start autoplay only after mount, and only when motion is allowed.
  useEffect(() => {
    if (n > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(true);
  }, [n]);

  useEffect(() => {
    if (!playing || hover || focus || n < 2) return;
    const id = setInterval(() => setCur((c) => (c + 1) % n), INTERVAL_MS);
    return () => clearInterval(id);
  }, [playing, hover, focus, n]);

  if (n === 0) return null;
  if (n === 1) return slides[0];
  const go = (i) => setCur((i + n) % n);

  return (
    <div
      role="group" aria-roledescription="carousel" aria-label={label}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false); }}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(cur + 1); if (e.key === "ArrowLeft") go(cur - 1); }}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1)); }}
    >
      <div aria-live={playing ? "off" : "polite"}>
        {slides.map((s, i) => (
          <div key={i} hidden={i !== cur} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${n}`}>{s}</div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <button type="button" className="btn-icon !h-9 !w-9 !min-h-9" onClick={() => go(cur - 1)} aria-label="Previous pick"><Icon name="chevronDown" size={16} className="rotate-90" /></button>
        <ul className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <li key={i}>
              <button type="button" onClick={() => go(i)} aria-label={`Show pick ${i + 1}`} aria-current={i === cur ? "true" : undefined}
                className="grid h-6 w-6 place-items-center"><span className={`block h-2 rounded-full transition-all ${i === cur ? "w-6 bg-brand-500" : "w-2 bg-[var(--line-strong)]"}`} /></button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn-icon !h-9 !w-9 !min-h-9" onClick={() => go(cur + 1)} aria-label="Next pick"><Icon name="chevronDown" size={16} className="-rotate-90" /></button>
        <button type="button" className="btn-icon !h-9 !w-9 !min-h-9 ms-2" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}
          aria-label={playing ? "Pause automatic rotation" : "Start automatic rotation"}><Icon name={playing ? "pause" : "play"} size={14} filled /></button>
      </div>
    </div>
  );
}
