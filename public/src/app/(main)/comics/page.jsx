import ComicsBrowser from "@/components/ComicsBrowser";
import { listComics } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = { title: "Comics" };

export default async function ComicsPage() {
  const comics = await listComics(await getLang());
  return <ComicsBrowser comics={comics} />;
}
