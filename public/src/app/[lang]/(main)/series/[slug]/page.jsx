import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import BookCard from "@/components/BookCard";
import { getSeriesPage } from "@/lib/repo";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug, lang } = await params;
  const page = await getSeriesPage(slug, lang).catch(() => null);
  if (!page) return { title: "Series" };
  return {
    title: `${page.series.name} — reading order`,
    description: page.series.description || `${page.series.name}: every book in reading order, with summaries and reader reviews.`,
    alternates: { canonical: `/${lang}/series/${slug}` },
  };
}

export default async function SeriesPage({ params }) {
  const { slug, lang } = await params;
  const page = await getSeriesPage(slug, lang);
  if (!page) notFound();
  const _ = t(lang);
  const first = page.books[0];
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <Breadcrumbs lang={lang} homeLabel={_("homeWord")} label={_("navBreadcrumb")} className="mb-5" items={[{ label: "Series" }, { label: page.series.name }]} />
      <h1 className="text-3xl font-bold sm:text-4xl">{page.series.name}</h1>
      <p className="text-muted mt-1 text-sm">{page.books.length} {page.books.length === 1 ? "book" : "books"} in reading order</p>
      {page.series.description && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed">{page.series.description}</p>}
      {first && <Link href={`/${lang}/books/${encodeURIComponent(first.slug)}`} className="btn-primary mt-4 inline-flex">Start with book 1</Link>}
      <ol className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {page.books.map((b, i) => (
          <li key={b.id}><BookCard book={b} hrefBase={`/${lang}/books`} rank={i + 1} note={b.position != null ? `Book ${b.position}` : undefined} /></li>
        ))}
      </ol>
    </div>
  );
}
