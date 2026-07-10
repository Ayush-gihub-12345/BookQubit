"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";

export default function AuthButton({ labels }) {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return auth.onAuthStateChanged(setUser);
  }, []);

  if (!firebaseEnabled) return null;

  if (!user) {
    return (
      <Link href="/login" className="btn-ghost hidden px-4 py-2 text-sm sm:inline-flex">
        {labels.signIn}
      </Link>
    );
  }

  return (
    <div className="relative">
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
        <div className="absolute right-0 top-12 z-[60] w-48 overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
          <p className="truncate border-b border-line px-4 py-3 text-sm font-medium">
            {user.displayName || user.email}
          </p>
          <Link href="/account" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-brand-50 dark:hover:bg-white/5">
            {labels.account}
          </Link>
          <button
            onClick={async () => { await getFirebaseAuth().signOut(); setOpen(false); }}
            className="block w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-500/10"
          >
            {labels.signOut}
          </button>
        </div>
      )}
    </div>
  );
}
