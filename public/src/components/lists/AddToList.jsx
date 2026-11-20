"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import Icon from "@/components/Icon";

// "Add to a list": loads the reader's own lists on first open, adds this book to the one they pick, or starts a new list with it.
export default function AddToList({ slug, lang }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState(null);
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const json = (body) => ({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const toggle = async () => {
    if (!getFirebaseAuth()?.currentUser) { router.push(`/${lang}/login`); return; }
    const next = !open;
    setOpen(next);
    if (next && !lists) {
      try {
        const d = await authFetch("/api/lists?mine=1").then((r) => r.json());
        setLists(d.lists || []);
      } catch { setLists([]); setMsg("Couldn't load your lists."); }
    }
  };
  const add = async (id, name) => {
    setBusy(true); setMsg("");
    try {
      const res = await authFetch(`/api/lists/${id}`, json({ action: "add", slug }));
      const d = await res.json().catch(() => ({}));
      setMsg(res.ok ? (d.added === false ? `Already in "${name}".` : `Added to "${name}".`) : d.error || "Could not add.");
    } finally { setBusy(false); }
  };
  const create = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg("");
    try {
      const res = await authFetch("/api/lists", json({ title, books: [slug] }));
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg(d.error || "Could not create the list."); return; }
      setLists((l) => [{ id: d.id, title: title.trim(), item_count: 1 }, ...(l || [])]);
      setTitle(""); setMsg(`Created "${title.trim()}" with this book.`);
    } finally { setBusy(false); }
  };

  return (
    <div className="relative inline-block">
      <button type="button" onClick={toggle} aria-expanded={open} className="btn-soft inline-flex items-center gap-2"><Icon name="list" size={15} />Add to a list</button>
      {open && (
        <div className="card absolute start-0 z-30 mt-2 w-72 space-y-2 p-3 hover:!translate-y-0">
          {lists === null ? <p className="text-muted text-sm">Loading…</p> : (
            <ul className="max-h-48 space-y-1 overflow-y-auto">
              {lists.map((l) => (
                <li key={l.id}><button type="button" disabled={busy} onClick={() => add(l.id, l.title)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-start text-sm hover:bg-[var(--surface-2)]"><span className="truncate">{l.title}</span><span className="text-muted ms-2 text-xs">{l.item_count}</span></button></li>
              ))}
              {lists.length === 0 && <li className="text-muted px-2 text-sm">You have no lists yet.</li>}
            </ul>
          )}
          <form onSubmit={create} className="flex gap-2 border-t border-[var(--line)] pt-2">
            <label className="sr-only" htmlFor="atl-title">New list title</label>
            <input id="atl-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="New list title" className="input !min-h-9 flex-1 text-sm" />
            <button className="btn-soft btn-sm" disabled={busy || title.trim().length < 3}>Create</button>
          </form>
          {msg && <p role="status" className="text-sm">{msg}</p>}
        </div>
      )}
    </div>
  );
}
