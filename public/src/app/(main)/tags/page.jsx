import NamedListBrowser from "@/components/NamedListBrowser";
import { facets } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Tags",
  description: "Explore books by topic and tag on BookQubit — find your next read through the themes and ideas you care about.",
  alternates: { canonical: "/tags" },
};

export default async function TagsPage() {
  const f = await facets(await getLang());

  return (
    <NamedListBrowser
      items={f.tags}
      getHref={(name) => `/books?tag=${encodeURIComponent(name)}`}
      title="Tags"
      subtitle="Explore books by topic"
      searchPlaceholder="Search tags…"
    />
  );
}
