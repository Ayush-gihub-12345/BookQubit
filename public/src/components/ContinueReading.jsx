"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFirebaseAuth } from "@/lib/firebase";
import BookCover from "./BookCover";

export default function ContinueReading() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return auth.onAuthStateChanged(async (u) => {
      if (!u) { setItems(null); return; }
      const r = await fetch(`/api/shelf?uid=${u.uid}`);
      const data = await r.json();
      setItems((data.shelf || []).filter((s) => s.status === "reading").slice(0, 4));
    });
  }, []);

  if (!items?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">📖 Continue Reading</h2>
          <p className="text-muted mt-0.5 text-sm">Pick up where you left off</p>
        </div>
        <Link href="/account" className="text-sm font-semibold text-brand-600 hover:underline">My shelf →</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((s) => (
          <Link key={s.book_slug} href={`/books/${encodeURIComponent(s.book_slug)}`}
            className="card flex gap-4 p-4">
            <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg shadow">
              <BookCover title={s.title || s.book_slug} author={s.author} cover_url={s.cover_url} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold">{s.title || s.book_slug}</p>
              <p className="text-muted line-clamp-1 text-xs">{s.author}</p>
              <div className="mt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-all"
                    style={{ width: `${s.progress || 0}%` }} />
                </div>
                <p className="text-muted mt-1 text-[11px]">{s.progress || 0}% complete</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
