import Link from "next/link";
import { facets } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const f = await facets(await getLang());

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Collections</h1>
      <p className="mt-1 text-sm text-muted">Themed reading journeys, curated for you</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {f.collections.map((c) => (
          <Link
            key={c.name}
            href={`/collections/${encodeURIComponent(c.name)}`}
            className="card relative overflow-hidden p-8"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-500/10" />
            <h2 className="text-xl font-bold">{c.name}</h2>
            <p className="mt-1 text-sm text-muted">{c.count} {c.count === 1 ? "book" : "books"}</p>
            <p className="mt-4 text-sm font-semibold text-brand-600">Explore →</p>
          </Link>
        ))}
      </div>
      {!f.collections.length && <p className="py-20 text-center text-muted">No collections yet.</p>}
    </div>
  );
}
