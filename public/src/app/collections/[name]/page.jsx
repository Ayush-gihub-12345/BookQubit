import BookCard from "@/components/BookCard";
import { listBooks } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { name } = await params;
  return { title: `${decodeURIComponent(name)} Collection` };
}

export default async function CollectionPage({ params }) {
  const { name } = await params;
  const collection = decodeURIComponent(name);
  const books = await listBooks(await getLang(), { collection });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">{collection}</h1>
      <p className="mt-1 text-sm text-slate-500">{books.length} books in this collection</p>
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {books.map((b) => <BookCard key={b.id} book={b} />)}
      </div>
      {!books.length && <p className="py-20 text-center text-slate-500">No books in this collection.</p>}
    </div>
  );
}
