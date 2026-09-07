import Link from "next/link";

// Extracted from the inline review block that used to live only in
// books/[slug]/page.jsx. Pass `reviewer` on a book page (who wrote this),
// `book` on a reader profile (which book this is about) — whichever context
// the page is already showing doesn't need repeating.
export default function ReviewCard({ rating, review, spoiler, updatedAt, reviewer, book }) {
  return (
    <div className="card p-5 hover:!translate-y-0">
      <div className="flex items-center gap-3">
        {reviewer && (
          reviewer.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={reviewer.photo_url} alt="" className="h-9 w-9 rounded-full" />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {(reviewer.name || "R")[0].toUpperCase()}
            </span>
          )
        )}
        <div className="min-w-0 flex-1">
          {reviewer && (
            <Link href={`/readers/${reviewer.slug || reviewer.user_id}`} className="text-sm font-semibold hover:text-brand-600">
              {reviewer.name}
            </Link>
          )}
          {book && (
            <Link href={`/books/${encodeURIComponent(book.slug)}`} className="line-clamp-1 text-sm font-semibold hover:text-brand-600">
              {book.title}
            </Link>
          )}
          {updatedAt && <p className="text-muted text-xs">{updatedAt.slice(0, 10)}</p>}
        </div>
        {rating > 0 && <span className="shrink-0 text-sm text-amber-400">{"★".repeat(rating)}</span>}
      </div>
      {spoiler ? (
        <details className="mt-3">
          <summary className="text-muted cursor-pointer text-xs font-semibold hover:text-brand-600">
            ⚠ This review contains spoilers — click to reveal
          </summary>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{review}</p>
        </details>
      ) : (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{review}</p>
      )}
    </div>
  );
}
