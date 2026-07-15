import { notFound } from "next/navigation";
import BookCard from "@/components/BookCard";
import Section from "@/components/Section";
import { getPublication, booksByPublisher } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pub = await getPublication(slug, await getLang());
  return pub
    ? { title: pub.name, description: pub.description?.slice(0, 160), alternates: { canonical: `/publications/${pub.slug}` } }
    : { title: "Publisher Not Found", robots: { index: false } };
}

export default async function PublicationPage({ params }) {
  const { slug } = await params;
  const lang = await getLang();
  const pub = await getPublication(slug, lang);
  if (!pub) notFound();
  const books = await booksByPublisher(pub.name, lang);

  const meta = [
    ["Founded", pub.founded],
    ["Headquarters", pub.headquarters],
    ["Type", pub.type],
  ].filter(([, v]) => v);

  const ratedBooks = books.filter((b) => b.rating);
  const avgRating = ratedBooks.length ? (ratedBooks.reduce((n, b) => n + b.rating, 0) / ratedBooks.length).toFixed(1) : "—";

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="card p-8 hover:!translate-y-0">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {pub.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pub.logo_url} alt={pub.name} className="h-24 w-24 rounded-2xl object-cover shadow-lg" />
            )}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold">{pub.name}</h1>
              <p className="mt-2 max-w-2xl opacity-90">{pub.about || pub.description}</p>
              {pub.website && (
                <a href={pub.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-brand-600 hover:underline">
                  {pub.website} ↗
                </a>
              )}
            </div>
            {/* Engagement stats — same pattern as the author page */}
            <div className="grid shrink-0 grid-cols-3 gap-3 sm:grid-cols-1">
              {[
                [books.length, "Books"],
                [avgRating, "Avg rating"],
                [pub.founded || "—", "Founded"],
              ].map(([val, label]) => (
                <div key={label} className="rounded-xl border border-line px-4 py-3 text-center">
                  <p className="text-lg font-extrabold">{val}</p>
                  <p className="text-muted text-[11px]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {meta.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3 dark:border-slate-800">
              {meta.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs uppercase tracking-wide text-muted">{k}</dt>
                  <dd className="text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {pub.notable_authors.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wide text-muted">Notable Authors</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {pub.notable_authors.map((a) => <span key={a} className="pill">{a}</span>)}
              </div>
            </div>
          )}

          {pub.imprints.length > 0 && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-muted">Imprints</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {pub.imprints.map((i) => <span key={i} className="pill">{i}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {books.length > 0 && (
        <Section title={`Books from ${pub.name}`}>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {books.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </Section>
      )}
    </>
  );
}
