"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import { useToast } from "./Toast";
import Icon from "./Icon";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

// A lightweight "commonplace book" — readers save favorite passages from a
// book, visible to everyone here and on the saver's public profile.
const COLORS = ["#8B6CFF", "#4FA3C7", "#6FBF73", "#E8792E", "#D9577A", "#C89B6D", "#6C83D9"];

export default function QuotesSection({ bookSlug }) {
  const lang = useLang();
  const tr = t(lang);
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [page, setPage] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(null);
  const copy = async (q) => {
    try { await navigator.clipboard.writeText(`“${q.text}”`); setCopied(q.id); setTimeout(() => setCopied(null), 1500); } catch { /* no clipboard */ }
  };

  const load = () => fetch(`/api/quotes?bookSlug=${encodeURIComponent(bookSlug)}`)
    .then((r) => r.json()).then((d) => setQuotes(d.quotes || []));

  useEffect(() => {
    load();
    if (!firebaseEnabled) return;
    const auth = getFirebaseAuth();
    if (auth) return auth.onAuthStateChanged(setUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookSlug]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setBusy(true);
    try {
      const idToken = await user.getIdToken();
      const r = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, bookSlug, text: text.trim(), page: page ? Number(page) : undefined }),
      });
      if (r.ok) {
        setText(""); setPage(""); setAdding(false);
        await load();
        toast(tr("quoteSaved"));
      } else {
        toast(tr("quoteSaveFailed"), "error");
      }
    } finally { setBusy(false); }
  };

  const remove = async (id) => {
    const idToken = await user.getIdToken();
    await fetch(`/api/quotes/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    toast(tr("quoteRemoved"));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Icon name="feather" size={18} className="text-brand-700" /> {tr("readerQuotes")}
          {quotes.length > 0 && <span className="text-muted text-sm font-normal">({quotes.length})</span>}
        </h2>
        {user ? (
          <button onClick={() => setAdding((v) => !v)} className="text-sm font-semibold text-brand-700 hover:underline">
            {adding ? tr("cancel") : tr("saveAQuote")}
          </button>
        ) : (
          <Link href={`/${lang}/login`} className="text-sm font-semibold text-brand-700 hover:underline">{tr("signInToSaveQuote")}</Link>
        )}
      </div>

      {adding && (
        <form onSubmit={submit} className="card mt-3 space-y-2 p-4 hover:!translate-y-0">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000} required
            placeholder={tr("quotePlaceholder")} className="input w-full resize-none" />
          <div className="flex items-center gap-2">
            <input value={page} onChange={(e) => setPage(e.target.value)} type="number" min="1"
              placeholder={tr("pageOptional")} className="input w-32 text-sm" />
            <button type="submit" disabled={busy || !text.trim()} className="btn-primary ml-auto text-sm disabled:cursor-not-allowed disabled:opacity-40">
              {tr("saveQuote")}
            </button>
          </div>
        </form>
      )}

      {quotes.length > 0 ? (
        <div className="hscroll mt-4 !gap-4">
          {quotes.map((q, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <figure key={q.id} className="relative flex w-[min(320px,82vw)] shrink-0 flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] p-6 text-white sm:w-[340px]"
                style={{ background: `linear-gradient(150deg, ${color}, color-mix(in srgb, ${color} 35%, #000))` }}>
                <Icon name="quote" size={56} className="absolute -end-2 -top-2 opacity-15" />
                <blockquote className="font-display relative whitespace-pre-line text-lg italic leading-snug">“{q.text}”</blockquote>
                <figcaption className="relative mt-5 flex items-center justify-between gap-2 text-sm opacity-95">
                  <Link href={`/${lang}/readers/${q.slug || q.user_id}`} prefetch={false} className="min-w-0 truncate hover:underline">
                    {q.page ? `p. ${q.page} · ` : ""}{q.name}
                  </Link>
                  <span className="flex shrink-0 gap-1">
                    <button type="button" aria-label="Copy quote" onClick={() => copy(q)} className="rounded-full bg-white/15 p-1.5 hover:bg-white/25">
                      <Icon name={copied === q.id ? "check" : "copy"} size={15} />
                    </button>
                    {user?.uid === q.user_id && (
                      <button type="button" aria-label="Remove quote" onClick={() => remove(q.id)} className="rounded-full bg-white/15 p-1.5 hover:bg-white/25"><Icon name="x" size={15} /></button>
                    )}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      ) : (
        !adding && <p className="text-muted mt-2 text-sm">{tr("noQuotesSavedYet")}</p>
      )}
    </div>
  );
}
