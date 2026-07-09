import Link from "next/link";
import { listPublications } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = { title: "Publishers" };

export default async function PublicationsPage() {
  const pubs = await listPublications(await getLang());

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Publishers</h1>
      <p className="mt-1 text-sm text-muted">{pubs.length} publishers</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pubs.map((p) => (
          <Link key={p.id} href={`/publications/${p.slug}`} className="card p-5">
            <div className="flex items-center gap-4">
              {p.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logo_url} alt={p.name} className="h-14 w-14 rounded-xl object-cover" loading="lazy" />
              )}
              <div>
                <h2 className="font-semibold">{p.name}</h2>
                <p className="text-xs text-muted">{[p.type, p.headquarters].filter(Boolean).join(" · ")}</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-muted">{p.description}</p>
          </Link>
        ))}
      </div>
      {!pubs.length && <p className="py-20 text-center text-muted">No publishers yet.</p>}
    </div>
  );
}
