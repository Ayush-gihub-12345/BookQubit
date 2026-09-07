import NamedListBrowser from "@/components/NamedListBrowser";
import { facets } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Collections",
  description: "Curated book collections on BookQubit — themed reading lists grouped by author, topic, and genre.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const f = await facets(await getLang());
  return (
    <NamedListBrowser
      items={f.collections}
      getHref={(name) => `/collections/${encodeURIComponent(name)}`}
      title="Collections"
      subtitle="Themed reading journeys, curated for you"
      searchPlaceholder="Search collections…"
    />
  );
}
