"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import Icon from "./Icon";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

// The account menu: everything that belongs to the signed-in reader, in one
// place. Grouped as "my reading", "my progress", then sign out, so the header
// itself needs no separate liked / achievements / ranking buttons.
export default function AuthButton({ labels, notifCount = 0 }) {
  const lang = useLang();
  const tr = t(lang);
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return auth.onAuthStateChanged(setUser);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!firebaseEnabled) return null;

  if (!user) {
    return (
      <Link href={`/${lang}/login`} className="btn-primary !min-h-10 whitespace-nowrap !px-4 !py-2 text-sm">
        {labels.signIn}
      </Link>
    );
  }

  const relPath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  const GROUPS = [
    [
      { href: "/account", icon: "bookmark", label: tr("navSettings") },
      { href: "/liked", icon: "heart", label: labels.likedBooks },
      { href: "/notifications", icon: "bell", label: labels.notifications, count: notifCount },
    ],
    [
      { href: "/achievements", icon: "award", label: tr("navAchievements") },
      { href: "/wrapped", icon: "barChart", label: tr("navWrapped") },
      { href: "/leaderboard", icon: "trophy", label: tr("navBookwormRanking") },
      { href: `/readers/${user.uid}`, icon: "user", label: tr("navPublicProfile") },
    ],
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button ref={btnRef} type="button" onClick={() => setOpen(!open)}
        className="grid h-11 w-11 place-items-center rounded-full"
        aria-label={tr("navAccountMenu")} aria-expanded={open} aria-haspopup="menu">
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" className="h-9 w-9 rounded-full ring-2 ring-brand-500/40" referrerPolicy="no-referrer" />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 font-bold" style={{ color: "var(--on-brand, #fff)" }}>
            {(user.displayName || user.email || "U")[0].toUpperCase()}
          </span>
        )}
      </button>
      {open && (
        <div role="menu" className="popover absolute right-0 top-full z-[60] mt-2 w-64 p-1.5">
          <div className="border-line mb-1 border-b px-3 pb-2.5 pt-2">
            <p className="truncate text-sm font-semibold">{user.displayName || user.email}</p>
            {user.displayName && user.email && <p className="text-muted truncate text-xs">{user.email}</p>}
          </div>
          {GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "border-line mt-1 border-t pt-1" : ""}>
              {group.map((l) => (
                <Link key={l.href} href={`/${lang}${l.href}`} role="menuitem" className="menu-item"
                  aria-current={relPath === l.href ? "page" : undefined}>
                  <Icon name={l.icon} size={15} className="text-muted" />
                  <span className="truncate">{l.label}</span>
                  {l.count > 0 && <span className="tab-count ml-auto">{l.count > 9 ? "9+" : l.count}</span>}
                </Link>
              ))}
            </div>
          ))}
          <div className="border-line mt-1 border-t pt-1">
            <button type="button" role="menuitem"
              onClick={async () => { await getFirebaseAuth().signOut(); setOpen(false); }}
              className="menu-item">
              <Icon name="logout" size={15} className="text-muted" /> {labels.signOut}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
