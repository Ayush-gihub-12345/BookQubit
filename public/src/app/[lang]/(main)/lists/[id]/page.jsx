import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import BookCard from "@/components/BookCard";
import ListActions from "@/components/lists/ListActions";
import { getCf } from "@/lib/cf/env";
import { cached } from "@/lib/db";
import { TTL } from "@/lib/cache-policy";
import { getList } from "@/lib/lists";
import { getBooksInOrder } from "@/lib/repo";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

async function load(id) {
  if (!/^[a-f0-9]{12}$/.test(id)) return null;
  const { env } = await getCf();
  if (!env.ENGAGEMENT_DB) return null;
  return cached(`list-page:${id}`, () => getList(env.ENGAGEMENT_DB, id), TTL.short);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const lang = await getLang();
  const found = await load(id).catch(() => null);
  if (!found) return { title: "List" };
  return {
    title: found.list.title,
    description: found.list.description || `${found.list.title}: a reader-made list of ${found.list.item_count} books.`,
    alternates: { canonical: `/${lang}/lists/${id}` },
  };
}

export default async function ListPage({ params }) {
  const { id } = await params;
  const lang = await getLang();
  const _ = t(lang);
  const found = await load(id).catch(() => null);
  if (!found) notFound();
  const slugs = found.items.map((i) => i.book_slug);
  const books = await getBooksInOrder(slugs, lang);
  const notes = new Map(found.items.map((i) => [i.book_slug, i.note]));
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <Breadcrumbs lang={lang} homeLabel={_("homeWord")} label={_("navBreadcrumb")} className="mb-5" items={[{ label: "Lists", href: "/lists" }, { label: found.list.title }]} />
      <h1 className="text-3xl font-bold sm:text-4xl">{found.list.title}</h1>
      <p className="text-muted mt-1 text-sm">{found.list.user_name ? `by ${found.list.user_name} · ` : ""}{found.list.item_count} books</p>
      {found.list.description && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed">{found.list.description}</p>}
      <ListActions lang={lang} id={id} ownerId={found.list.user_id} votes={found.list.vote_count} />
      {books.length === 0 ? (
        <p className="text-muted mt-10 text-center">No books in this list yet. Open any book and choose Add to a list.</p>
      ) : (
        <ol className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {books.map((b, i) => (
            <li key={b.id}><BookCard book={b} hrefBase={`/${lang}/books`} rank={i + 1} note={notes.get(b.slug) || undefined} /></li>
          ))}
        </ol>
      )}
    </div>
  );
}
