import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import Icon from "@/components/Icon";
import CreateList from "@/components/lists/CreateList";
import { getCf } from "@/lib/cf/env";
import { cached } from "@/lib/db";
import { TTL } from "@/lib/cache-policy";
import { browseLists } from "@/lib/lists";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const lang = await getLang();
  return {
    title: "Reader lists",
    description: "Lists of books made by BookQubit readers: best-of lists, reading orders and themed picks. Vote for the ones you like.",
    alternates: { canonical: `/${lang}/lists` },
  };
}

export default async function ListsPage({ searchParams }) {
  const lang = await getLang();
  const _ = t(lang);
  const sp = await searchParams;
  const sort = sp?.sort === "recent" ? "recent" : "popular";
  const page = Math.min(50, Math.max(1, Number(sp?.page) || 1));
  let data = { lists: [], hasMore: false };
  let unavailable = false;
  try {
    const { env } = await getCf();
    if (!env.ENGAGEMENT_DB) unavailable = true;
    else data = await cached(`lists-index:${sort}:${page}`, () => browseLists(env.ENGAGEMENT_DB, { sort, page }), TTL.short);
  } catch { unavailable = true; }

  const href = (o) => `/${lang}/lists?${new URLSearchParams({ sort, ...(page > 1 ? { page } : {}), ...o })}`;
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <Breadcrumbs lang={lang} homeLabel={_("homeWord")} label={_("navBreadcrumb")} className="mb-5" items={[{ label: "Lists" }]} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Reader lists</h1>
          <p className="text-muted mt-1 text-sm">Best-of lists, reading orders and themed picks, made by readers. Vote for the ones you like.</p>
        </div>
        <CreateList lang={lang} />
      </div>
      <div className="mt-5 flex gap-2" role="tablist" aria-label="Sort lists">
        <Link href={`/${lang}/lists?sort=popular`} className="pill" data-active={sort === "popular"}>Most voted</Link>
        <Link href={`/${lang}/lists?sort=recent`} className="pill" data-active={sort === "recent"}>Newest</Link>
      </div>
      {unavailable ? (
        <p className="text-muted mt-10 text-center">Lists are not available right now.</p>
      ) : data.lists.length === 0 ? (
        <p className="text-muted mt-10 text-center">No lists yet. Be the first to make one.</p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {data.lists.map((l) => (
            <li key={l.id}>
              <Link href={`/${lang}/lists/${l.id}`} prefetch={false} className="card block h-full p-5">
                <p className="line-clamp-2 text-lg font-bold">{l.title}</p>
                {l.description && <p className="text-muted mt-1 line-clamp-2 text-sm">{l.description}</p>}
                <p className="text-muted mt-3 flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1"><Icon name="book" size={13} />{l.item_count} books</span>
                  <span className="inline-flex items-center gap-1"><Icon name="thumbsUp" size={13} />{l.vote_count}</span>
                  {l.user_name && <span className="truncate">by {l.user_name}</span>}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <nav className="mt-8 flex justify-between text-sm font-semibold" aria-label="Pages">
        {page > 1 ? <Link href={href({ page: page - 1 })} className="text-brand-700 hover:underline">← Newer</Link> : <span />}
        {data.hasMore ? <Link href={href({ page: page + 1 })} className="text-brand-700 hover:underline">More →</Link> : <span />}
      </nav>
    </div>
  );
}
