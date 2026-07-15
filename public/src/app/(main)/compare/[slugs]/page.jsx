import { notFound } from "next/navigation";
import Link from "next/link";
import { getBooksBySlug } from "@/lib/repo";
import { getLang } from "@/lib/lang";
import BookCover from "@/components/BookCover";
import Rating from "@/components/Rating";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

const J = (v) => { try { return v ? JSON.parse(v) : []; } catch { return []; } };

// URL shape mirrors the exact phrase people type — "atomic-habits-vs-deep-work"
// reads as "atomic habits vs deep work", not a query-string variant Google
// treats more cautiously. Caps at 4 books: a comparison table wider than
// that stops being genuinely useful to a reader deciding what to read next.
function parseSlugs(param) {
  return decodeURIComponent(param).split("-vs-").filter(Boolean).slice(0, 4);
}

export async function generateMetadata({ params }) {
  const { slugs: slugParam } = await params;
  const slugs = parseSlugs(slugParam);
  const lang = await getLang();
  const map = await getBooksBySlug(slugs, lang, "slug, title, author");
  const titles = slugs.map((s) => map.get(s)?.title).filter(Boolean);
  if (titles.length < 2) return { title: "Compare Books", robots: { index: false } };
  const heading = titles.join(" vs ");
  return {
    title: `${heading} — Which Should You Read?`,
    description: `Comparing ${titles.join(", ")}: ratings, page count, key takeaways, and more, side by side — to help you decide which to read ${titles.length > 2 ? "first" : "next"}.`,
    alternates: { canonical: `/compare/${slugParam}` },
  };
}

export default async function ComparePage({ params }) {
  const { slugs: slugParam } = await params;
  const slugs = parseSlugs(slugParam);
  if (slugs.length < 2) notFound();

  const lang = await getLang();
  const map = await getBooksBySlug(slugs, lang, "*");
  const books = slugs.map((s) => map.get(s)).filter(Boolean);
  if (books.length < 2) notFound();

  const heading = books.map((b) => b.title).join(" vs ");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bookqubit.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: heading,
    itemListElement: books.map((b, i) => ({
      "@type": "ListItem", position: i + 1,
      item: { "@type": "Book", name: b.title, url: `${baseUrl}/books/${encodeURIComponent(b.slug)}` },
    })),
  };

  const rows = [
    ["Author", (b) => b.author || "—"],
    ["Rating", (b) => (b.rating ? `★ ${b.rating}` : "—")],
    ["Pages", (b) => b.page_count || "—"],
    ["Published", (b) => b.published || "—"],
    ["Format", (b) => b.format || "—"],
    ["Category", (b) => b.category || "—"],
    ["Publisher", (b) => b.publisher || "—"],
    ["Country", (b) => b.country || "—"],
  ];
  const gridStyle = { gridTemplateColumns: `repeat(${books.length}, minmax(0, 1fr))` };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-muted mb-6 text-sm">
        <Link href="/compare" className="hover:text-brand-600">Compare</Link>
        <span className="mx-1.5">/</span>
        <span className="text-[var(--fg)]">{heading}</span>
      </nav>

      <h1 className="text-3xl font-bold sm:text-4xl">{heading}</h1>
      <p className="text-muted mt-2 max-w-2xl">
        Side-by-side comparison — ratings, page count, and key takeaways, to help you decide which to read {books.length > 2 ? "first" : "next"}.
      </p>

      <div className="mt-8 grid gap-6" style={gridStyle}>
        {books.map((b) => (
          <div key={b.slug} className="card p-5 text-center hover:!translate-y-0">
            <Link href={`/books/${encodeURIComponent(b.slug)}`}>
              <div className="mx-auto aspect-[2/3] w-28 overflow-hidden rounded-lg shadow-lg sm:w-32">
                <BookCover title={b.title} author={b.author} cover_url={b.cover_url} />
              </div>
            </Link>
            <Link href={`/books/${encodeURIComponent(b.slug)}`} className="mt-3 block font-bold hover:text-brand-600">
              {b.title}
            </Link>
            <p className="text-muted text-xs">{b.author}</p>
            <div className="mt-2 flex justify-center"><Rating value={b.rating} /></div>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <tbody>
            {rows.map(([label, get]) => (
              <tr key={label} className="border-line border-b">
                <td className="text-muted w-32 py-3 pr-4 text-xs font-bold uppercase tracking-wide">{label}</td>
                {books.map((b) => (
                  <td key={b.slug} className="px-3 py-3 text-center font-medium">{get(b)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {books.some((b) => J(b.key_points).length > 0) && (
        <div className="mt-10">
          <h2 className="text-xl font-bold">Key Takeaways</h2>
          <div className="mt-4 grid gap-6" style={gridStyle}>
            {books.map((b) => (
              <div key={b.slug}>
                <p className="mb-2 font-semibold">{b.title}</p>
                <ul className="space-y-2">
                  {J(b.key_points).map((k) => (
                    <li key={k} className="tint-brand flex items-start gap-2 rounded-xl px-3 py-2 text-xs leading-relaxed">
                      <span className="text-brand-600">✓</span> {k}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/compare" className="btn-ghost inline-flex">
          <Icon name="layers" size={14} /> Compare different books
        </Link>
      </div>
    </div>
  );
}
