import Link from "next/link";
import Rating from "@/components/Rating";
import { listComics } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = { title: "Comics" };

export default async function ComicsPage() {
  const comics = await listComics(await getLang());

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Comics</h1>
      <p className="mt-1 text-sm text-slate-500">{comics.length} comics</p>
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {comics.map((c) => (
          <Link key={c.id} href={`/comics/${c.slug}`} className="card group block overflow-hidden">
            <div className="relative aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
              {c.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.cover_url} alt={c.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <div className="grid h-full place-items-center p-4 text-center font-semibold text-slate-400">{c.title}</div>
              )}
              {c.category && (
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                  {c.category}
                </span>
              )}
            </div>
            <div className="p-4">
              <h2 className="line-clamp-1 font-semibold group-hover:text-brand-600">{c.title}</h2>
              <p className="line-clamp-1 text-sm text-slate-500">{c.publisher}</p>
              <div className="mt-2"><Rating value={c.rating} /></div>
            </div>
          </Link>
        ))}
      </div>
      {!comics.length && <p className="py-20 text-center text-slate-500">No comics yet.</p>}
    </div>
  );
}
