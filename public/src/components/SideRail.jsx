"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

// Desktop-only left rail (lg+). Collapsed to icons; it expands OVER the page on
// hover/keyboard focus (no layout shift) to reveal labels. Only routes that exist
// are listed — new sections (MindSpace, Library) are added here as they ship.
export const RAIL_ITEMS = [
  { href: "/", icon: "home", key: "homeWord", match: (p) => p === "/" },
  { href: "/books", icon: "compass", key: "navDiscover", match: (p) => p.startsWith("/books") || p.startsWith("/categories") || p.startsWith("/authors") },
  { href: "/library", icon: "bookmark", key: "shelfWord", match: (p) => p.startsWith("/library") || p.startsWith("/account") || p.startsWith("/liked") },
  { href: "/community", icon: "users", key: "navCommunity", match: (p) => p.startsWith("/community") },
];

export default function SideRail() {
  const lang = useLang();
  const tr = t(lang);
  const pathname = usePathname();
  const rel = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";

  return (
    <nav
      aria-label="Primary"
      className="group border-line bg-surface fixed top-16 bottom-0 start-0 z-30 hidden w-16 flex-col gap-1 overflow-hidden border-e px-2 py-3 transition-[width] duration-200 hover:w-52 focus-within:w-52 lg:flex"
    >
      {RAIL_ITEMS.map((item) => {
        const active = item.match(rel);
        return (
          <Link
            key={item.href}
            href={`/${lang}${item.href === "/" ? "" : item.href}`}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium whitespace-nowrap transition ${
              active ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-brand-50 hover:text-fg"
            }`}
          >
            <Icon name={item.icon} size={20} className="shrink-0" />
            <span className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{tr(item.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
