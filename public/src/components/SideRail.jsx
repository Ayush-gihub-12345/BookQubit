"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

// Desktop left rail (lg+), UI v2: icons with labels underneath and an active pill. Sticky under the 64px header,
// so it never overlaps content (the layout puts it in a flex row beside <main>). Every entry is a real route.
export const RAIL_ITEMS = [
  { href: "/", icon: "home", key: "homeWord", match: (p) => p === "/" },
  { href: "/feed", icon: "newspaper", label: "Feed", match: (p) => p.startsWith("/feed") },
  { href: "/books", icon: "compass", key: "navDiscover", match: (p) => p.startsWith("/books") || p.startsWith("/categories") || p.startsWith("/authors") || p.startsWith("/collections") || p.startsWith("/tags") },
  { href: "/mindspace", icon: "layers", label: "MindSpace", match: (p) => p.startsWith("/mindspace") },
  { href: "/library", icon: "bookmark", key: "shelfWord", match: (p) => p.startsWith("/library") || p.startsWith("/account") || p.startsWith("/liked") },
  { href: "/community", icon: "users", key: "navCommunity", match: (p) => p.startsWith("/community") || p.startsWith("/connect") || p.startsWith("/readers") },
  { href: "/leaderboard", icon: "trophy", key: "navRankingShort", match: (p) => p.startsWith("/leaderboard") },
];

export default function SideRail() {
  const lang = useLang();
  const tr = t(lang);
  const pathname = usePathname();
  const rel = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";

  return (
    <nav aria-label="Sections" className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-[84px] shrink-0 flex-col items-center gap-1 overflow-y-auto border-e border-[var(--line)] py-4 lg:flex">
      {RAIL_ITEMS.map((item) => {
        const active = item.match(rel);
        return (
          <Link
            key={item.href}
            href={`/${lang}${item.href === "/" ? "" : item.href}`}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={`group flex w-[72px] flex-col items-center gap-1 rounded-[var(--radius-md)] py-2 text-[11px] font-semibold transition-colors ${active ? "text-[var(--fg)]" : "text-[var(--muted)] hover:text-[var(--fg)]"}`}
          >
            <span className={`grid h-9 w-12 place-items-center rounded-full transition-colors ${active ? "bg-brand-400 text-[var(--on-brand)]" : "group-hover:bg-[var(--surface-2)]"}`}>
              <Icon name={item.icon} size={20} strokeWidth={active ? 2.4 : 2} />
            </span>
            <span className="max-w-full truncate px-1">{item.label || tr(item.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
