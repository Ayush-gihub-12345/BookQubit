"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BookCover from "./BookCover";
import Translated from "./Translated";

export default function HeroSlider({ books, labels }) {
  const [i, setI] = useState(0);
  const n = books.length;

  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n]);

  if (!n) return null;
  const b = books[i];

  return (
    <div className="card relative overflow-hidden p-6 hover:!translate-y-0 sm:p-10">
      {/* Mobile: small corner buttons, clear of both the cover and the text */}
      {n > 1 && (
        <div className="absolute right-4 top-4 z-10 flex gap-2 md:hidden">
          <button onClick={() => setI((i - 1 + n) % n)} aria-label="Previous"
            className="bg-surface border-line grid h-8 w-8 place-items-center rounded-full border shadow-lg transition hover:scale-110">‹</button>
          <button onClick={() => setI((i + 1) % n)} aria-label="Next"
            className="bg-surface border-line grid h-8 w-8 place-items-center rounded-full border shadow-lg transition hover:scale-110">›</button>
        </div>
      )}

      <div className="grid items-center gap-8 md:grid-cols-[240px_1fr]">
        <Link href={`/books/${encodeURIComponent(b.slug)}`} className="group mx-auto">
          <div key={b.slug} className="aspect-[2/3] w-44 overflow-hidden rounded-xl shadow-2xl transition duration-500 group-hover:scale-105 sm:w-56"
            style={{ animation: "fadeIn .5s ease" }}>
            <BookCover title={b.title} author={b.author} cover_url={b.cover_url} priority />
          </div>
        </Link>

        <div>
          {b.category && <span className="pill">{b.category}</span>}
          <h2 className="mt-3 text-2xl font-extrabold sm:text-4xl">
            <Link href={`/books/${encodeURIComponent(b.slug)}`} className="hover:text-brand-600"><Translated text={b.title} /></Link>
          </h2>
          <p className="text-muted mt-1">by <span className="font-medium text-brand-600">{b.author}</span></p>

          <div className="text-muted mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
            {b.rating && <span className="text-amber-400">{"★".repeat(Math.round(b.rating))} <span className="text-muted">({b.rating})</span></span>}
            {b.page_count && <span><b className="text-[var(--fg)]">{b.page_count}</b> pages</span>}
            {b.language && <span>{b.language}</span>}
            {b.published && <span>Published {b.published}</span>}
          </div>

          {b.keyPoints?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">{labels.keyFeatures}</p>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {b.keyPoints.slice(0, 4).map((k) => (
                  <li key={k} className="flex items-start gap-2 text-sm"><span className="text-brand-500">•</span>{k}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {b.buyUrl && (
              <a href={b.buyUrl} target="_blank" rel="noopener noreferrer sponsored" className="btn-primary text-sm">🛒 {labels.getBook}</a>
            )}
            <Link href={`/books/${encodeURIComponent(b.slug)}`} className="btn-ghost text-sm">📄 {labels.summary}</Link>
          </div>
        </div>
      </div>

      {n > 1 && (
        <>
          {/* Desktop: original edge-of-card arrows */}
          <button onClick={() => setI((i - 1 + n) % n)} aria-label="Previous"
            className="bg-surface border-line absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border shadow-lg transition hover:scale-110 md:grid">‹</button>
          <button onClick={() => setI((i + 1) % n)} aria-label="Next"
            className="bg-surface border-line absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border shadow-lg transition hover:scale-110 md:grid">›</button>

          <div className="mt-6 flex justify-center gap-1.5">
            {books.map((_, d) => (
              <button key={d} onClick={() => setI(d)} aria-label={`Slide ${d + 1}`}
                className={`h-1.5 rounded-full transition-all ${d === i ? "w-6 bg-brand-600" : "w-1.5 bg-brand-600/30"}`} />
            ))}
          </div>
        </>
      )}
      <style jsx>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; } }`}</style>
    </div>
  );
}
