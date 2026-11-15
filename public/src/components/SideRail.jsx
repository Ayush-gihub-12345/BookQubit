"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

// Desktop left rail (lg+), UI v2: icons with labels underneath and an active pill. Sticky under the 64px header,
// so it never overlaps content (the layout puts it in a flex row beside <main>). Every entry is a real route.
export const RAIL_ITEMS = [
  { href: "/", icon: "home", key: "homeWord", match: (p) => p === "/" },
  { href: "/feed", icon: "flame", label: "Feed", match: (p) => p.startsWith("/feed") },
  { href: "/books", icon: "compass", key: "navDiscover", match: (p) => p.startsWith("/books") || p.startsWith("/categories") || p.startsWith("/authors") || p.startsWith("/collections") || p.startsWith("/tags") },
  { href: "/mindspace", icon: "layers", label: "MindSpace", match: (p) => p.startsWith("/mindspace") },
  { href: "/library", icon: "bookmark", key: "shelfWord", match: (p) => p.startsWith("/library") || p.startsWith("/account") || p.startsWith("/liked") },
  { href: "/community", icon: "users", key: "navCommunity", match: (p) => p.startsWith("/community") || p.startsWith("/connect") || p.startsWith("/readers") },
  { href: "/leaderboard", icon: "trophy", key: "navRankingShort", match: (p) => p.startsWith("/leaderboard") },
];

// Two widths: "wide" (icons with labels) and "compact" (icons only, labels as tooltips). Collapsing never hides the rail, so
// every destination stays one click away. `defaultOpen` comes from the bq_rail cookie (1 wide, 0 compact), read in the
// layout, so a compact rail is already compact in the server HTML: no flash.
export default function SideRail({ defaultOpen = true }) {
  const [wide, setWide] = useState(defaultOpen);
  const toggle = () => {
    const next = !wide;
    setWide(next);
    try { document.cookie = `bq_rail=${next ? 1 : 0}; path=/; max-age=31536000; samesite=lax`; } catch { /* cookies blocked */ }
  };
  const lang = useLang();
  const tr = t(lang);
  const pathname = usePathname();
  const rel = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";

  return (
    <nav aria-label="Sections"
      className={`sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 flex-col items-center gap-1 overflow-y-auto overflow-x-hidden border-e border-[var(--line)] py-3 transition-[width] duration-200 lg:flex ${wide ? "w-[84px]" : "w-[60px]"}`}>
      <button type="button" onClick={toggle} aria-expanded={wide}
        aria-label={wide ? "Collapse the side menu to icons" : "Expand the side menu"} title={wide ? "Collapse to icons" : "Expand"}
        className="rail-toggle mb-1 grid h-8 w-8 place-items-center rounded-full text-[var(--muted)] transition">
        <Icon name={wide ? "chevronLeft" : "chevronRight"} size={18} className="rtl:rotate-180" />
      </button>
      {RAIL_ITEMS.map((item) => {
        const active = item.match(rel);
        const label = item.label || tr(item.key);
        return (
          <Link
            key={item.href}
            href={`/${lang}${item.href === "/" ? "" : item.href}`}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            aria-label={wide ? undefined : label}
            title={wide ? undefined : label}
            className={`group flex flex-col items-center gap-1 rounded-[var(--radius-md)] font-semibold transition-colors ${wide ? "w-[72px] py-2 text-[11px]" : "w-[48px] py-1.5"} ${active ? "text-[var(--fg)]" : "text-[var(--muted)] hover:text-[var(--fg)]"}`}
          >
            <span data-active={active ? "true" : "false"} className="rail-bubble grid h-9 w-12 place-items-center rounded-full">
              <Icon name={item.icon} size={20} strokeWidth={active ? 2.4 : 2} />
            </span>
            {wide && <span className="max-w-full truncate px-1">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
