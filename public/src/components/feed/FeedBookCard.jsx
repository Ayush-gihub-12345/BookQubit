"use client";

import Link from "next/link";
import BookCover from "../BookCover";
import Rating from "../Rating";
import Icon from "../Icon";

export default function FeedBookCard({ book }) {
  if (!book) return null;

  return (
    <Link
      href={`/books/${encodeURIComponent(book.slug)}`}
      prefetch={false}
      className="group border-line bg-surface hover:border-brand-500/60 flex w-40 shrink-0 flex-col overflow-hidden rounded-2xl border transition hover:shadow-lg sm:w-44"
    >
      <div className="bg-muted/10 aspect-[2/3] overflow-hidden">
        <BookCover
          book={book}
          className="h-full w-full transition group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug">
          {book.title}
        </p>
        {book.author && (
          <p className="text-muted mt-0.5 line-clamp-1 text-xs">
            {book.author}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          {typeof book.rating === "number" && (
            <Rating value={book.rating} size={11} />
          )}
          {book.liked && (
            <Icon name="heart" size={13} className="text-brand-600" />
          )}
        </div>
      </div>
    </Link>
  );
}
