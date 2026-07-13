import Link from "next/link";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";
import Icon from "@/components/Icon";
import { listBooks } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export default async function NotFound() {
  const lang = await getLang();
  const popular = await listBooks("en", { sort: "rating", limit: 6 }).catch(() => []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-600/10 text-brand-600">
        <Icon name="search" size={28} />
      </span>
      <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
      <p className="text-muted mt-2 text-sm">The page you're looking for doesn't exist or was moved — try searching instead.</p>

      <div className="mx-auto mt-6 max-w-md">
        <SearchBar lang={lang} placeholder="Search books, authors…" big />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">Back to Home</Link>
        <Link href="/books" className="btn-ghost">Browse All Books</Link>
      </div>

      {popular.length > 0 && (
        <div className="mt-14 text-left">
          <p className="text-muted mb-4 text-center text-xs font-bold uppercase tracking-wider">
            Or start with one of our top-rated books
          </p>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {popular.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </div>
      )}
    </div>
  );
}
