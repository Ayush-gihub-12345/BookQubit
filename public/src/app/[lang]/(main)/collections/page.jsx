import NamedListBrowser from "@/components/NamedListBrowser";
import { facets } from "@/lib/repo";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const lang = await getLang();
  return {
    title: "Collections",
    description: "Curated book collections on BookQubit — themed reading lists grouped by author, topic, and genre.",
    alternates: { canonical: `/${lang}/collections` },
  };
}

export default async function CollectionsPage() {
  const lang = await getLang();
  const _ = t(lang);
  const f = await facets(lang);
  return (
    <NamedListBrowser
      items={f.collections}
      getHref={(name) => `/${lang}/collections/${encodeURIComponent(name)}`}
      title={_("collections")}
      subtitle={_("collectionsSub")}
      searchPlaceholder={_("searchEllipsis")}
      itemNoun={_("books").toLowerCase()}
      exploreLabel={_("viewAll")}
      noResultsTitle={_("noResults")}
      noResultsSubtitle={_("noResultsTryAdjusting")}
    />
  );
}
