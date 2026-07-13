"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import Icon from "./Icon";

// A lightweight "commonplace book" — readers save favorite passages from a
// book, visible to everyone here and on the saver's public profile.
export default function QuotesSection({ bookSlug }) {
  const [user, setUser] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [page, setPage] = useState("");
  const [busy, setBusy] = useState(false);

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
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Icon name="feather" size={18} className="text-brand-600" /> Reader Quotes
          {quotes.length > 0 && <span className="text-muted text-sm font-normal">({quotes.length})</span>}
        </h2>
        {user ? (
          <button onClick={() => setAdding((v) => !v)} className="text-sm font-semibold text-brand-600 hover:underline">
            {adding ? "Cancel" : "+ Save a quote"}
          </button>
        ) : (
          <Link href="/login" className="text-sm font-semibold text-brand-600 hover:underline">Sign in to save a quote</Link>
        )}
      </div>

      {adding && (
        <form onSubmit={submit} className="card mt-3 space-y-2 p-4 hover:!translate-y-0">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000} required
            placeholder="Type or paste the passage you want to remember…" className="input w-full resize-none" />
          <div className="flex items-center gap-2">
            <input value={page} onChange={(e) => setPage(e.target.value)} type="number" min="1"
              placeholder="Page (optional)" className="input w-32 text-sm" />
            <button type="submit" disabled={busy || !text.trim()} className="btn-primary ml-auto text-sm disabled:cursor-not-allowed disabled:opacity-40">
              Save Quote
            </button>
          </div>
        </form>
      )}

      {quotes.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {quotes.map((q) => (
            <div key={q.id} className="card !border-brand-500/20 bg-brand-600/5 p-4 hover:!translate-y-0">
              <p className="whitespace-pre-line text-sm italic leading-relaxed">"{q.text}"</p>
              <div className="text-muted mt-2 flex items-center justify-between text-xs">
                <Link href={`/readers/${q.slug || q.user_id}`} className="hover:text-brand-600">
                  — {q.name}{q.page ? `, p. ${q.page}` : ""}
                </Link>
                {user?.uid === q.user_id && (
                  <button onClick={() => remove(q.id)} className="hover:text-red-500"><Icon name="x" size={12} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !adding && <p className="text-muted mt-2 text-sm">No quotes saved yet — be the first to save a favorite passage.</p>
      )}
    </div>
  );
}
