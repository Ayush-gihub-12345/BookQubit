"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import Icon from "@/components/Icon";
import ReportContent from "@/components/ReportContent";

// Vote (everyone but the owner) and delete (owner). The page itself is cached for a minute and has no viewer state,
// so whether you already voted comes from the API on mount.
export default function ListActions({ lang, id, ownerId, votes }) {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [count, setCount] = useState(votes);
  const [voted, setVoted] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return auth.onAuthStateChanged(async (u) => {
      setMe(u || null);
      if (!u) { setVoted(false); return; }
      try {
        const d = await authFetch(`/api/lists/${id}`, {}, u).then((r) => r.json());
        setVoted(!!d.voted);
      } catch { /* the vote button still works */ }
    });
  }, [id]);

  const vote = async () => {
    if (!me) { router.push(`/${lang}/login`); return; }
    setErr("");
    const res = await authFetch(`/api/lists/${id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "vote" }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(d.error || "Could not vote."); return; }
    setVoted(d.voted); setCount(d.vote_count);
  };
  const remove = async () => {
    if (!window.confirm("Delete this list? This cannot be undone.")) return;
    const res = await authFetch(`/api/lists/${id}`, { method: "DELETE" });
    if (res.ok) router.push(`/${lang}/lists`);
    else setErr("Could not delete the list.");
  };
  const mine = me?.uid === ownerId;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      {!mine && (
        <button type="button" onClick={vote} aria-pressed={voted} className={`btn-soft inline-flex items-center gap-2 ${voted ? "!text-brand-700" : ""}`}>
          <Icon name="thumbsUp" size={15} />{voted ? "Voted" : "Vote"} · {count}
        </button>
      )}
      {!mine && <ReportContent targetType="list" targetId={id} label="Report this list" />}
      {mine && <span className="text-muted inline-flex items-center gap-1 text-sm"><Icon name="thumbsUp" size={14} />{count} votes</span>}
      {mine && <button type="button" onClick={remove} className="text-sm font-semibold text-red-500 hover:underline">Delete list</button>}
      {err && <p role="alert" className="text-sm text-red-500">{err}</p>}
    </div>
  );
}
