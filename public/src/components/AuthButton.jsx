"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import Icon from "./Icon";

// Beyond the account/sign-out links this dropdown already had, these give
// quick access to a reader's other saved state without navigating through
// the account page first — a standard SaaS profile-menu pattern.
const QUICK_LINKS = [
  { href: "/liked", icon: "heart", label: "Liked Books" },
  { href: "/achievements", icon: "award", label: "Achievements" },
  { href: "/leaderboard", icon: "trophy", label: "Leaderboard" },
];

export default function AuthButton({ labels }) {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return auth.onAuthStateChanged(setUser);
  }, []);

  // Close the dropdown on any click outside it (or Escape), not just its
  // own links/buttons — the previous version only closed via those.
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => { if (e.key === "Escape") setOpen(false); };
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
      <Link href="/login" className="btn-ghost hidden px-4 py-2 text-sm sm:inline-flex">
        {labels.signIn}
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen(!open)} className="flex items-center" aria-label="Account menu">
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" className="h-9 w-9 rounded-full ring-2 ring-brand-500/50" />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 font-bold text-white">
            {(user.displayName || user.email || "U")[0].toUpperCase()}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-[60] w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
          <p className="truncate border-b border-line px-4 py-3 text-sm font-medium">
            {user.displayName || user.email}
          </p>
          <Link href="/account" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-brand-50 dark:hover:bg-white/5">
            <Icon name="user" size={15} className="text-muted" /> {labels.account}
          </Link>
          {QUICK_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-brand-50 dark:hover:bg-white/5">
              <Icon name={l.icon} size={15} className="text-muted" /> {l.label}
            </Link>
          ))}
          <button
            onClick={async () => { await getFirebaseAuth().signOut(); setOpen(false); }}
            className="flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-500/10"
          >
            <Icon name="logout" size={15} /> {labels.signOut}
          </button>
        </div>
      )}
    </div>
  );
}
