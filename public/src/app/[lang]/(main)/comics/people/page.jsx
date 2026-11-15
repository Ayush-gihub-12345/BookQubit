import Link from "next/link";
import { listComics } from "@/lib/repo";
import { getLang } from "@/lib/lang";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";
export const metadata = { title: "Comic characters and creators", description: "Every character and creator in the comics catalog, with the covers they appear on." };

// Characters and creators come from the comics' own `characters` and `creators` lists. The comics list is already cached
// for the comics pages, so this page adds no database work; output is capped at 48 entries per view.
export default async function ComicPeople({ searchParams }) {
  const sp = await searchParams;
  const lang = await getLang();
  const view = sp.view === "creators" ? "creators" : "characters";
  const q = String(sp.q || "").trim().toLowerCase().slice(0, 60);
  const comics = await listComics(lang);

  const map = new Map();
  for (const c of comics) {
    for (const raw of (view === "creators" ? c.creators : c.characters) || []) {
      const name = typeof raw === "string" ? raw : raw?.name;
      if (!name) continue;
      const key = name.trim();
      const e = map.get(key) || { name: key, items: [] };
      e.items.push(c); map.set(key, e);
    }
  }
  let list = [...map.values()];
  if (q) list = list.filter((e) => e.name.toLowerCase().includes(q));
  list.sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name));
  const total = list.length;
  list = list.slice(0, 48);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
      <p className="eyebrow">Comics</p>
      <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Characters and creators</h1>
      <p className="text-muted mt-2 max-w-xl text-sm">Pick a name to see every comic they appear in, with the covers.</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {["characters", "creators"].map((v) => (
          <Link key={v} href={`/${lang}/comics/people?view=${v}`} prefetch={false} className="pill !h-10" data-active={v === view}><Icon name={v === "characters" ? "users" : "feather"} size={15} />{v === "characters" ? "Characters" : "Creators"}</Link>
        ))}
        <form action={`/${lang}/comics/people`} className="ms-auto flex w-full gap-2 sm:w-auto">
          <input type="hidden" name="view" value={view} />
          <input name="q" defaultValue={sp.q || ""} placeholder={`Search ${view}`} aria-label={`Search ${view}`} className="input !min-h-10 !rounded-full text-sm sm:w-64" />
          <button className="btn-primary btn-sm">Search</button>
        </form>
      </div>

      {list.length === 0 ? (
        <p className="card text-muted mt-8 p-6 text-sm hover:!translate-y-0">{q ? `No ${view} match “${sp.q}”.` : `No ${view} are recorded in the comics catalog yet.`}</p>
      ) : (
        <>
          <p className="text-muted mt-5 text-xs">Showing {list.length} of {total}</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((e) => (
              <li key={e.name}>
                <details className="card group overflow-hidden hover:!translate-y-0">
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                    <span className="flex shrink-0">
                      {e.items.slice(0, 3).map((c, i) => (
                        <span key={c.id} className="cover !rounded-[3px] -ms-3 block w-10 first:ms-0" style={{ rotate: `${(i - 1) * 5}deg` }}>
                          {c.cover_url
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={c.cover_url} alt="" loading="lazy" />
                            : <span className="grid aspect-[2/3] place-items-center bg-[var(--surface-2)] text-[10px] font-bold">{c.title.slice(0, 2)}</span>}
                        </span>
                      ))}
                    </span>
                    <span className="min-w-0 flex-1"><b className="font-display block truncate text-lg leading-tight">{e.name}</b><span className="text-muted text-xs">{e.items.length} {e.items.length === 1 ? "comic" : "comics"}</span></span>
                    <Icon name="chevronDown" size={16} className="text-[var(--muted)] transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="grid grid-cols-3 gap-2 border-t border-[var(--line)] p-4">
                    {e.items.slice(0, 9).map((c) => (
                      <li key={c.id}>
                        <Link href={`/${lang}/comics/${encodeURIComponent(c.slug)}`} prefetch={false} className="group/c block">
                          <span className="cover !rounded-[3px] block">
                            {c.cover_url
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={c.cover_url} alt="" loading="lazy" />
                              : <span className="grid aspect-[2/3] place-items-center bg-[var(--surface-2)] text-xs font-bold">{c.title.slice(0, 2)}</span>}
                          </span>
                          <span className="mt-1 line-clamp-2 block text-[11px] leading-tight group-hover/c:text-brand-700">{c.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
