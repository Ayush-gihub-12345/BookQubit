import Link from "next/link";
import { notFound } from "next/navigation";
import BookCard from "@/components/BookCard";
import Section from "@/components/Section";
import { getAuthor, booksByAuthor } from "@/lib/repo";
import { getLang } from "@/lib/lang";
import { FollowButton, ShareButton } from "@/components/FollowButton";
import Icon from "@/components/Icon";

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
            <div className="grid h-32 w-32 shrink-0 place-items-center tint-brand rounded-full text-4xl font-bold text-brand-600">
              {author.name[0]}
            </div>
          )}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="flex items-center justify-center gap-2 text-3xl font-bold sm:justify-start">
              {author.name}
              {author.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-600/10 px-2 py-0.5 text-xs font-semibold text-brand-600" title="Verified author">
                  <Icon name="shieldCheck" size={14} /> Verified
                </span>
              ) : null}
            </h1>
            <p className="text-muted mt-1 text-sm">
              {[author.country, author.birth_year && `b. ${author.birth_year}`].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-3 max-w-2xl leading-relaxed">{author.bio}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              {author.genres.map((g) => <span key={g} className="pill">{g}</span>)}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <FollowButton type="author" id={author.slug} label="Follow author" />
              <ShareButton label="Share profile" />
              {author.wikipedia_url && (
                <a href={author.wikipedia_url} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">Wikipedia</a>
              )}
              {author.website_url && (
                <a href={author.website_url} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">Website</a>
              )}
            </div>
          </div>
          {/* Engagement stats */}
          <div className="grid shrink-0 grid-cols-3 gap-3 sm:grid-cols-1">
            {[
              [books.length, "Books"],
              [books.filter((b) => b.rating).length ? (books.reduce((n, b) => n + (b.rating || 0), 0) / books.filter((b) => b.rating).length).toFixed(1) : "—", "Avg rating"],
              [author.famous_work ? 1 : 0, "Featured", author.famous_work],
            ].map(([val, label, sub]) => (
              <div key={label} className="rounded-xl border border-line px-4 py-3 text-center">
                <p className="text-lg font-extrabold">{val}</p>
                <p className="text-muted text-[11px]">{label}</p>
                {sub && <p className="text-muted mt-0.5 line-clamp-1 text-[10px]">{sub}</p>}
              </div>
            ))}
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
