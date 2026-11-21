"use client";

// Phone and tablet quick navigation (the YouTube pattern): a short row of chips under the header. The full side menu is
// opened by the brand button at the top-left of the header (see Navbar). The row never shows a scrollbar: if the chips don't fit, an arrow appears at the
// edge, and the row can also be dragged with a finger or the mouse. The current section is filled and kept in view.
// It scrolls away with the page (not sticky), so it never shifts the offsets of sticky bars below it.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

export const OPEN_MENU_EVENT = "bq:open-menu";

export default function MobileChips() {
  const lang = useLang();
  const tr = t(lang);
  const pathname = usePathname();
  const rel = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  const box = useRef(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const [edge, setEdge] = useState({ start: false, end: false });
  const starts = (...r) => r.some((p) => rel === p || rel.startsWith(`${p}/`));

  // Home first, then the content sections. (Home is also in the bottom bar and the menu: it is the one thing people reach for most.)
  const CHIPS = [
    { href: "/", label: tr("homeWord"), on: rel === "/" },
    { href: "/books", label: tr("navDiscover"), on: starts("/books", "/categories", "/tags") },
    { href: "/authors", label: tr("authors"), on: starts("/authors") },
    { href: "/comics", label: tr("comics"), on: starts("/comics") },
    { href: "/collections", label: tr("collections"), on: starts("/collections") },
  ];

  const measure = useCallback(() => {
    const el = box.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const x = Math.abs(el.scrollLeft); // abs: scrollLeft is negative in right-to-left
    setEdge({ start: x > 4, end: max > 4 && x < max - 4 });
  }, []);

  useEffect(() => {
    measure();
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready?.then(measure); // fonts change the content width after first paint
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    box.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ inline: "center", block: "nearest" });
    measure();
  }, [pathname, measure]);

  const nudge = (dir) => box.current?.scrollBy({ left: dir * 160, behavior: "smooth" });

  // Drag to scroll (mouse; touch already scrolls natively). A drag never counts as a click on a chip.
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

  const chip = "flex h-8 w-full select-none items-center justify-center whitespace-nowrap rounded-lg px-1.5 text-[clamp(11.5px,3.3vw,13px)] font-semibold transition-colors";
  return (
    <nav aria-label="Quick sections" className="relative lg:hidden">
      <ul ref={box} onScroll={measure} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} onClickCapture={stopClick}
        className="flex cursor-grab gap-1 overflow-x-auto px-2 py-2 active:cursor-grabbing no-scrollbar ">
        {CHIPS.map((c) => (
          <li key={c.href} className="min-w-fit flex-1">
            <Link href={`/${lang}${c.href === "/" ? "" : c.href}`} prefetch={false} draggable={false} aria-current={c.on ? "page" : undefined}
              className={`${chip} ${c.on ? "bg-[var(--fg)] text-[var(--bg)]" : "bg-[var(--surface-2)] text-[var(--fg)] hover:bg-[var(--surface-3)]"}`}>
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
      {edge.start && (
        <button type="button" onClick={() => nudge(-1)} aria-label="Scroll left" className="absolute inset-y-0 start-0 grid w-10 place-items-center bg-gradient-to-r from-[var(--bg)] via-[var(--bg)] to-transparent">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)]"><Icon name="chevronLeft" size={16} className="rtl:rotate-180" /></span>
        </button>
      )}
      {edge.end && (
        <button type="button" onClick={() => nudge(1)} aria-label="Scroll right" className="absolute inset-y-0 end-0 grid w-10 place-items-center bg-gradient-to-l from-[var(--bg)] via-[var(--bg)] to-transparent">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)]"><Icon name="chevronRight" size={16} className="rtl:rotate-180" /></span>
        </button>
      )}
    </nav>
  );
}
