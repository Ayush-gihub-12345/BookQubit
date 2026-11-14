"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch, whenSignedIn } from "@/lib/authFetch";
import { useLang } from "@/lib/useLang";

export default function MindSpaceHome() {
  const lang = useLang();
  const [user, setUser] = useState(undefined);
  const [spaces, setSpaces] = useState(null);
  const [unavailable, setUnavailable] = useState(false);
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const r = await authFetch("/api/mindspace");
    if (!r) return;
    if (r.status === 503) return setUnavailable(true);
    if (r.ok) setSpaces((await r.json()).spaces);
  }
  useEffect(() => { whenSignedIn().then((u) => { setUser(u); if (u) load(); }); }, []);

  async function create(e) {
    e.preventDefault(); setError("");
    const r = await authFetch("/api/mindspace", { method: "POST", body: JSON.stringify({ title, visibility: isPublic ? "public" : "private" }) });
    if (r && r.ok) { const s = await r.json(); window.location.href = `/${lang}/mindspace/${encodeURIComponent(s.slug)}`; return; }
    const code = (await r?.json().catch(() => ({})))?.error;
    setError(code === "space_limit" ? "You've reached the 30-space limit. Delete one to make room." : "Couldn't create the space. Try again.");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-editorial text-3xl font-semibold">MindSpace</h1>
      <p className="text-muted mt-1 max-w-xl">Collect books, quotes and your own notes into spaces, connect the ideas, and keep them private or publish them.</p>

      {unavailable && <p className="text-muted mt-8">MindSpace isn&apos;t available yet.</p>}
      {user === null && (
        <div className="border-line bg-surface mt-8 rounded-2xl border p-8 text-center">
          <p className="font-editorial text-xl">Sign in to start a space</p>
          <Link href={`/${lang}/login`} className="btn-primary mt-4 inline-flex">Sign in</Link>
        </div>
      )}
      {user && !unavailable && (
        <>
          <form onSubmit={create} className="mt-6 flex flex-wrap items-center gap-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} placeholder="e.g. Mental models for investing" aria-label="Space name" className="border-line bg-surface min-w-0 flex-1 rounded-full border px-4 py-2.5 text-sm" />
            <label className="text-muted flex items-center gap-1.5 text-sm"><input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Public</label>
            <button className="btn-primary">New space</button>
          </form>
          {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
          {!spaces ? <div className="skeleton mt-6 h-32" aria-hidden /> : spaces.length === 0 ? (
            <p className="text-muted border-line mt-6 rounded-2xl border border-dashed p-10 text-center text-sm">No spaces yet. Name your first one above.</p>
          ) : (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {spaces.map((s) => (
                <li key={s.id}>
                  <Link href={`/${lang}/mindspace/${encodeURIComponent(s.slug)}`} className="border-line bg-surface hover:border-brand-500 block rounded-2xl border p-4 transition">
                    <span className="font-editorial block truncate text-lg font-semibold">{s.title}</span>
                    <span className="text-muted mt-1 block text-sm">{s.node_count} {s.node_count === 1 ? "idea" : "ideas"} · {s.visibility === "public" ? "Public" : "Private"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
