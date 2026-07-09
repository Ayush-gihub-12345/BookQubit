import Link from "next/link";
import { facets } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const f = await facets(await getLang());

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Categories</h1>
      <p className="mt-1 text-sm text-slate-500">Browse books by category</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {f.categories.map((c) => (
          <Link
            key={c.name}
            href={`/books?category=${encodeURIComponent(c.name)}`}
            className="card flex items-center justify-between p-5"
          >
            <span className="font-semibold">{c.name}</span>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-slate-800 dark:text-brand-100">
              {c.count}
            </span>
          </Link>
        ))}
      </div>
      {!f.categories.length && <p className="py-20 text-center text-slate-500">No categories yet.</p>}
    </div>
  );
}
