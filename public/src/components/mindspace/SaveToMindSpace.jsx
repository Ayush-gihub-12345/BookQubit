"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { authFetch, whenSignedIn } from "@/lib/authFetch";
import { useLang } from "@/lib/useLang";

/**
 * One-tap "Save to MindSpace" for books, quotes and notes. Opens a small sheet to pick a space
 * (or name a new one). Hidden for signed-out visitors and when MindSpace isn't available, so it
 * is never a dead control. `node` = { kind, title?, body?, bookSlug?, url? }.
 */
export default function SaveToMindSpace({ node, label = "Save to MindSpace", className = "" }) {
  const lang = useLang();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [spaces, setSpaces] = useState([]);
  const [pick, setPick] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    whenSignedIn().then(async (u) => {
      if (!u || !alive) return;
      const r = await authFetch("/api/mindspace");
      if (r && r.ok && alive) { const { spaces: s } = await r.json(); setSpaces(s); setPick(s[0]?.id || ""); setReady(true); }
    });
    return () => { alive = false; };
  }, []);
  if (!ready) return null;

  async function save() {
    setBusy(true); setMsg("");
    const body = pick && !name.trim() ? { spaceId: pick, node } : { newSpaceTitle: name.trim(), node };
    const r = await authFetch("/api/mindspace/save", { method: "POST", body: JSON.stringify(body) });
    setBusy(false);
    if (r && r.ok) {
      const j = await r.json();
      setMsg("Saved.");
      if (!pick || name.trim()) { setSpaces((s) => [{ id: j.spaceId, title: name.trim(), slug: "" }, ...s]); setPick(j.spaceId); setName(""); }
      setTimeout(() => { setOpen(false); setMsg(""); }, 900);
    } else {
      const code = (await r?.json().catch(() => ({})))?.error;
      setMsg(code === "node_limit" ? "That space is full (500 ideas)." : code === "space_required" ? "Pick a space or name a new one." : "Couldn't save. Try again.");
    }
  }

  return (
    <span className="relative inline-block">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="dialog" className={`hover:text-brand-600 inline-flex items-center gap-1.5 ${className}`}>
        <Icon name="layers" size={14} /> {label}
      </button>
      {open && (
        <div role="dialog" aria-label="Save to MindSpace" className="border-line bg-surface absolute start-0 top-full z-30 mt-2 w-72 space-y-3 rounded-2xl border p-4 text-sm text-[var(--fg)] shadow-xl">
          {spaces.length > 0 && (
            <label className="block"><span className="text-muted text-xs">Space</span>
              <select value={pick} onChange={(e) => setPick(e.target.value)} className="border-line bg-surface mt-1 w-full rounded-lg border px-2 py-2">
                {spaces.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </label>
          )}
          <label className="block"><span className="text-muted text-xs">{spaces.length ? "Or start a new space" : "Name your first space"}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} placeholder="e.g. Stoic philosophy" className="border-line bg-surface mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={save} disabled={busy || (!pick && !name.trim())} className="btn-primary !px-4 !py-1.5 !text-sm disabled:opacity-50">Save</button>
            <a href={`/${lang}/mindspace`} className="text-muted text-xs underline">Open MindSpace</a>
          </div>
          <p role="status" className="text-brand-700 text-xs">{msg}</p>
        </div>
      )}
    </span>
  );
}
