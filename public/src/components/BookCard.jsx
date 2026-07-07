import Link from "next/link";
import Rating from "./Rating";

export default function BookCard({ book }) {
  return (
    <Link href={`/books/${book.slug}`} className="card group block overflow-hidden">
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        {book.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover_url}
            alt={`${book.title} cover`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center p-4 text-center font-semibold text-slate-400">
            {book.title}
          </div>
        )}
        {book.category && (
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
            {book.category}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold group-hover:text-brand-600">{book.title}</h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{book.author}</p>
        <div className="mt-2 flex items-center justify-between">
          <Rating value={book.rating} />
          {book.price && <span className="text-sm font-semibold text-brand-600">{book.price}</span>}
        </div>
      </div>
    </Link>
  );
}
