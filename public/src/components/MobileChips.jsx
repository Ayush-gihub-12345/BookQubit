"use client";

// Phone and tablet quick navigation (the YouTube pattern): a swipeable row of chips under the header. The current
// section is filled and scrolled into view; the row fades at both edges so it is clear there is more to swipe.
// It scrolls away with the page (it is not sticky) so it never shifts the offsets of sticky bars below it.
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

export default function MobileChips() {
  const lang = useLang();
  const tr = t(lang);
  const pathname = usePathname();
  const rel = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  const box = useRef(null);
  const starts = (...r) => r.some((p) => rel === p || rel.startsWith(`${p}/`));

  const CHIPS = [
    { href: "/", icon: "home", label: tr("homeWord"), on: rel === "/" },
    { href: "/feed", icon: "flame", label: "Feed", on: starts("/feed") },
    { href: "/books", icon: "compass", label: tr("navDiscover"), on: starts("/books", "/categories", "/tags") },
    { href: "/listen", icon: "headphones", label: "Listen", on: starts("/listen") },
    { href: "/authors", icon: "feather", label: tr("authors"), on: starts("/authors") },
    { href: "/comics", icon: "layers", label: tr("comics"), on: starts("/comics") },
    { href: "/collections", icon: "bookmark", label: tr("collections"), on: starts("/collections") },
    { href: "/community", icon: "users", label: tr("navCommunity"), on: starts("/community", "/connect", "/readers") },
    { href: "/leaderboard", icon: "trophy", label: tr("navRankingShort"), on: starts("/leaderboard") },
  ];

  // Keep the active chip in view after navigation.
  useEffect(() => {
    const el = box.current?.querySelector('[aria-current="page"]');
    el?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);

  return (
    <nav aria-label="Quick sections" className="relative border-b border-[var(--line)] lg:hidden">
      <ul ref={box} className="flex gap-2 overflow-x-auto px-3 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CHIPS.map((c) => (
          <li key={c.href} className="shrink-0">
            <Link href={`/${lang}${c.href === "/" ? "" : c.href}`} prefetch={false} aria-current={c.on ? "page" : undefined}
              className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-[14px] font-semibold transition-colors ${c.on ? "bg-[var(--fg)] text-[var(--bg)]" : "bg-[var(--surface-2)] text-[var(--fg)] hover:bg-[var(--surface-3)]"}`}>
              <Icon name={c.icon} size={15} />{c.label}
            </Link>
          </li>
        ))}
      </ul>
      <span aria-hidden className="pointer-events-none absolute inset-y-0 end-0 w-8 bg-gradient-to-l from-[var(--bg)] to-transparent" />
    </nav>
  );
}
