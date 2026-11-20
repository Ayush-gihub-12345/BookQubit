"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import Icon from "@/components/Icon";

// "Make a list": a title and an optional description; books are added from any book page or from the list itself.
export default function CreateList({ lang }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const start = () => {
    if (!getFirebaseAuth()?.currentUser) { router.push(`/${lang}/login`); return; }
    setOpen(true);
  };
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const res = await authFetch("/api/lists", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, description }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(d.error || "Could not create the list."); return; }
      router.push(`/${lang}/lists/${d.id}`);
    } finally { setBusy(false); }
  };

  if (!open) return <button type="button" onClick={start} className="btn-primary inline-flex items-center gap-2"><Icon name="plus" size={15} />Make a list</button>;
  return (
    <form onSubmit={submit} className="card w-full space-y-3 p-4 hover:!translate-y-0 sm:w-96">
      <label className="block text-sm font-semibold" htmlFor="nl-title">Title</label>
      <input id="nl-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Best space operas" className="input" autoFocus />
      <label className="block text-sm font-semibold" htmlFor="nl-desc">Description (optional)</label>
      <textarea id="nl-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={600} rows={2} className="input" />
      {err && <p role="alert" className="text-sm text-red-500">{err}</p>}
      <div className="flex gap-2">
        <button className="btn-primary" disabled={busy || title.trim().length < 3}>{busy ? "Creating…" : "Create list"}</button>
        <button type="button" onClick={() => setOpen(false)} className="btn-soft">Cancel</button>
      </div>
    </form>
  );
}
