"use client";

// A horizontal row that never shows a scrollbar. If its content doesn't fit, a small arrow appears at the edge that has
// more to show, and the row can be dragged (mouse) or swiped (touch). Used for filter chips and tab rows on phones.
// `role` / `aria-label` go to the scrolling element; children are the items.
import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";

export default function SwipeRow({ children, className = "", role, "aria-label": ariaLabel }) {
  const box = useRef(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const [edge, setEdge] = useState({ start: false, end: false });

  const measure = useCallback(() => {
    const el = box.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const x = Math.abs(el.scrollLeft);
    setEdge({ start: x > 4, end: max > 4 && x < max - 4 });
  }, []);

  useEffect(() => {
    measure();
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Web fonts load after first paint and change the content width; measure again once they are in.
    document.fonts?.ready?.then(measure);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [measure]);

  const nudge = (dir) => box.current?.scrollBy({ left: dir * 180, behavior: "smooth" });
  const onDown = (e) => { if (e.pointerType !== "mouse") return; drag.current = { down: true, x: e.clientX, left: box.current.scrollLeft, moved: false }; };
  const onMove = (e) => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    box.current.scrollLeft = d.left - dx;
  };
  const onUp = () => { drag.current.down = false; };
  const stopClick = (e) => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; } };

  const arrow = "absolute inset-y-0 z-10 grid w-10 place-items-center";
  const dot = "grid h-7 w-7 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] shadow-sm";
  return (
    <div className="relative">
      <div ref={box} role={role} aria-label={ariaLabel} onScroll={measure} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} onClickCapture={stopClick}
        className={`no-scrollbar flex cursor-grab overflow-x-auto active:cursor-grabbing ${className}`}>
        {children}
      </div>
      {edge.start && (
        <button type="button" onClick={() => nudge(-1)} aria-label="Scroll left" className={`${arrow} start-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)] to-transparent`}>
          <span className={dot}><Icon name="chevronLeft" size={16} className="rtl:rotate-180" /></span>
        </button>
      )}
      {edge.end && (
        <button type="button" onClick={() => nudge(1)} aria-label="Scroll right" className={`${arrow} end-0 bg-gradient-to-l from-[var(--bg)] via-[var(--bg)] to-transparent`}>
          <span className={dot}><Icon name="chevronRight" size={16} className="rtl:rotate-180" /></span>
        </button>
      )}
    </div>
  );
}
