"use client";

// Surprise me (UI v2.1): a global provider plus a modal. Any component can call `useSurprise().open()`.
// Filters (mood, length, genre, source), a shuffle animation, reroll (R key), no repeats, share and "Want to read".
// Data comes from GET /api/surprise. Everything opens with a real link too (/surprise), so it works without JavaScript.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { getFirebaseAuth } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";

const MOODS = ["Any", "Inspiring", "Adventurous", "Dark", "Funny", "Hopeful", "Mysterious", "Reflective", "Emotional"];
const LENGTHS = [["", "Any length"], ["short", "Under 250 pages"], ["medium", "250–450"], ["long", "450+"]];
// Genre names are catalog data (category column); these match the curated genres in lib/genres.js.
const GENRES = ["Any", "Fiction", "Self-help", "Business", "Philosophy", "History", "Psychology", "Science fiction", "Comics"];

const SurpriseCtx = createContext({ open: () => {} });
export const useSurprise = () => useContext(SurpriseCtx);

export function SurpriseProvider({ locale, children }) {
  const [isOpen, setOpen] = useState(false);
  const [preset, setPreset] = useState({});
  const open = useCallback((p = {}) => { setPreset(p); setOpen(true); }, []);
  return (
    <SurpriseCtx.Provider value={{ open }}>
      {children}
      {isOpen && <SurpriseModal locale={locale} preset={preset} onClose={() => setOpen(false)} />}
    </SurpriseCtx.Provider>
  );
}

/** A link to /surprise that opens the modal instead (progressive enhancement: the plain link still works). */
export function SurpriseLink({ locale, className = "", children, preset, onNavigate, ...rest }) {
  const { open } = useSurprise();
  return (
    <Link
      href={`/${locale}/surprise`}
      prefetch={false}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let "open in new tab" work
        e.preventDefault();
        onNavigate?.();
        open(preset);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}

async function fetchBook(locale, f, exclude) {
  const qs = new URLSearchParams({ locale, exclude: exclude.slice(-30).join(",") });
  for (const [k, v] of Object.entries(f)) if (v) qs.set(k, v);
  const res = f.source === "shelf"
    ? await authFetch(`/api/surprise?${qs}`, { cache: "no-store" })
    : await fetch(`/api/surprise?${qs}`, { cache: "no-store" });
  if (!res) return { status: "signin" };
  if (res.status === 401) return { status: "signin" };
  if (res.status === 404) return { status: "empty" };
  if (!res.ok) throw new Error("surprise failed");
  return { status: "ready", book: await res.json() };
}

function SurpriseModal({ locale, preset, onClose }) {
  const router = useRouter();
  const [f, setF] = useState({ source: "all", ...preset });
  const [book, setBook] = useState(null);
  const [state, setState] = useState("rolling"); // rolling | ready | empty | signin | error
  const [saved, setSaved] = useState(false);
  const seen = useRef([]);
  const dialog = useRef(null);

  const roll = useCallback(async (filters) => {
    setState("rolling"); setSaved(false);
    const started = Date.now();
    try {
      const r = await fetchBook(locale, filters, seen.current);
      await new Promise((res) => setTimeout(res, Math.max(0, 650 - (Date.now() - started)))); // let the dice spin
      if (r.status !== "ready") { setState(r.status); return; }
      seen.current.push(r.book.slug); setBook(r.book); setState("ready");
    } catch { setState("error"); }
  }, [locale]);

  useEffect(() => { roll(f); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => {
    const prev = document.activeElement;
    dialog.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key.toLowerCase() === "r" && !e.target.closest("input,textarea,select")) roll(f);
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; prev?.focus?.(); };
  }, [f, onClose, roll]);

  const update = (patch) => { const n = { ...f, ...patch }; setF(n); roll(n); };
  const share = async () => {
    if (!book) return;
    const url = `${location.origin}/${locale}/books/${book.slug}`;
    try { if (navigator.share) await navigator.share({ title: book.title, url }); else await navigator.clipboard.writeText(url); } catch { /* cancelled */ }
  };
  // Uses the existing shelf API (token in the body, like every other shelf write on the site).
  const wantToRead = async () => {
    const user = getFirebaseAuth()?.currentUser;
    if (!user) { onClose(); router.push(`/${locale}/login`); return; }
    const idToken = await user.getIdToken();
    const r = await fetch("/api/shelf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken, slug: book.slug, status: "want" }) });
    if (r.ok) setSaved(true);
  };

  const empty = {
    empty: f.source === "shelf" ? "Nothing on your want-to-read shelf matches. Add a few books, or switch to the whole library." : "No book matches all of that. Loosen a filter and try again.",
    signin: "Sign in to pick from your want-to-read shelf, or switch to the whole library.",
    error: "Couldn't reach the library. Check your connection and roll again.",
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="surprise-title"
        className="panel animate-pop relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-b-none outline-none sm:rounded-[var(--radius-xl)]">
        <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3.5">
          <h2 id="surprise-title" className="font-display flex items-center gap-2 text-lg font-bold"><Icon name="dice" className="text-brand-700" size={20} />Surprise me</h2>
          <button type="button" className="btn-icon !h-9 !w-9 !min-h-9" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        </header>

        <div className="space-y-2.5 border-b border-[var(--line)] px-5 py-3.5">
          <ChipRow label="Mood" items={MOODS} value={f.mood ?? "Any"} onPick={(v) => update({ mood: v === "Any" ? undefined : v })} />
          <ChipRow label="Genre" items={GENRES} value={f.genre ?? "Any"} onPick={(v) => update({ genre: v === "Any" ? undefined : v })} />
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="sm-len">Length</label>
            <select id="sm-len" className="input !min-h-9 !w-auto !rounded-full !py-1 text-sm" value={f.length ?? ""} onChange={(e) => update({ length: e.target.value || undefined })}>
              {LENGTHS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <div role="radiogroup" aria-label="Pick from" className="flex rounded-full bg-[var(--surface-2)] p-1 text-sm">
              {[["all", "Whole library"], ["shelf", "My want-to-read"]].map(([v, l]) => (
                <button key={v} type="button" role="radio" aria-checked={f.source === v} onClick={() => update({ source: v })}
                  className={`rounded-full px-3 py-1 font-semibold ${f.source === v ? "bg-[var(--surface)] shadow-[var(--shadow-1)]" : "text-[var(--muted)]"}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-glow min-h-[300px] overflow-y-auto px-5 py-6" aria-live="polite" aria-busy={state === "rolling"}>
          {state === "rolling" && (
            <div className="grid place-items-center gap-4 py-10 text-[var(--muted)]">
              <Icon name="dice" size={56} className="animate-[bq-roll_.65s_ease-in-out_infinite] text-brand-500" />
              <p className="text-sm font-semibold">Shuffling the shelves…</p>
            </div>
          )}
          {(state === "empty" || state === "signin" || state === "error") && (
            <div className="grid place-items-center gap-3 py-12 text-center text-[var(--muted)]">
              <Icon name="dice" size={40} />
              <p className="max-w-xs text-sm">{empty[state]}</p>
              {state === "signin" && <Link href={`/${locale}/login`} onClick={onClose} className="btn-primary btn-sm">Sign in</Link>}
            </div>
          )}
          {state === "ready" && book && (
            <div className="animate-pop grid gap-6 sm:grid-cols-[170px_1fr]">
              <Link href={`/${locale}/books/${encodeURIComponent(book.slug)}`} className="cover mx-auto block w-[150px] sm:w-full" onClick={onClose}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {book.coverUrl && <img src={book.coverUrl} alt="" />}
              </Link>
              <div className="min-w-0 text-center sm:text-start">
                {book.genre && <span className="badge badge-qubit">{book.genre}</span>}
                <h3 className="font-display mt-2 text-[1.7rem] font-bold leading-tight">{book.title}</h3>
                <p className="mt-1 text-[var(--muted)]">by <b className="text-[var(--fg)]">{book.author}</b></p>
                <p className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm text-[var(--muted)] sm:justify-start">
                  {book.rating ? <span className="flex items-center gap-1"><Icon name="star" size={14} filled className="stars" /><b className="text-[var(--fg)]">{book.rating.toFixed(1)}</b></span> : null}
                  {book.pages ? <span>{book.pages} pages</span> : null}
                  {book.readingMinutes ? <span className="flex items-center gap-1"><Icon name="clock" size={14} />~{Math.max(1, Math.round(book.readingMinutes / 60))} hr</span> : null}
                  {book.year ? <span>{book.year}</span> : null}
                </p>
                {book.hook && <p className="font-display mt-4 text-[1.05rem] italic leading-relaxed">“{book.hook}”</p>}
                <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Link href={`/${locale}/books/${encodeURIComponent(book.slug)}#summary`} className="btn-primary" onClick={onClose}><Icon name="bookOpen" size={17} />Read summary</Link>
                  <button type="button" className="btn-ghost" disabled={saved} onClick={wantToRead}>
                    <Icon name={saved ? "check" : "bookmark"} size={17} />{saved ? "Saved" : "Want to read"}
                  </button>
                  <button type="button" className="btn-icon" onClick={share} aria-label="Share this book"><Icon name="share" size={17} /></button>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-[var(--line)] px-5 py-3">
          <span className="hidden text-xs text-[var(--muted)] sm:block">Press <kbd className="kbd">R</kbd> to roll again · <kbd className="kbd">Esc</kbd> to close</span>
          <button type="button" className="btn-primary btn-sm ms-auto" onClick={() => roll(f)} disabled={state === "rolling"}>
            <Icon name="refresh" size={16} className={state === "rolling" ? "animate-spin" : ""} />Roll again
          </button>
        </footer>
      </div>
      <style>{"@keyframes bq-roll{0%{transform:rotate(0) scale(1)}50%{transform:rotate(180deg) scale(1.12)}100%{transform:rotate(360deg) scale(1)}}"}</style>
    </div>
  );
}

function ChipRow({ label, items, value, onPick }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">{label}</span>
      <div className="rail !gap-1.5 !p-0" role="radiogroup" aria-label={label}>
        {items.map((m) => <button key={m} type="button" role="radio" aria-checked={value === m} data-active={value === m} className="pill !h-8 !px-3 !text-[13px]" onClick={() => onPick(m)}>{m}</button>)}
      </div>
    </div>
  );
}
