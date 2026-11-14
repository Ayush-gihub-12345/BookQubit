"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch, whenSignedIn } from "@/lib/authFetch";

const EMPTY = { blocked: new Set(), muted: new Set(), people: [], privacy: null };

/**
 * The signed-in reader's blocked/muted user ids and privacy settings (empty when signed out or
 * unavailable). Shared pages (feed, discussions) are cached for everyone, so hiding blocked users
 * happens here on the client instead of fragmenting the cache per reader.
 */
export function useSafety() {
  const [s, setS] = useState(EMPTY);
  const refresh = useCallback(async () => {
    const u = await whenSignedIn();
    if (!u) return;
    const r = await authFetch("/api/safety");
    if (!r || !r.ok) return;
    const j = await r.json();
    setS({ blocked: new Set(j.blocked || []), muted: new Set(j.muted || []), people: j.people || [], privacy: j.privacy || null });
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { ...s, refresh, hides: (userId) => !!userId && (s.blocked.has(userId) || s.muted.has(userId)) };
}

export const safetyAction = (body) => authFetch("/api/safety", { method: "POST", body: JSON.stringify(body) });
