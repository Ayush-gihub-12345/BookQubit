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
  return <PublishersBrowser publications={pubs} />;
}
