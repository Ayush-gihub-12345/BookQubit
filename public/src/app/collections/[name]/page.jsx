import FilterableBookGrid from "@/components/FilterableBookGrid";
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
      <p className="text-muted mt-1 text-sm">{books.length} books in this collection</p>
      <div className="mt-6">
        <FilterableBookGrid books={books} emptyMessage="No books match these filters." />
      </div>
    </div>
  );
}
