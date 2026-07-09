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

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="card p-8 hover:!translate-y-0">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {pub.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pub.logo_url} alt={pub.name} className="h-24 w-24 rounded-2xl object-cover shadow-lg" />
            )}
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold">{pub.name}</h1>
              <p className="mt-2 max-w-2xl opacity-90">{pub.about || pub.description}</p>
              {pub.website && (
                <a href={pub.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-brand-600 hover:underline">
                  {pub.website} ↗
                </a>
              )}
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
