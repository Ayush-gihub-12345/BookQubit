import ComicsBrowser from "@/components/ComicsBrowser";
import { listComics } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Comics",
  description: "Browse comics and graphic novels on BookQubit — summaries, ratings, and reader favorites across every genre.",
  alternates: { canonical: "/comics" },
};

export default async function ComicsPage() {
  const comics = await listComics(await getLang());
  return <ComicsBrowser comics={comics} />;
}
