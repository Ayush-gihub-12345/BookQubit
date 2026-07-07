import Link from "next/link";
import BookCard from "@/components/BookCard";
import Section from "@/components/Section";
import SearchBar from "@/components/SearchBar";
import { listBooks, facets } from "@/lib/repo";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Home() {
  const lang = await getLang();
  const _ = t(lang);
  const [featured, topRated, newReleases, f] = await Promise.all([
    listBooks(lang, { limit: 6 }),
    listBooks(lang, { sort: "rating", limit: 6 }),
    listBooks(lang, { sort: "new", limit: 6 }),
    facets(lang),
  ]);
  const hero = topRated[0];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-brand-700 text-white">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(60%_60%_at_70%_20%,#38bdf8_0%,transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur">
              📚 Summaries · Key insights · Curated picks
            </p>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Find your next
              <span className="bg-gradient-to-r from-sky-300 to-cyan-200 bg-clip-text text-transparent"> great read</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-300">
              Explore hand-picked books with summaries and key takeaways, discover authors and
              publishers, and buy through trusted stores — in 12 languages.
            </p>
            <div className="mt-6 max-w-md">
              <SearchBar lang={lang} placeholder={_("search")} big />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/books" className="btn-primary">{_("browse")}</Link>
              <Link href="/collections" className="btn-ghost border-white/30 text-white hover:border-white hover:text-white">
                {_("explore")}
              </Link>
            </div>
          </div>
          {hero?.cover_url && (
            <div className="hidden justify-center lg:flex">
              <Link href={`/books/${hero.slug}`} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero.cover_url}
                  alt={hero.title}
                  className="w-64 rotate-3 rounded-2xl shadow-2xl shadow-black/50 transition duration-500 group-hover:rotate-0 group-hover:scale-105"
                />
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-ink-900 shadow-lg">
                  ★ {hero.rating} · Top pick
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Section title={_("featured")} subtitle="Curated picks worth your time" href="/books">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {featured.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </Section>

      <Section title={_("topRated")} subtitle="Loved by readers" href="/books?sort=rating">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {topRated.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </Section>

      {f.collections.length > 0 && (
        <Section title={_("collections")} subtitle="Themed reading journeys" href="/collections">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {f.collections.slice(0, 4).map((c) => (
              <Link
                key={c.name}
                href={`/collections/${encodeURIComponent(c.name)}`}
                className="card p-6 hover:border-brand-500"
              >
                <p className="font-semibold">{c.name}</p>
                <p className="mt-1 text-sm text-slate-500">{c.count} books</p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title={_("newReleases")} subtitle="Fresh on the shelf" href="/books?sort=new">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {newReleases.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </Section>

      {f.tags.length > 0 && (
        <Section title={_("popularTags")} href="/tags">
          <div className="flex flex-wrap gap-2">
            {f.tags.slice(0, 20).map((t) => (
              <Link key={t.name} href={`/tags/${encodeURIComponent(t.name.toLowerCase().replace(/\s+/g, "-"))}`} className="pill">
                {t.name} <span className="ml-1.5 opacity-60">{t.count}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
