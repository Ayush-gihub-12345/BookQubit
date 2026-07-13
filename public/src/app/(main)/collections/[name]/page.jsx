import Link from "next/link";
import FilterableBookGrid from "@/components/FilterableBookGrid";
import Icon from "@/components/Icon";
import { queryBooks } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

export async function generateMetadata({ params }) {
  const { name } = await params;
  const collection = decodeURIComponent(name);
  return {
    title: `${collection} Collection`,
    description: `Explore the ${collection} collection on BookQubit — curated books with summaries, key insights, and reader reviews.`,
    alternates: { canonical: `/collections/${encodeURIComponent(name)}` },
  };
}

export default async function CollectionPage({ params }) {
  const { name } = await params;
  const collection = decodeURIComponent(name);
  // Bounded regardless of how large a single collection grows — a large
  // collection points readers at the fully-paginated /books browser instead
  // of ever rendering thousands of cards in one page.
  const { books, total } = await queryBooks(await getLang(), { collection, perPage: PAGE_SIZE });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">{collection}</h1>
      <p className="text-muted mt-1 text-sm">{total.toLocaleString()} books in this collection</p>
      <div className="mt-6">
        <FilterableBookGrid books={books} emptyMessage="No books match these filters." />
      </div>
      {total > books.length && (
        <div className="mt-8 text-center">
          <Link href={`/books?collection=${encodeURIComponent(collection)}`} className="btn-primary inline-flex">
            Browse all {total.toLocaleString()} books in this collection <Icon name="arrowRight" size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}
