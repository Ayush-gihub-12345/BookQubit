import PublishersBrowser from "@/components/PublishersBrowser";
import { listPublications } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = { title: "Publishers" };

export default async function PublicationsPage() {
  const pubs = await listPublications(await getLang());
  return <PublishersBrowser publications={pubs} />;
}
