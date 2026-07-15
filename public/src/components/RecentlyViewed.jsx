"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BookCover from "./BookCover";
import Icon from "./Icon";
import HScrollRow from "./HScrollRow";

const KEY = "bq_recent_books";
const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

// Drop this on a book page to record the visit.
export function TrackView({ book }) {
  useEffect(() => {
    if (!book?.slug) return;
    const list = [
      { slug: book.slug, title: book.title, author: book.author, cover_url: book.cover_url },
      ...read().filter((b) => b.slug !== book.slug),
    ].slice(0, 12);
    localStorage.setItem(KEY, JSON.stringify(list));
  }, [book]);
  return null;
}

// Homepage strip of recently viewed books.
export default function RecentlyViewed() {
  const [items, setItems] = useState([]);
  useEffect(() => { setItems(read()); }, []);
  if (items.length < 2) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-4 flex items-center gap-2">
        <Icon name="clock" size={18} className="text-brand-600" />
        <h2 className="text-2xl font-bold">Recently Viewed</h2>
      </div>
      <HScrollRow>
        {items.map((b) => (
          <Link key={b.slug} href={`/books/${encodeURIComponent(b.slug)}`} className="card group w-36 overflow-hidden sm:w-40">
            <div className="aspect-[2/3] overflow-hidden">
              <BookCover title={b.title} author={b.author} cover_url={b.cover_url}
                imgClassName="transition duration-500 group-hover:scale-105" />
            </div>
            <p className="line-clamp-2 min-h-[2.2em] p-2.5 text-xs font-semibold leading-snug group-hover:text-brand-600">{b.title}</p>
          </Link>
        ))}
      </HScrollRow>
    </section>
  );
}
