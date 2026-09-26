"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import SearchBar from "./SearchBar";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

// The defining pattern of a well-designed mobile reading app (Kindle,
// Goodreads, Libby all use one) — the site had none of these before. Fixed
// to the bottom of the viewport, `lg:hidden` only (desktop keeps the full
// Navbar). Pages need bottom padding equal to this bar's height so content
// never renders underneath it — see the `pb-[...]` added alongside this on
// the main layout.
export default function MobileTabBar() {
  const lang = useLang();
  const tr = t(lang);
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const relPath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";

  // Community is a full-height, app-like chat surface with its own bottom
  // message composer (see ConditionalFooter.jsx, which hides the marketing
  // footer there for the same reason) — a second fixed bar at the bottom
  // would overlap it.
  if (relPath === "/community" || relPath.startsWith("/community/")) return null;

  const TABS = [
    { href: "/", icon: "home", label: tr("homeWord"), match: (p) => p === "/" },
    { href: "/books", icon: "compass", label: tr("navDiscover"), match: (p) => p.startsWith("/books") },
    null, // search — handled separately, opens an overlay instead of navigating
    { href: "/account", icon: "user", label: tr("shelfWord"), match: (p) => p.startsWith("/account") },
    { href: "/leaderboard", icon: "trophy", label: tr("navBookwormRanking"), match: (p) => p.startsWith("/leaderboard") },
  ];

  return (
    <>
      <nav
        className="border-line bg-surface/95 fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t backdrop-blur-lg lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label={tr("navMenu")}
      >
        {TABS.map((tab, i) => {
          if (!tab) {
            return (
              <button key="search" onClick={() => setSearchOpen(true)}
                className="text-muted flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium">
                <Icon name="search" size={20} />
                {tr("searchWord")}
              </button>
            );
          }
          const active = tab.match(relPath);
          return (
            <Link key={tab.href} href={`/${lang}${tab.href}`} prefetch={false}
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition ${active ? "text-brand-600" : "text-muted"}`}>
              <Icon name={tab.icon} size={20} className={active ? "scale-110" : ""} />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 p-4 pt-6 lg:hidden" onClick={() => setSearchOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <SearchBar lang={lang} placeholder={tr("search")} big onNavigate={() => setSearchOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
