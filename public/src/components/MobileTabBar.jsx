"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

// Bottom bar for phones and tablets (`lg:hidden`; desktop has the full
// header). Five destinations, each a real page: Home, Discover, Library,
// Community, Ranking. Search used to sit in the middle and open an overlay,
// but the header now carries a search field on every screen, so that slot
// went to the reader's own library instead. The main layout pads its content
// by this bar's height so nothing renders underneath it.
export default function MobileTabBar() {
  const lang = useLang();
  const tr = t(lang);
  const pathname = usePathname();
  const relPath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  const under = (...roots) => roots.some((r) => relPath === r || relPath.startsWith(`${r}/`));

  // Community is a full-height chat surface with its own composer pinned to
  // the bottom (ConditionalFooter hides the footer there for the same
  // reason); a second fixed bar would cover it.
  if (under("/community")) return null;

  const TABS = [
    { href: "/", icon: "home", label: tr("homeWord"), active: relPath === "/" },
    { href: "/books", icon: "compass", label: tr("navDiscover"), active: under("/books", "/categories", "/collections", "/tags", "/authors", "/publications", "/comics", "/compare") },
    { href: "/library", icon: "bookmark", label: tr("navLibrary"), active: under("/library", "/account", "/liked", "/achievements", "/wrapped", "/mindspace") },
    { href: "/community", icon: "users", label: tr("navCommunity"), active: under("/readers") },
    { href: "/leaderboard", icon: "trophy", label: tr("navRankingShort"), active: under("/leaderboard") },
  ];

  return (
    <nav
      className="border-line bg-surface/95 fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label={tr("navMenu")}
    >
      {TABS.map((tab) => (
        <Link key={tab.href} href={`/${lang}${tab.href === "/" ? "" : tab.href}`} prefetch={false}
          aria-current={tab.active ? "page" : undefined}
          className={`relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-medium transition-colors ${tab.active ? "text-brand-600" : "text-muted"}`}>
          {tab.active && <span className="absolute top-0 h-0.5 w-8 rounded-b bg-brand-600" aria-hidden="true" />}
          <Icon name={tab.icon} size={20} strokeWidth={tab.active ? 2.4 : 2} />
          <span className="max-w-full truncate">{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}
