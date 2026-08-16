import PublishersBrowser from "@/components/PublishersBrowser";
import { listPublications } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Publishers",
  description: "Browse publishers on BookQubit — every publishing house's catalog, with ratings and reader favorites.",
  alternates: { canonical: "/publications" },
};

export default async function PublicationsPage() {
  const pubs = await listPublications(await getLang());
  // Same trim as /authors: PublishersBrowser only ever renders these fields
  // (notable_authors/imprints/website/about are used on the publisher detail
  // page, not this list), so shipping them here just inflates every load.
  const lite = pubs.map((p) => ({
    id: p.id, slug: p.slug, name: p.name, type: p.type,
    headquarters: p.headquarters, logo_url: p.logo_url,
    description: p.description ? p.description.slice(0, 200) : p.description,
    founded: p.founded,
  }));
  return <PublishersBrowser publications={lite} />;
}
