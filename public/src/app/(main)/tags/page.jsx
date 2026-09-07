import NamedListBrowser from "@/components/NamedListBrowser";
import { facets } from "@/lib/repo";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Tags",
  description: "Explore books by topic and tag on BookQubit — find your next read through the themes and ideas you care about.",
  alternates: { canonical: "/tags" },
};

export default async function TagsPage() {
  const lang = await getLang();
  const _ = t(lang);
  const f = await facets(lang);

  return (
    <NamedListBrowser
      items={f.tags}
      getHref={(name) => `/books?tag=${encodeURIComponent(name)}`}
      title={_("tags")}
      subtitle={_("tagsSub")}
      searchPlaceholder={_("searchEllipsis")}
      itemNoun={_("books").toLowerCase()}
      exploreLabel={_("viewAll")}
      noResultsTitle={_("noResults")}
      noResultsSubtitle={_("noResultsTryAdjusting")}
    />
  );
}
