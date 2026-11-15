import Link from "next/link";
import { listAuthors } from "@/lib/repo";
import { getCoauthorPairs } from "@/lib/author-explore";
import { countryLatLon } from "@/lib/geo";
import { countryFlag } from "@/lib/countryFlag";
import { getLang } from "@/lib/lang";
import { WorldMap, CoAuthorGraph } from "@/components/authors/ExploreViews";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore authors", description: "Where authors come from, who writes across genres, who writes together, and when they were born." };

const VIEWS = [
  ["map", "World map", "globe"], ["genres", "Across genres", "layers"], ["network", "Co-author network", "users"], ["eras", "Born in…", "calendar"],
];

export default async function ExploreAuthors({ searchParams }) {
  const sp = await searchParams;
  const lang = await getLang();
  const view = VIEWS.some(([v]) => v === sp.view) ? sp.view : "map";
  const by = sp.by === "century" ? "century" : "decade";
  // One cached list feeds the map, genre and era views; only the network adds a (bounded, six-hour cached) query.
  const authors = await listAuthors(lang);

  let body = null;
  if (view === "map") {
    const m = new Map();
    for (const a of authors) {
      if (!a.country) continue;
      const e = m.get(a.country) || { name: a.country, count: 0, authors: [], ll: countryLatLon(a.country), flag: countryFlag(a.country) };
      e.count++; e.authors.push({ slug: a.slug, name: a.name }); m.set(a.country, e);
    }
    const countries = [...m.values()].sort((a, b) => b.count - a.count);
    body = countries.length ? <WorldMap countries={countries} /> : <Empty text="No author countries recorded yet." />;
  } else if (view === "genres") {
    const multi = authors.filter((a) => (a.genres || []).length >= 3).sort((a, b) => b.genres.length - a.genres.length).slice(0, 60);
    const focused = authors.filter((a) => (a.genres || []).length === 1).slice(0, 24);
    body = (
      <div className="space-y-10">
        <section aria-labelledby="g-multi">
          <h2 id="g-multi" className="font-display text-xl font-bold">Genre-benders</h2>
          <p className="text-muted text-sm">Three or more genres on their profile.</p>
          {multi.length ? <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{multi.map((a) => <AuthorRow key={a.id} a={a} lang={lang} badge={`${a.genres.length} genres`} />)}</ul> : <div className="mt-4"><Empty text="No author lists three or more genres yet." /></div>}
        </section>
        <section aria-labelledby="g-one">
          <h2 id="g-one" className="font-display text-xl font-bold">One genre, all in</h2>
          <p className="text-muted text-sm">Specialists who stay in one lane.</p>
          {focused.length ? <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{focused.map((a) => <AuthorRow key={a.id} a={a} lang={lang} badge={a.genres[0]} />)}</ul> : <div className="mt-4"><Empty text="Nothing here yet." /></div>}
        </section>
      </div>
    );
  } else if (view === "network") {
    const pairs = await getCoauthorPairs(lang).catch(() => []);
    const slugs = Object.fromEntries(authors.map((a) => [a.name.trim(), a.slug]));
    body = pairs.length ? <CoAuthorGraph pairs={pairs} slugs={slugs} /> : <Empty text="No co-authored books in the catalog yet." />;
  } else {
    const groups = new Map();
    for (const a of authors) {
      if (!a.birth_year) continue;
      const key = by === "century" ? `${Math.floor((a.birth_year - 1) / 100) + 1}th century` : `${Math.floor(a.birth_year / 10) * 10}s`;
      const sort = by === "century" ? Math.floor((a.birth_year - 1) / 100) : Math.floor(a.birth_year / 10);
      const g = groups.get(key) || { key, sort, list: [] };
      g.list.push(a); groups.set(key, g);
    }
    const ordered = [...groups.values()].sort((a, b) => a.sort - b.sort);
    body = (
      <div>
        <div className="mb-5 flex gap-2">
          {["decade", "century"].map((k) => <Link key={k} href={`/${lang}/authors/explore?view=eras&by=${k}`} prefetch={false} className="pill" data-active={by === k}>By {k}</Link>)}
        </div>
        {ordered.length ? (
          <ol className="relative space-y-6 border-s border-[var(--line-strong)] ps-5">
            {ordered.map((g) => (
              <li key={g.key} className="relative">
                <span aria-hidden className="absolute -start-[1.72rem] top-1.5 h-3 w-3 rounded-full bg-brand-500 ring-4 ring-[var(--bg)]" />
                <h2 className="font-display text-lg font-bold">{g.key} <span className="text-muted text-sm font-normal">· {g.list.length}</span></h2>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {[...g.list].sort((a, b) => a.birth_year - b.birth_year).map((a) => (
                    <li key={a.id}><Link href={`/${lang}/authors/${a.slug}`} prefetch={false} className="pill !h-8 !text-[13px]">{a.name} <span className="text-muted">{a.birth_year}</span></Link></li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        ) : <Empty text="No birth years recorded yet." />}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
      <p className="eyebrow">Authors</p>
      <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Explore authors</h1>
      <nav aria-label="Author views" className="hscroll mt-5 gap-2 [&>*]:shrink-0">
        {VIEWS.map(([v, label, icon]) => (
          <Link key={v} href={`/${lang}/authors/explore?view=${v}`} prefetch={false} className="pill !h-10" data-active={v === view}><Icon name={icon} size={15} />{label}</Link>
        ))}
      </nav>
      <div className="mt-6">{body}</div>
    </div>
  );
}

function Empty({ text }) { return <p className="card text-muted p-6 text-sm hover:!translate-y-0">{text}</p>; }

function AuthorRow({ a, lang, badge }) {
  return (
    <li>
      <Link href={`/${lang}/authors/${a.slug}`} prefetch={false} className="card card-hover flex items-center gap-3 p-3">
        {a.image_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={a.image_url} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-full object-cover" />
          : <span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] font-bold text-brand-700">{a.name[0]}</span>}
        <span className="min-w-0"><b className="block truncate">{a.name}</b><span className="text-muted block truncate text-xs">{(a.genres || []).slice(0, 3).join(" · ") || a.country}</span></span>
        <span className="badge badge-brand ms-auto !h-6 shrink-0 !text-[11px]">{badge}</span>
      </Link>
    </li>
  );
}
