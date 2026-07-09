import Link from "next/link";
import { facets } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tags" };

export default async function TagsPage() {
  const f = await facets(await getLang());

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Tags</h1>
      <p className="mt-1 text-sm text-slate-500">Explore books by topic</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {f.tags.map((t) => (
          <Link
            key={t.name}
            href={`/books?tag=${encodeURIComponent(t.name)}`}
            className="pill !px-4 !py-2 !text-sm"
          >
            #{t.name} <span className="ml-1.5 opacity-60">{t.count}</span>
          </Link>
        ))}
      </div>
      {!f.tags.length && <p className="py-20 text-center text-slate-500">No tags yet.</p>}
    </div>
  );
}
