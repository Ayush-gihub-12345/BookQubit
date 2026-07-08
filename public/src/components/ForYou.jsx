"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFirebaseAuth } from "@/lib/firebase";
import BookCover from "./BookCover";
import Icon from "./Icon";

// "Because you read X" — naive personalization: find the user's most-read
// category and recommend unread books from it.
export default function ForYou({ lang }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    return auth.onAuthStateChanged(async (u) => {
      if (!u) { setData(null); return; }
      try {
        const shelfRes = await fetch(`/api/shelf?uid=${u.uid}`).then((r) => r.json());
        const shelf = shelfRes.shelf || [];
        if (!shelf.length) return;

        const seed = shelf.find((s) => s.status === "read") || shelf[0];
        const booksRes = await fetch(`/api/books?lang=${lang}`).then((r) => r.json());
        const all = booksRes.books || [];
        const seedBook = all.find((b) => b.slug === seed.book_slug);
        if (!seedBook) return;

        const owned = new Set(shelf.map((s) => s.book_slug));
        const picks = all
          .filter((b) => !owned.has(b.slug) && (b.category === seedBook.category || b.author === seedBook.author))
          .slice(0, 6);
        if (picks.length) setData({ seed: seedBook, picks });
      } catch { /* ignore */ }
    });
  }, [lang]);

  if (!data) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-4 flex items-center gap-2">
        <Icon name="compass" size={18} className="text-brand-600" />
        <div>
          <h2 className="text-2xl font-bold">Picked for you</h2>
          <p className="text-muted mt-0.5 text-sm">Because you read <span className="font-medium text-brand-600">{data.seed.title}</span></p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {data.picks.map((b) => (
          <Link key={b.slug} href={`/books/${encodeURIComponent(b.slug)}`} className="card group overflow-hidden">
            <div className="aspect-[2/3] overflow-hidden">
              <BookCover title={b.title} author={b.author} cover_url={b.cover_url}
                imgClassName="transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-semibold group-hover:text-brand-600">{b.title}</p>
              <p className="text-muted line-clamp-1 text-xs">{b.author}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
