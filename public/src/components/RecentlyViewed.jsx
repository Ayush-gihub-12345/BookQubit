"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BookCover from "./BookCover";
import HScrollRow from "./HScrollRow";
import TitleTransliterated from "./TitleTransliterated";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

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
  const lang = useLang();
  const tr = t(lang);
  const [items, setItems] = useState([]);
  useEffect(() => { setItems(read()); }, []);
  if (items.length < 2) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <div className="mb-5">
        <h2 className="text-xl font-bold sm:text-2xl">{tr("recentlyViewedTitle")}</h2>
      </div>
      <HScrollRow>
        {items.map((b) => (
          <Link key={b.slug} href={`/${lang}/books/${encodeURIComponent(b.slug)}`} className="group block w-32 sm:w-36">
            <div className="cover aspect-[2/3] bg-[color-mix(in_srgb,var(--fg)_8%,var(--surface))]">
              <BookCover title={b.title} author={b.author} cover_url={b.cover_url} />
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-brand-700"><TitleTransliterated text={b.title} /></p>
          </Link>
        ))}
      </HScrollRow>
    </section>
  );
}
