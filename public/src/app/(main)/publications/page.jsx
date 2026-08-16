import PublishersBrowser from "@/components/PublishersBrowser";
import { queryPublishers, getPublisherTypes } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Publishers",
  description: "Browse publishers on BookQubit — every publishing house's catalog, with ratings and reader favorites.",
  alternates: { canonical: "/publications" },
};

// Same fix as /authors — only the first page is fetched server-side;
// PublishersBrowser fetches the rest from /api/publishers.
export default async function PublicationsPage() {
  const lang = await getLang();
  const [initial, types] = await Promise.all([
    queryPublishers(lang, { sort: "name", page: 1, perPage: 60 }),
    getPublisherTypes(lang),
  ]);
  return (
    <PublishersBrowser
      lang={lang}
      initialPublications={initial.publications}
      initialHasMore={initial.hasMore}
      types={types}
    />
  );
}
