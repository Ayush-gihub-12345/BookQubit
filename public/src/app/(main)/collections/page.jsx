import CollectionsBrowser from "@/components/CollectionsBrowser";
import { facets } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const f = await facets(await getLang());
  return <CollectionsBrowser collections={f.collections} />;
}
