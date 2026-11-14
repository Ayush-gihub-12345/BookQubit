"use client";

import { useEffect, useState } from "react";
import { authFetch, whenSignedIn } from "@/lib/authFetch";

const EMPTY = { blocked: new Set(), muted: new Set() };

/**
 * The signed-in reader's blocked/muted user ids (empty when signed out or unavailable).
 * Shared pages (feed, discussions) are cached for everyone, so hiding blocked users happens here,
 * on the client, instead of fragmenting the cache per reader.
 */
export function useSafety() {
  const [s, setS] = useState(EMPTY);
  useEffect(() => {
    let alive = true;
    whenSignedIn().then(async (u) => {
      if (!u) return;
      const r = await authFetch("/api/safety");
      if (!r || !r.ok || !alive) return;
      const j = await r.json();
      setS({ blocked: new Set(j.blocked || []), muted: new Set(j.muted || []) });
    });
    return () => { alive = false; };
  }, []);
  return { ...s, hides: (userId) => !!userId && (s.blocked.has(userId) || s.muted.has(userId)) };
}
