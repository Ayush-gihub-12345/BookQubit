"use client";

import Link from "next/link";
import Rating from "./Rating";
import BookCover from "./BookCover";
import TitleTransliterated from "./TitleTransliterated";
import { useLang } from "@/lib/useLang";

// `hrefBase` defaults to the current language's /books — derived via
// useLang() (URL-based, works with zero setup) rather than a hardcoded
// "/books", so callers that don't explicitly override it (most of them)
// still link to a correctly language-prefixed book page.
export default function BookCard({ book, hrefBase }) {
  const lang = useLang();
  const base = hrefBase ?? `/${lang}/books`;
  return (
    <Link href={`${base}/${encodeURIComponent(book.slug)}`} prefetch={false} className="card group block overflow-hidden">
      <div className="relative aspect-[2/3] overflow-hidden bg-black/5 dark:bg-white/5">
        <BookCover title={book.title} author={book.author} cover_url={book.cover_url}
          imgClassName="transition duration-500 group-hover:scale-105" />
        {book.category && (
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
            {book.category}
          </span>
        )}
      </div>
      <div className="p-4">
        <TitleTransliterated as="h3" className="line-clamp-1 font-semibold group-hover:text-brand-600" text={book.title} />
        <TitleTransliterated as="p" className="mt-0.5 line-clamp-1 text-sm text-muted" text={book.author} />
        <div className="mt-2"><Rating value={book.rating} /></div>
      </div>
    </Link>
  );
}
