import Link from "next/link";
import BookCard from "@/components/BookCard";
import Section from "@/components/Section";
import HeroSlider from "@/components/HeroSlider";
import Rating from "@/components/Rating";
import BookCover from "@/components/BookCover";
import ContinueReading from "@/components/ContinueReading";
import Icon from "@/components/Icon";
import ForYou from "@/components/ForYou";
import RecentlyViewed from "@/components/RecentlyViewed";
import HScrollRow from "@/components/HScrollRow";
import Logo from "@/components/Logo";
import { listBooks, facets, listAuthors, listPublications, listComics, getRecentlyAdded } from "@/lib/repo";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Home() {
  const lang = await getLang();
  const _ = t(lang);
  const [all, topRated, newReleases, f, authors, pubs, comics, recentlyAdded] = await Promise.all([
    listBooks(lang),
    listBooks(lang, { sort: "rating", limit: 10 }),
    listBooks(lang, { sort: "new", limit: 6 }),
    facets(lang),
    listAuthors(lang),
    listPublications(lang),
    listComics(lang),
    getRecentlyAdded(lang, 8),
  ]);
  const heroBooks = all.filter((b) => b.featured).slice(0, 5);
  const surprise = all.length ? all[Math.floor(Math.random() * all.length)] : null;

  const QUOTES = [
    { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", by: "George R.R. Martin" },
    { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", by: "Dr. Seuss" },
    { text: "Books are a uniquely portable magic.", by: "Stephen King" },
    { text: "Until I feared I would lose it, I never loved to read. One does not love breathing.", by: "Harper Lee" },
    { text: "I have always imagined that Paradise will be a kind of library.", by: "Jorge Luis Borges" },
    { text: "Reading is essential for those who seek to rise above the ordinary.", by: "Jim Rohn" },
    { text: "A book is a dream that you hold in your hand.", by: "Neil Gaiman" },
    { text: "There is no friend as loyal as a book.", by: "Ernest Hemingway" },
    { text: "Once you learn to read, you will be forever free.", by: "Frederick Douglass" },
    { text: "We read to know we are not alone.", by: "C.S. Lewis" },
  ];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const quote = QUOTES[dayOfYear % QUOTES.length];
  const collectionsWithBooks = f.collections.slice(0, 3).map((c) => ({
    ...c,
    books: all.filter((b) => b.collection === c.name).slice(0, 2),
  }));

  const HUB = [
    { icon: "compass", title: "Explore Library", desc: "Discover new worlds and hidden literary gems", href: "/books", color: "from-sky-500 to-blue-600" },
    { icon: "headphones", title: "Audiobooks", desc: "Listen to your favorite books on the go", href: "/books", color: "from-fuchsia-500 to-purple-600" },
    { icon: "zap", title: "Comics", desc: "Legendary issues and timeless adventures", href: "/comics", color: "from-amber-500 to-orange-600" },
    { icon: "users", title: "Community", desc: "Join discussions and connect with readers", href: "/community", color: "from-emerald-500 to-teal-600" },
  ];

  return (
    <>
      {/* Hero slider */}
      <section className="mx-auto max-w-7xl px-4 pt-8">
        <HeroSlider books={heroBooks.length ? heroBooks : topRated.slice(0, 5)}
          labels={{ summary: _("summary"), getBook: _("getBook"), keyFeatures: _("keyFeatures") }} />
      </section>

      {/* Continue Reading (signed-in users) */}
      <ContinueReading />

      {/* Personalized picks (signed-in users with history) */}
      <ForYou lang={lang} />

      {/* Recently viewed (any visitor with history) */}
      <RecentlyViewed />

      {/* Trending Now */}
      <Section title={_("trending")} subtitle={_("trendingSub")} href="/books?sort=rating">
        <HScrollRow>
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
        </HScrollRow>
      </Section>

      {/* CTA band */}
      <section className="band py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            {_("ctaHeading")} <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">{_("ctaHighlight")}</span>
          </h2>
          <p className="mt-3 text-white/70">
            {_("ctaSub", { count: all.length, genres: f.categories.length })}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/books" className="btn-primary">{_("browse")}</Link>
            {surprise && (
              <Link href={`/books/${encodeURIComponent(surprise.slug)}`} className="btn-ghost border-white/30 text-white hover:border-white hover:text-white">
                <Icon name="zap" size={15} /> Surprise me
              </Link>
            )}
            <Link href="/leaderboard" className="btn-ghost border-white/30 text-white hover:border-white hover:text-white">
              <Icon name="trophy" size={15} /> Bookworm Ranking
            </Link>
          </div>
        </div>
      </section>

      {/* Daily quote */}
      <section className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-muted text-xs font-bold uppercase tracking-[0.2em]">{_("quoteOfDay")}</p>
        <blockquote className="mt-3 text-xl font-medium leading-relaxed sm:text-2xl">
          “{quote.text}”
        </blockquote>
        <p className="text-muted mt-3 text-sm">— {quote.by}</p>
      </section>

      {/* Quick Hub */}
      <Section title={_("quickHub")} subtitle={_("quickHubSub")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HUB.map((h) => (
            <Link key={h.title} href={h.href} className="card group p-6">
              <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${h.color} text-white shadow-lg`}>
                <Icon name={h.icon} size={20} />
              </span>
              <h3 className="mt-4 font-bold group-hover:text-brand-600">{h.title}</h3>
              <p className="text-muted mt-1 text-sm">{h.desc}</p>
              <p className="mt-3 text-xs font-semibold text-brand-600">Open Section →</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* Explore Books */}
      <Section title={_("featured")} subtitle="Dive into our curated selection of must-read titles" href="/books">
        <HScrollRow>
          {all.slice(0, 12).map((b) => (
            <div key={b.id} className="w-40 sm:w-44"><BookCard book={b} /></div>
          ))}
        </HScrollRow>
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
      <Section title={_("newReleases")} subtitle={_("newReleasesSub")} href="/books?sort=new">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {newReleases.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </Section>

      {/* Featured Authors */}
      {authors.length > 0 && (
        <Section title="Featured Authors" subtitle="Our most influential writers and thinkers" href="/authors">
          <HScrollRow>
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
          </HScrollRow>
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
          <HScrollRow>
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
          </HScrollRow>
        </Section>
      )}

      {/* Recently added — trust signal: the catalog is actively growing */}
      {recentlyAdded.length > 0 && (
        <Section title="Recently Added" subtitle="Freshly added to the BookQubit library" href="/books">
          <HScrollRow>
            {recentlyAdded.map((b) => (
              <div key={b.id} className="relative w-40 sm:w-44">
                <span className="absolute left-2 top-2 z-10 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">NEW</span>
                <BookCard book={b} />
              </div>
            ))}
          </HScrollRow>
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
        <p className="pill !px-4 !py-1.5">The Future of Reading</p>
        <div className="mt-4 flex justify-center"><Logo size={40} /></div>
        <p className="text-muted mx-auto mt-2 max-w-xl px-4 text-sm">
          Your quantum leap into the world of literature — timeless wisdom, modern intelligence,
          and a reading ecosystem that grows with your mind.
        </p>
      </section>
    </>
  );
}
