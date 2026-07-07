import Link from "next/link";
import { notFound } from "next/navigation";
import BookCard from "@/components/BookCard";
import Section from "@/components/Section";
import { getAuthor, booksByAuthor } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const author = await getAuthor(slug, await getLang());
  return author
    ? { title: author.name, description: author.bio?.slice(0, 160) }
    : { title: "Author Not Found", robots: { index: false } };
}

export default async function AuthorPage({ params }) {
  const { slug } = await params;
  const lang = await getLang();
  const author = await getAuthor(slug, lang);
  if (!author) notFound();
  const books = await booksByAuthor(author.name, lang);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="card flex flex-col items-center gap-6 p-8 hover:!translate-y-0 sm:flex-row sm:items-start">
          {author.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.image_url} alt={author.name} className="h-32 w-32 rounded-full object-cover shadow-lg" />
          ) : (
            <div className="grid h-32 w-32 shrink-0 place-items-center rounded-full bg-brand-50 text-4xl font-bold text-brand-600 dark:bg-slate-800">
              {author.name[0]}
            </div>
          )}
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold">{author.name}</h1>
            <p className="mt-1 text-sm text-slate-400">
              {[author.country, author.birth_year && `b. ${author.birth_year}`].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-3 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-300">{author.bio}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              {author.genres.map((g) => <span key={g} className="pill">{g}</span>)}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
              {author.wikipedia_url && (
                <a href={author.wikipedia_url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline">Wikipedia ↗</a>
              )}
              {author.website_url && (
                <a href={author.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline">Website ↗</a>
              )}
            </div>
          </div>
        </div>
      </div>

      {books.length > 0 && (
        <Section title={`Books by ${author.name}`}>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {books.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </Section>
      )}
    </>
  );
}
