"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import Icon from "./Icon";

export function FollowButton({ type, id, label = "Follow" }) {
  const [user, setUser] = useState(null);
  const [count, setCount] = useState(null);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const load = async (uid) => {
      const r = await fetch(`/api/follow?type=${type}&id=${encodeURIComponent(id)}${uid ? `&uid=${uid}` : ""}`);
      const data = await r.json();
      setCount(data.count);
      setFollowing(data.following);
    };
    if (!auth) { load(); return; }
    return auth.onAuthStateChanged((u) => { setUser(u); load(u?.uid); });
  }, [type, id]);

  const toggle = async () => {
    if (!user) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);
    setCount((c) => (c ?? 0) + (next ? 1 : -1));
    try {
      await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: await user.getIdToken(), type, id, follow: next }),
      });
    } finally { setBusy(false); }
  };

  if (!firebaseEnabled) return null;

  if (!user) {
    return (
      <Link href="/login" className="btn-ghost text-sm">
        <Icon name="heart" size={15} /> {label}{count ? ` · ${count}` : ""}
      </Link>
    );
  }

  return (
    <button onClick={toggle} disabled={busy}
      className={following ? "btn-primary text-sm" : "btn-ghost text-sm"}>
      <Icon name={following ? "check" : "heart"} size={15} />
      {following ? "Following" : label}
      {count !== null && <span className="opacity-70">· {count}</span>}
    </button>
  );
}

export function ShareButton({ label = "Share" }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        const url = window.location.href;
        if (navigator.share) {
          try { await navigator.share({ url }); return; } catch { /* fall through */ }
        }
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="btn-ghost text-sm"
    >
      <Icon name={copied ? "check" : "share"} size={15} />
      {copied ? "Link copied" : label}
    </button>
  );
}
