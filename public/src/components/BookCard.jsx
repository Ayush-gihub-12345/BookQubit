import Link from "next/link";
import Rating from "./Rating";
import BookCover from "./BookCover";

export default function BookCard({ book }) {
  return (
    <Link href={`/books/${encodeURIComponent(book.slug)}`} className="card group block overflow-hidden">
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <BookCover title={book.title} author={book.author} cover_url={book.cover_url}
          imgClassName="transition duration-500 group-hover:scale-105" />
        {book.category && (
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
            {book.category}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold group-hover:text-brand-600">{book.title}</h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{book.author}</p>
        <div className="mt-2"><Rating value={book.rating} /></div>
      </div>
    </Link>
  );
}
