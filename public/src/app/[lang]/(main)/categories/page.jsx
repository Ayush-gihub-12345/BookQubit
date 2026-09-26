import NamedListBrowser from "@/components/NamedListBrowser";
import { facets } from "@/lib/repo";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const lang = await getLang();
  return {
    title: "Categories",
    description: "Browse every book genre and category on BookQubit — Philosophy, History, Fiction, Psychology, Self-Help, Business, and more.",
    alternates: { canonical: `/${lang}/categories` },
  };
}

export default async function CategoriesPage() {
  const lang = await getLang();
  const _ = t(lang);
  const f = await facets(lang);

  return (
    <NamedListBrowser
      items={f.categories}
      getHref={(name) => `/${lang}/books?category=${encodeURIComponent(name)}`}
      title={_("categories")}
      subtitle={_("categoriesSub")}
      searchPlaceholder={_("searchEllipsis")}
      itemNoun={_("books").toLowerCase()}
      exploreLabel={_("viewAll")}
      noResultsTitle={_("noResults")}
      noResultsSubtitle={_("noResultsTryAdjusting")}
    />
  );
}
