"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

// Wraps a `.hscroll` row with left/right arrow buttons. Native drag/swipe
// scrolling still works — the buttons are an assist, not a replacement, and
// both stay usable in either order (scrolling right re-enables the left
// button, and vice versa) since visibility is derived from actual scroll
// position rather than a one-shot flag.
export default function HScrollRow({ children, className = "" }) {
  const ref = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [children]);

  const scroll = (dir) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className={`hscroll-fade hscroll-fade-left ${canLeft ? "hscroll-fade-visible" : ""}`} />
      <div className={`hscroll-fade hscroll-fade-right ${canRight ? "hscroll-fade-visible" : ""}`} />
      <div ref={ref} className={`hscroll ${className}`}>{children}</div>
      {canLeft && (
        <button onClick={() => scroll(-1)} aria-label="Scroll left" className="icon-btn hscroll-btn hscroll-btn-left">
          <Icon name="chevronDown" size={17} className="rotate-90" strokeWidth={2.5} />
        </button>
      )}
      {canRight && (
        <button onClick={() => scroll(1)} aria-label="Scroll right" className="icon-btn hscroll-btn hscroll-btn-right">
          <Icon name="chevronDown" size={17} className="-rotate-90" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
