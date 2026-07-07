import Link from "next/link";
import BookCard from "@/components/BookCard";
import Section from "@/components/Section";
import HeroSlider from "@/components/HeroSlider";
import Rating from "@/components/Rating";
import BookCover from "@/components/BookCover";
import { listBooks, facets, listAuthors, listPublications, listComics } from "@/lib/repo";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Home() {
  const lang = await getLang();
  const _ = t(lang);
  const [all, topRated, newReleases, f, authors, pubs, comics] = await Promise.all([
    listBooks(lang),
    listBooks(lang, { sort: "rating", limit: 10 }),
    listBooks(lang, { sort: "new", limit: 6 }),
    facets(lang),
    listAuthors(lang),
    listPublications(lang),
    listComics(lang),
  ]);
  const heroBooks = all.filter((b) => b.featured).slice(0, 5);
  const collectionsWithBooks = f.collections.slice(0, 3).map((c) => ({
    ...c,
    books: all.filter((b) => b.collection === c.name).slice(0, 2),
  }));

  const HUB = [
    { icon: "🧭", title: "Explore Library", desc: "Discover new worlds and hidden literary gems", href: "/books", color: "from-sky-500 to-blue-600" },
    { icon: "🎧", title: "Audiobooks", desc: "Listen to your favorite books on the go", href: "/books", color: "from-fuchsia-500 to-purple-600" },
    { icon: "💥", title: "Comics", desc: "Legendary issues and timeless adventures", href: "/comics", color: "from-amber-500 to-orange-600" },
    { icon: "🏆", title: "Community", desc: "Compete with readers on the leaderboard", href: "/readers", color: "from-emerald-500 to-teal-600" },
  ];

  return (
    <>
      {/* Hero slider */}
      <section className="mx-auto max-w-7xl px-4 pt-8">
        <HeroSlider books={heroBooks.length ? heroBooks : topRated.slice(0, 5)} labels={{ summary: _("summary") }} />
      </section>

      {/* Trending Now */}
      <Section title="🔥 Trending Now" subtitle="What's hot in our community right now" href="/books?sort=rating">
        <div className="hscroll">
          {topRated.map((b, i) => (
            <Link key={b.id} href={`/books/${encodeURIComponent(b.slug)}`} className="card group w-40 overflow-hidden sm:w-44">
              <div className="relative aspect-[2/3] overflow-hidden bg-black/5">
                <BookCover title={b.title} author={b.author} cover_url={b.cover_url}
                  imgClassName="transition duration-500 group-hover:scale-105" />
                <span className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                  #{i + 1}
                </span>
              </div>
              <div className="p-3">
                <p className="line-clamp-1 text-sm font-semibold group-hover:text-brand-600">{b.title}</p>
                <p className="text-muted line-clamp-1 text-xs">{b.author}</p>
                <p className="mt-1 text-xs text-emerald-500">📈 Trending · ★ {b.rating}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* CTA band */}
      <section className="bg-gradient-to-br from-ink-900 via-ink-800 to-brand-700 py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Discover Your Next <span className="bg-gradient-to-r from-pink-400 to-fuchsia-400 bg-clip-text text-transparent">Imagination</span>
          </h2>
          <p className="mt-3 text-slate-300">
            Join our community of readers exploring {all.length}+ titles across {f.categories.length}+ genres — with summaries and key insights on every book.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/books" className="btn-primary">{_("browse")}</Link>
            <Link href="/readers" className="btn-ghost border-white/30 text-white hover:border-white hover:text-white">🏆 Leaderboard</Link>
          </div>
        </div>
      </section>

      {/* Quick Hub */}
      <Section title="Quick Hub" subtitle="Everything you need to manage your literary journey">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HUB.map((h) => (
            <Link key={h.title} href={h.href} className="card group p-6">
              <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${h.color} text-xl text-white shadow-lg`}>{h.icon}</span>
              <h3 className="mt-4 font-bold group-hover:text-brand-600">{h.title}</h3>
              <p className="text-muted mt-1 text-sm">{h.desc}</p>
              <p className="mt-3 text-xs font-semibold text-brand-600">Open Section →</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* Explore Books */}
      <Section title={_("featured")} subtitle="Dive into our curated selection of must-read titles" href="/books">
        <div className="hscroll">
          {all.slice(0, 12).map((b) => (
            <div key={b.id} className="w-40 sm:w-44"><BookCard book={b} /></div>
          ))}
        </div>
      </Section>

      {/* Featured Collections */}
      {collectionsWithBooks.length > 0 && (
        <Section title="Featured Collections" subtitle="Curated book collections handpicked by our editors" href="/collections">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {collectionsWithBooks.map((c) => (
              <div key={c.name} className="card p-5 hover:!translate-y-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-brand-600">{c.name}</h3>
                  <span className="pill">{c.count} books</span>
                </div>
                <div className="mt-4 space-y-3">
                  {c.books.map((b) => (
                    <Link key={b.id} href={`/books/${encodeURIComponent(b.slug)}`} className="group flex items-center gap-3">
                      {b.cover_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.cover_url} alt="" className="h-14 w-10 rounded object-cover shadow" loading="lazy" />
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium group-hover:text-brand-600">{b.title}</span>
                        <span className="text-muted block text-xs">{b.author} · ★ {b.rating}</span>
                      </span>
                    </Link>
                  ))}
                </div>
                <Link href={`/collections/${encodeURIComponent(c.name)}`} className="mt-4 block text-xs font-semibold text-brand-600 hover:underline">
                  View all in this collection →
                </Link>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* New Releases */}
      <Section title={_("newReleases")} subtitle="Fresh on the shelf" href="/books?sort=new">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {newReleases.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </Section>

      {/* Featured Authors */}
      {authors.length > 0 && (
        <Section title="Featured Authors" subtitle="Our most influential writers and thinkers" href="/authors">
          <div className="hscroll">
            {authors.map((a) => (
              <Link key={a.id} href={`/authors/${a.slug}`} className="card w-44 p-5 text-center">
                {a.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.image_url} alt={a.name} className="mx-auto h-20 w-20 rounded-full object-cover" loading="lazy" />
                ) : (
                  <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-600/15 text-2xl font-bold text-brand-600">{a.name[0]}</span>
                )}
                <p className="mt-3 line-clamp-1 font-semibold">{a.name}</p>
                <p className="text-muted line-clamp-1 text-xs">{a.country}</p>
                <p className="mt-2 text-xs font-semibold text-brand-600">Know More →</p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Publishers */}
      {pubs.length > 0 && (
        <Section title="Explore Publishers" subtitle="Renowned publishing houses from around the world" href="/publications">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {pubs.slice(0, 4).map((p) => (
              <Link key={p.id} href={`/publications/${p.slug}`} className="card p-5 text-center">
                {p.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo_url} alt={p.name} className="mx-auto h-14 w-14 rounded-xl object-cover" loading="lazy" />
                ) : (
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-brand-600/15 text-xl font-bold text-brand-600">{p.name[0]}</span>
                )}
                <p className="mt-3 line-clamp-1 text-sm font-semibold">{p.name}</p>
                <p className="text-muted line-clamp-1 text-xs">{p.headquarters}</p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Comics */}
      {comics.length > 0 && (
        <Section title="Explore Comics" subtitle="Legendary issues and timeless adventures" href="/comics">
          <div className="hscroll">
            {comics.map((c) => (
              <Link key={c.id} href={`/comics/${c.slug}`} className="card group w-40 overflow-hidden sm:w-44">
                <div className="aspect-[2/3] overflow-hidden bg-black/5">
                  <BookCover title={c.title} author={c.publisher} cover_url={c.cover_url}
                    imgClassName="transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-3">
                  <p className="line-clamp-1 text-sm font-semibold group-hover:text-brand-600">{c.title}</p>
                  <p className="text-muted line-clamp-1 text-xs">{c.publisher}</p>
                  <Rating value={c.rating} />
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Popular tags */}
      {f.tags.length > 0 && (
        <Section title={_("popularTags")} href="/tags">
          <div className="flex flex-wrap gap-2">
            {f.tags.slice(0, 24).map((tg) => (
              <Link key={tg.name} href={`/books?tag=${encodeURIComponent(tg.name)}`} className="pill">
                #{tg.name} <span className="ml-1.5 opacity-60">{tg.count}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Brand strip */}
      <section className="border-line border-t py-14 text-center">
        <p className="pill !px-4 !py-1.5">✦ The Future of Reading</p>
        <h2 className="mt-4 text-2xl font-extrabold">Book<span className="text-brand-600">Qubit</span></h2>
        <p className="text-muted mx-auto mt-2 max-w-xl px-4 text-sm">
          Your quantum leap into the world of literature — timeless wisdom, modern intelligence,
          and a reading ecosystem that grows with your mind.
        </p>
      </section>
    </>
  );
}
