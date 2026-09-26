import ComicsBrowser from "@/components/ComicsBrowser";
import { listComics } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const lang = await getLang();
  return {
    title: "Comics",
    description: "Browse comics and graphic novels on BookQubit — summaries, ratings, and reader favorites across every genre.",
    alternates: { canonical: `/${lang}/comics` },
  };
}

export default async function ComicsPage() {
  const lang = await getLang();
  const comics = await listComics(lang);
  return <ComicsBrowser comics={comics} lang={lang} />;
}
