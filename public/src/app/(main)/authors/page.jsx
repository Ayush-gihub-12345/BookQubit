import Link from "next/link";
import { listAuthors } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = { title: "Authors" };

export default async function AuthorsPage() {
  const authors = await listAuthors(await getLang());

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Authors</h1>
      <p className="mt-1 text-sm text-muted">{authors.length} authors</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {authors.map((a) => (
          <Link key={a.id} href={`/authors/${a.slug}`} className="card flex gap-4 p-5">
            {a.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.image_url} alt={a.name} className="h-20 w-20 rounded-full object-cover" loading="lazy" />
            ) : (
              <div className="grid h-20 w-20 shrink-0 place-items-center tint-brand rounded-full text-2xl font-bold text-brand-600">
                {a.name[0]}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-semibold">{a.name}</h2>
              <p className="text-xs text-muted">{[a.country, a.birth_year].filter(Boolean).join(" · ")}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{a.bio}</p>
            </div>
          </Link>
        ))}
      </div>
      {!authors.length && <p className="py-20 text-center text-muted">No authors yet.</p>}
    </div>
  );
}
