"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";

export default function ReplyForm({ discussionId }) {
  const [user, setUser] = useState(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return auth.onAuthStateChanged(setUser);
  }, []);

  if (!firebaseEnabled) return null;
  if (!user) return <Link href="/login" className="btn-ghost text-sm">Sign in to reply</Link>;

  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    try {
      await fetch(`/api/discussions/${discussionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: await user.getIdToken(), body: body.trim() }),
      });
      setBody("");
      router.refresh();
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={1} maxLength={2000}
        placeholder="Write a reply…" className="input flex-1 resize-none text-sm" />
      <button type="submit" disabled={busy || !body.trim()} className="btn-primary shrink-0 text-sm">
        {busy ? "…" : "Reply"}
      </button>
    </form>
  );
}
