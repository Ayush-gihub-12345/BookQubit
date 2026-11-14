"use client";

import Link from "next/link";
import Rating from "./Rating";
import BookCover from "./BookCover";
import TitleTransliterated from "./TitleTransliterated";
import { useLang } from "@/lib/useLang";

// A book on a shelf: the cover (with its hinge crease), then the title,
// author and rating underneath. There is no surrounding box: the old card
// put a border, a shadow, a category chip over the image and a lift-on-hover
// around every book, which made twenty of them on a page compete with each
// other. Here the cover carries the weight and hover only recolours the
// title.
//
// `hrefBase` defaults to the current language's /books, derived via useLang()
// (URL-based, works with zero setup), so callers that don't override it
// still link to a correctly language-prefixed book page.
export default function BookCard({ book, hrefBase, note }) {
  const lang = useLang();
  const base = hrefBase ?? `/${lang}/books`;
  return (
    <Link href={`${base}/${encodeURIComponent(book.slug)}`} prefetch={false} className="group block">
      <div className="cover aspect-[2/3] bg-[color-mix(in_srgb,var(--fg)_8%,var(--surface))]">
        <BookCover title={book.title} author={book.author} cover_url={book.cover_url} />
      </div>
      <div className="pt-3">
        <TitleTransliterated as="h3" className="line-clamp-2 text-[15px] font-semibold leading-snug group-hover:text-brand-600" text={book.title} />
        <TitleTransliterated as="p" className="text-muted mt-0.5 line-clamp-1 text-sm" text={book.author} />
        <div className="mt-1"><Rating value={book.rating} /></div>
        {note && <p className="text-muted mt-1 line-clamp-2 text-xs">{note}</p>}
      </div>
    </Link>
  );
}
