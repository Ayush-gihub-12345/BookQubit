"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/useLang";
import Icon from "@/components/Icon";
import { authFetch, whenSignedIn } from "@/lib/authFetch";

// "Add to shelf" for custom shelves. Renders nothing for signed-out visitors or when the
// engagement database isn't available, so it is never a dead control.
export default function AddToShelf({ slug }) {
  const lang = useLang();
  const [ready, setReady] = useState(false);
  const [shelves, setShelves] = useState([]);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;
    whenSignedIn().then(async (u) => {
      if (!u || !alive) return;
      const r = await authFetch("/api/library/shelves");
      if (r && r.ok && alive) { setShelves((await r.json()).shelves); setReady(true); }
    });
    return () => { alive = false; };
  }, []);

  if (!ready) return null;
  if (!shelves.length) {
    return <Link href={`/${lang}/library`} className="hover:text-brand-600 inline-flex items-center gap-1.5"><Icon name="bookmark" size={14} /> Create a shelf</Link>;
  }

  async function add(id, name) {
    const r = await authFetch("/api/library/shelves", { method: "POST", body: JSON.stringify({ action: "add", shelfId: id, slug }) });
    setMsg(r && r.ok ? `Added to ${name}` : "Couldn't add. Try again.");
    setOpen(false);
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <span className="relative inline-block">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" className="hover:text-brand-600 inline-flex items-center gap-1.5">
        <Icon name="bookmark" size={14} /> Add to shelf
      </button>
      {open && (
        <ul role="menu" className="border-line bg-surface absolute start-0 top-full z-20 mt-1 max-h-56 w-52 overflow-auto rounded-xl border p-1 shadow-lg">
          {shelves.map((s) => (
            <li key={s.id} role="none"><button role="menuitem" type="button" onClick={() => add(s.id, s.name)} className="hover:bg-brand-50 w-full rounded-lg px-3 py-2 text-start text-sm">{s.name}</button></li>
          ))}
        </ul>
      )}
      <span role="status" className="text-brand-700 ms-2 text-xs">{msg}</span>
    </span>
  );
}
