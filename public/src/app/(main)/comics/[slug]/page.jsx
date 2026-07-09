import { notFound } from "next/navigation";
import Rating from "@/components/Rating";
import BookCover from "@/components/BookCover";
import { getComic } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const comic = await getComic(slug, await getLang());
  return comic
    ? { title: comic.title, description: comic.description?.slice(0, 160) }
    : { title: "Comic Not Found", robots: { index: false } };
}

export default async function ComicPage({ params }) {
  const { slug } = await params;
  const comic = await getComic(slug, await getLang());
  if (!comic) notFound();

  const meta = [
    ["Publisher", comic.publisher],
    ["Published", comic.publication_date],
    ["Cover Price", comic.cover_price],
    ["Format", comic.format],
    ["Value Today", comic.value_today],
  ].filter(([, v]) => v);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
        <div className="card aspect-[2/3] overflow-hidden hover:!translate-y-0">
          <BookCover title={comic.title} author={comic.publisher} cover_url={comic.cover_url} />
        </div>

        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">{comic.title}</h1>
          <div className="mt-3 flex items-center gap-4">
            <Rating value={comic.rating} />
            {comic.category && <span className="pill">{comic.category}</span>}
          </div>

          {comic.description && <p className="mt-6 text-lg leading-relaxed">{comic.description}</p>}

          {meta.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              {meta.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">{k}</dt>
                  <dd className="text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {comic.characters.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold">Characters Introduced</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {comic.characters.map((ch) => <span key={ch} className="pill">{ch}</span>)}
              </div>
            </div>
          )}

          {comic.fun_fact && (
            <div className="mt-8 rounded-2xl border-l-4 border-brand-500 bg-brand-50 p-5 dark:bg-slate-800">
              <p className="text-sm font-semibold text-brand-700 dark:text-brand-100">💡 Fun Fact</p>
              <p className="mt-1 text-sm leading-relaxed">{comic.fun_fact}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
