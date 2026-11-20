"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

// Mobile bottom bar (< lg): the everyday destinations, with Feed raised in the centre.
// Home · Listen · [Feed] · Shelf · Community. The content sections (Discover, Authors, Comics, Collections) live in the
// chip row under the header, so nothing appears in both places. Safe-area aware; every item is a real page.
export default function MobileTabBar() {
  const lang = useLang();
  const tr = t(lang);
  const pathname = usePathname();
  const rel = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  const under = (...roots) => roots.some((r) => rel === r || rel.startsWith(`${r}/`));

  // Community is a full-height chat surface with its own composer pinned to the bottom (ConditionalFooter hides
  // the footer there for the same reason); a second fixed bar would cover it.
  if (under("/community")) return null;

  const TABS = [
    { href: "/", icon: "home", label: tr("homeWord"), active: rel === "/" },
    { href: "/listen", icon: "headphones", label: "Listen", active: under("/listen") },
    { href: "/feed", icon: "flame", label: "Feed", active: under("/feed"), fab: true },
    { href: "/library", icon: "bookmark", label: tr("shelfWord"), active: under("/library", "/account", "/liked", "/achievements", "/wrapped", "/mindspace") },
    { href: "/community", icon: "users", label: tr("navCommunity"), active: under("/connect", "/readers", "/leaderboard") },
  ];

  return (
    <nav aria-label={tr("navMenu")} className="glass fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {TABS.map((tab) => (
          <li key={tab.href} className="flex">
            <Link href={`/${lang}${tab.href === "/" ? "" : tab.href}`} prefetch={false} aria-current={tab.active ? "page" : undefined} aria-label={tab.label}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${tab.active || tab.fab ? "text-[var(--fg)]" : "text-[var(--muted)]"}`}>
              {tab.fab ? (
                <>
                  <span className={`-mt-6 grid h-12 w-12 place-items-center rounded-full text-[var(--on-brand)] shadow-[var(--shadow-2)] ring-4 ring-[var(--bg)] ${tab.active ? "scale-105" : ""}`}
                    style={{ background: "linear-gradient(135deg, var(--color-brand-500), color-mix(in oklab, var(--color-brand-500) 62%, var(--color-qubit-500)))" }}>
                    <Icon name={tab.icon} size={22} filled={tab.active} />
                  </span>
                  <span className="-mt-0.5">{tab.label}</span>
                </>
              ) : (
                <>
                  <span className={`grid h-7 w-12 place-items-center rounded-full ${tab.active ? "bg-brand-50" : ""}`}>
                    <Icon name={tab.icon} size={21} strokeWidth={tab.active ? 2.4 : 2} />
                  </span>
                  <span className="max-w-full truncate px-0.5">{tab.label}</span>
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
