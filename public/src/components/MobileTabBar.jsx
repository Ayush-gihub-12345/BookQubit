"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useEffect, useState } from "react";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

// Mobile bottom bar (< lg): the everyday destinations, with Feed raised in the centre.
// Home · Listen · [Feed] · Community · You (the reader's own space: shelf, stats, settings; "Sign in" when signed out). The content sections (Discover, Authors, Comics, Collections) live in the
// chip row under the header, so nothing appears in both places. Safe-area aware; every item is a real page.
export default function MobileTabBar() {
  const lang = useLang();
  const tr = t(lang);
  const pathname = usePathname();
  const rel = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (!firebaseEnabled) return;
    const auth = getFirebaseAuth();
    if (!auth) return;
    return auth.onAuthStateChanged(setUser);
  }, []);
  const under = (...roots) => roots.some((r) => rel === r || rel.startsWith(`${r}/`));

  // Community is a full-height chat surface with its own composer pinned to the bottom (ConditionalFooter hides
  // the footer there for the same reason); a second fixed bar would cover it.
  if (under("/community")) return null;

  const TABS = [
    { href: "/", icon: "home", label: tr("homeWord"), active: rel === "/" },
    { href: "/listen", icon: "headphones", label: "Listen", active: under("/listen") },
    { href: "/feed", icon: "flame", label: "Feed", active: under("/feed"), fab: true },
    { href: "/community", icon: "users", label: tr("navCommunity"), active: under("/connect", "/leaderboard") },
    { href: user ? "/library" : "/login", icon: "user", label: user ? "You" : tr("signIn"), you: true,
      active: user ? under("/library", "/account", "/liked", "/achievements", "/wrapped", "/mindspace", "/readers", "/notifications") : under("/login") },
  ];

  return (
    <nav aria-label={tr("navMenu")} className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--bg)] pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {TABS.map((tab) => (
          <li key={tab.href} className="flex">
            <Link href={`/${lang}${tab.href === "/" ? "" : tab.href}`} prefetch={false} aria-current={tab.active ? "page" : undefined} aria-label={tab.label}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${tab.active || tab.fab ? "text-[var(--fg)]" : "text-[var(--muted)]"}`}>
              {tab.fab ? (
                <>
                  <span className={`-mt-6 grid h-12 w-12 place-items-center rounded-full text-[var(--on-brand)] shadow-[var(--shadow-2)] ring-4 ring-[var(--bg)] ${tab.active ? "scale-105" : ""}`}
                    style={{ background: "var(--color-brand-500)" }}>
                    <Icon name={tab.icon} size={22} filled={tab.active} />
                  </span>
                  <span className="-mt-0.5">{tab.label}</span>
                </>
              ) : (
                <>
                  <span className={`grid h-7 w-12 place-items-center rounded-full ${tab.active ? "bg-brand-50" : ""}`}>
                    {tab.you && user ? (
                      user.photoURL
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className={`h-6 w-6 rounded-full object-cover ${tab.active ? "ring-2 ring-[var(--fg)]" : ""}`} />
                        : <span className={`grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-[11px] font-bold ${tab.active ? "ring-2 ring-[var(--fg)]" : ""}`} style={{ color: "var(--on-brand, #fff)" }}>{(user.displayName || user.email || "U")[0].toUpperCase()}</span>
                    ) : (
                      <Icon name={tab.icon} size={21} strokeWidth={tab.active ? 2.4 : 2} />
                    )}
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
