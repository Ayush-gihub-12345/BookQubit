"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/authFetch";
import { useLang } from "@/lib/useLang";
import Icon from "@/components/Icon";

const STATUSES = [
  ["reading", "Currently reading"],
  ["want", "Want to read"],
  ["read", "Read"],
  ["paused", "Paused"],
];

async function setStatus(user, slug, status) {
  const idToken = await user.getIdToken();
  return fetch("/api/shelf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken, slug, status }) });
}

function ProgressPanel({ book, onSaved }) {
  const [percent, setPercent] = useState(book.progress || 0);
  const [pages, setPages] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function save(finished = false) {
    setBusy(true); setErr("");
    const res = await authFetch("/api/library/progress", {
      method: "POST",
      body: JSON.stringify({ slug: book.book_slug, percent: finished ? 100 : percent, pages: Number(pages) || 0, finished }),
    });
    setBusy(false);
    if (res && res.ok) { onSaved({ progress: finished ? 100 : percent, status: finished ? "read" : "reading" }); setPages(""); }
    else setErr("Couldn't save. Try again.");
  }

  return (
    <div className="border-line mt-3 space-y-3 border-t pt-3 text-sm">
      <label className="block">
        <span className="text-muted">Progress: {percent}%</span>
        <input type="range" min="0" max="100" value={percent} onChange={(e) => setPercent(Number(e.target.value))} className="accent-brand-600 mt-1 w-full" />
      </label>
      <label className="flex items-center gap-2">
        <span className="text-muted">Pages read today</span>
        <input type="number" min="0" max="2000" inputMode="numeric" value={pages} onChange={(e) => setPages(e.target.value)} className="border-line bg-surface w-20 rounded-lg border px-2 py-1" />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => save(false)} disabled={busy} className="btn-primary !px-4 !py-1.5 !text-sm disabled:opacity-50">Save progress</button>
        <button type="button" onClick={() => save(true)} disabled={busy} className="border-line rounded-full border px-4 py-1.5 text-sm">Mark finished</button>
      </div>
      {err && <p role="alert" className="text-red-600">{err}</p>}
    </div>
  );
}

function BookRow({ b, user, lang, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="border-line bg-surface rounded-2xl border p-3">
      <div className="flex gap-3">
        <Link href={`/${lang}/books/${encodeURIComponent(b.book_slug)}`} className="h-20 w-14 shrink-0 overflow-hidden rounded-md bg-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {b.cover_url && <img src={b.cover_url} alt="" className="h-full w-full object-cover" loading="lazy" />}
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/${lang}/books/${encodeURIComponent(b.book_slug)}`} className="font-editorial block truncate font-semibold hover:underline">{b.title || b.book_slug}</Link>
          <p className="text-muted truncate text-sm">{b.author}</p>
          {b.status === "reading" && (
            <div className="mt-2 flex items-center gap-2">
              <div className="bg-line h-1.5 flex-1 overflow-hidden rounded-full"><div className="bg-brand-600 h-full" style={{ width: `${b.progress || 0}%` }} /></div>
              <span className="text-muted text-xs tabular-nums">{b.progress || 0}%</span>
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <select value={b.status} aria-label={`Move ${b.title || "book"} to another shelf`} className="border-line bg-surface rounded-full border px-2 py-1"
              onChange={async (e) => { const s = e.target.value; const r = await setStatus(user, b.book_slug, s); if (r.ok) onChange({ status: s }); }}>
              {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            {(b.status === "reading" || b.status === "paused") && (
              <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="text-brand-700 inline-flex items-center gap-1 font-medium">
                <Icon name="barChart" size={13} /> Update progress
              </button>
            )}
          </div>
        </div>
      </div>
      {open && <ProgressPanel book={b} onSaved={(patch) => { onChange(patch); setOpen(false); }} />}
    </li>
  );
}

function CustomShelves({ lang }) {
  const [shelves, setShelves] = useState(null);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [open, setOpen] = useState(null);
  const [items, setItems] = useState([]);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const r = await authFetch("/api/library/shelves");
    if (!r) return;
    if (r.status === 503) return setUnavailable(true);
    if (r.ok) setShelves((await r.json()).shelves);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create(e) {
    e.preventDefault(); setError("");
    const r = await authFetch("/api/library/shelves", { method: "POST", body: JSON.stringify({ action: "create", name, visibility: isPublic ? "public" : "private" }) });
    if (r && r.ok) { setName(""); load(); } else setError((await r?.json().catch(() => ({})))?.error || "Couldn't create the shelf.");
  }
  async function show(id) {
    if (open === id) return setOpen(null);
    const r = await authFetch(`/api/library/shelves?id=${id}`);
    if (r && r.ok) { setItems((await r.json()).items); setOpen(id); }
  }
  if (unavailable) return <p className="text-muted text-sm">Custom shelves aren&apos;t available yet.</p>;

  return (
    <section aria-labelledby="cs-h" className="mt-10">
      <h2 id="cs-h" className="font-editorial text-xl font-semibold">Your shelves</h2>
      <form onSubmit={create} className="mt-3 flex flex-wrap items-center gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required placeholder="New shelf name" aria-label="New shelf name" className="border-line bg-surface min-w-0 flex-1 rounded-full border px-4 py-2 text-sm" />
        <label className="text-muted flex items-center gap-1.5 text-sm"><input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Public</label>
        <button className="btn-primary !px-4 !py-2 !text-sm">Create shelf</button>
      </form>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      <ul className="mt-4 space-y-2">
        {(shelves || []).map((s) => (
          <li key={s.id} className="border-line bg-surface rounded-2xl border p-3">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => show(s.id)} aria-expanded={open === s.id} className="font-editorial min-w-0 flex-1 truncate text-start font-semibold">{s.name} <span className="text-muted text-sm font-normal">· {s.n} {s.n === 1 ? "book" : "books"}</span></button>
              <button type="button" className="text-muted text-xs underline" aria-label={`Make ${s.name} ${s.visibility === "public" ? "private" : "public"}`}
                onClick={async () => { await authFetch("/api/library/shelves", { method: "PATCH", body: JSON.stringify({ id: s.id, visibility: s.visibility === "public" ? "private" : "public" }) }); load(); }}>
                {s.visibility === "public" ? "Public" : "Private"}
              </button>
              <button type="button" className="text-muted text-xs underline" aria-label={`Delete ${s.name}`}
                onClick={async () => { if (confirm(`Delete “${s.name}”? The books stay in your library.`)) { await authFetch("/api/library/shelves", { method: "DELETE", body: JSON.stringify({ id: s.id }) }); setOpen(null); load(); } }}>Delete</button>
            </div>
            {open === s.id && (
              <ul className="mt-3 space-y-1.5 text-sm">
                {items.length === 0 && <li className="text-muted">Empty. Use “Add to shelf” on any book page.</li>}
                {items.map((i) => (
                  <li key={i.book_slug} className="flex items-center justify-between gap-3">
                    <Link href={`/${lang}/books/${encodeURIComponent(i.book_slug)}`} className="truncate hover:underline">{i.title}</Link>
                    <button type="button" className="text-muted text-xs underline"
                      onClick={async () => { await authFetch("/api/library/shelves", { method: "POST", body: JSON.stringify({ action: "remove", shelfId: s.id, slug: i.book_slug }) }); setItems((x) => x.filter((y) => y.book_slug !== i.book_slug)); load(); }}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function LibraryView({ user }) {
  const lang = useLang();
  const [tab, setTab] = useState("reading");
  const [books, setBooks] = useState(null);
  const [error, setError] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return; loaded.current = true;
    fetch(`/api/shelf?uid=${user.uid}`).then((r) => r.json()).then((d) => setBooks(d.shelf || [])).catch(() => setError(true));
  }, [user.uid]);

  if (error) return <p role="alert" className="text-muted">Couldn&apos;t load your shelves. Refresh to try again.</p>;
  if (!books) return <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-24" aria-hidden />)}</div>;

  const counts = Object.fromEntries(STATUSES.map(([v]) => [v, books.filter((b) => b.status === v).length]));
  const shown = books.filter((b) => b.status === tab);

  return (
    <>
      <div role="tablist" aria-label="Shelves" className="flex flex-wrap gap-2">
        {STATUSES.map(([v, l]) => (
          <button key={v} role="tab" type="button" aria-selected={tab === v} onClick={() => setTab(v)}
            className={`rounded-full border px-4 py-1.5 text-sm ${tab === v ? "border-brand-600 bg-brand-600 text-white" : "border-line"}`}>
            {l} <span className="opacity-70">{counts[v]}</span>
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="border-line mt-6 rounded-2xl border border-dashed p-8 text-center">
          <p className="font-editorial text-lg">Nothing here yet</p>
          <p className="text-muted mt-1 text-sm">Find a book to start, or bring your history over from Goodreads.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href={`/${lang}/books`} className="btn-primary">Browse books</Link>
            <Link href={`/${lang}/library/import`} className="border-line rounded-full border px-5 py-2 text-sm">Import from Goodreads</Link>
          </div>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {shown.map((b) => (
            <BookRow key={b.book_slug} b={b} user={user} lang={lang}
              onChange={(patch) => setBooks((all) => all.map((x) => (x.book_slug === b.book_slug ? { ...x, ...patch } : x)))} />
          ))}
        </ul>
      )}
      <CustomShelves lang={lang} />
    </>
  );
}
