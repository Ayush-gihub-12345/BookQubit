"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFirebaseAuth } from "@/lib/firebase";
import BookCover from "./BookCover";
import Rating from "./Rating";
import Icon from "./Icon";

// Real personalization: the heavy lifting (scoring against the reader's
// full shelf history + onboarding genre picks, not just one random "seed"
// book) happens server-side in getRecommendations() — this just renders
// the ranked result, plus the per-book `reason` it came with.
//
// `fallbackBooks` (server-fetched, already cached — see page.jsx) covers
// anonymous visitors and signed-in readers with no shelf history yet, who
// previously saw nothing here at all. It's rendered as "Popular right now"
// rather than personalized picks, since it genuinely isn't personalized —
// mislabeling it would be a small but real trust cost on exactly the section
// meant to build trust in the platform's recommendations.
export default function ForYou({ lang, fallbackBooks = [] }) {
  const [data, setData] = useState(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) { setCheckedAuth(true); return; }
    return auth.onAuthStateChanged(async (u) => {
      if (!u) { setData(null); setCheckedAuth(true); return; }
      try {
        const res = await fetch(`/api/recommendations?uid=${u.uid}&lang=${lang}&limit=12`).then((r) => r.json());
        if (res.picks?.length) setData(res);
      } catch { /* ignore */ }
      setCheckedAuth(true);
    });
  }, [lang]);

  // Personalized picks take priority once loaded. Before auth state resolves,
  // render nothing rather than flash the fallback and then swap it out.
  const personalized = data?.picks?.length > 0;
  if (!checkedAuth) return null;
  if (!personalized && !fallbackBooks.length) return null;

  const items = personalized ? data.picks : fallbackBooks;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-4 flex items-center gap-2">
        <Icon name="compass" size={18} className="text-brand-600" />
        <div>
          <h2 className="text-2xl font-bold">{personalized ? "Picked for you" : "Popular right now"}</h2>
          <p className="text-muted mt-0.5 text-sm">
            {personalized
              ? (data.basis ? <>Based on your reading history in <span className="font-medium text-brand-600">{data.basis}</span> and more</> : "Based on your reading history")
              : "Highly-rated books other readers are enjoying"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((b) => (
          <Link key={b.slug} href={`/books/${encodeURIComponent(b.slug)}`} className="card group overflow-hidden">
            <div className="aspect-[2/3] overflow-hidden">
              <BookCover title={b.title} author={b.author} cover_url={b.cover_url}
                imgClassName="transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-semibold group-hover:text-brand-600">{b.title}</p>
              <p className="text-muted line-clamp-1 text-xs">{b.author}</p>
              <div className="mt-1"><Rating value={b.rating} /></div>
              {b.reason && <p className="text-muted mt-1.5 line-clamp-1 text-[11px] italic">{b.reason}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
