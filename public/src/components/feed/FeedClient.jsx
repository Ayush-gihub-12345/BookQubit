"use client";

import { useRef, useState } from "react";
import { FILTERS } from "@/lib/feed";
import { useLang } from "@/lib/useLang";
import { useSafety } from "@/lib/safety-client";
import { BookFeedCard, QuoteCard, AuthorCard, ComicCard, AffiliateCard } from "./FeedCards";

function Card({ c }) {
  switch (c.type) {
    case "book": return <BookFeedCard b={c} />;
    case "quote": return <QuoteCard q={c} />;
    case "author": return <AuthorCard a={c} />;
    case "comic": return <ComicCard c={c} />;
    case "affiliate": return <AffiliateCard a={c} />;
    default: return null;
  }
}

// Sticky filter bar + cards + "Load more". Page 1 for the default filter is server-rendered; other
// filters and later pages come from the cached /api/feed. Blocked/muted readers' quotes are hidden here.
export default function FeedClient({ initial }) {
  const lang = useLang();
  const safety = useSafety();
  const [filter, setFilter] = useState("for-you");
  const [cards, setCards] = useState(initial.cards);
  const [next, setNext] = useState(initial.nextPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const seq = useRef(0);

  async function fetchPage(f, page) {
    const id = ++seq.current;
    setLoading(true); setError(false);
    try {
      const r = await fetch(`/api/feed?lang=${lang}&filter=${f}&page=${page}`);
      const j = await r.json();
      if (id !== seq.current) return null; // a newer request superseded this one
      if (j.error) throw new Error("feed");
      return j;
    } catch { if (id === seq.current) setError(true); return null; }
    finally { if (id === seq.current) setLoading(false); }
  }
  async function pick(f) {
    if (f === filter) return;
    setFilter(f); setCards([]); setNext(null);
    const j = await fetchPage(f, 1);
    if (j) { setCards(j.cards); setNext(j.nextPage); }
  }
  async function more() {
    const j = await fetchPage(filter, next);
    if (j) { setCards((c) => [...c, ...j.cards]); setNext(j.nextPage); }
  }

  const visible = cards.filter((c) => !(c.type === "quote" && safety.hides(c.userId)));

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <div role="tablist" aria-label="Feed filter" className="bg-[var(--bg)]/90 sticky top-0 z-20 -mx-4 flex gap-2 overflow-x-auto px-4 py-3 backdrop-blur lg:top-16">
        {FILTERS.map(([id, label]) => (
          <button key={id} role="tab" type="button" aria-selected={filter === id} onClick={() => pick(id)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${filter === id ? "border-brand-600 bg-brand-600 text-[var(--on-brand)]" : "border-line bg-surface"}`}>{label}</button>
        ))}
      </div>

      <div className="mt-2 space-y-4" aria-live="polite" aria-busy={loading}>
        {visible.map((c, i) => <Card key={`${c.type}-${c.slug || c.id}-${i}`} c={c} />)}
        {loading && [0, 1, 2].map((i) => <div key={i} className="skeleton h-36" aria-hidden />)}
      </div>

      {!loading && !visible.length && !error && (
        <p className="text-muted border-line mt-6 rounded-2xl border border-dashed p-10 text-center text-sm">Nothing here yet. Try another filter.</p>
      )}
      {error && (
        <p role="alert" className="mt-6 text-center text-sm">Couldn&apos;t load more. <button type="button" className="text-brand-700 underline" onClick={() => (cards.length ? more() : pick(filter))}>Try again</button></p>
      )}
      {next && !loading && !error && (
        <div className="mt-6 text-center"><button type="button" onClick={more} className="border-line rounded-full border px-6 py-2 text-sm font-medium">Load more</button></div>
      )}
    </div>
  );
}
