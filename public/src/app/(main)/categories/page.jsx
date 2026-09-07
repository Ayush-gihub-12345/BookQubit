import NamedListBrowser from "@/components/NamedListBrowser";
import { facets } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Categories",
  description: "Browse every book genre and category on BookQubit — Philosophy, History, Fiction, Psychology, Self-Help, Business, and more.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const f = await facets(await getLang());

  return (
    <NamedListBrowser
      items={f.categories}
      getHref={(name) => `/books?category=${encodeURIComponent(name)}`}
      title="Categories"
      subtitle="Browse books by category"
      searchPlaceholder="Search categories…"
    />
  );
}
