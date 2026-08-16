import AuthorsBrowser from "@/components/AuthorsBrowser";
import { listAuthors } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Authors",
  description: "Browse authors on BookQubit — bios, nationality, and every book they've written, with ratings and reader favorites.",
  alternates: { canonical: "/authors" },
};

export default async function AuthorsPage() {
  const authors = await listAuthors(await getLang());
  // Trim to only what AuthorsBrowser actually renders before it's serialized
  // into the page's payload. listAuthors() is shared with getAuthor() (the
  // author detail page), which needs the full row — genres, wikipedia_url,
  // website_url, famous_work — so those fields must stay in the cached
  // function itself and are only stripped here, for this one page. Bio is
  // also truncated: the card only ever shows a 2-line clamp, so shipping the
  // full text (some run to several paragraphs) was pure waste at ~3,500 rows.
  const lite = authors.map((a) => ({
    id: a.id, slug: a.slug, name: a.name, country: a.country,
    birth_year: a.birth_year, image_url: a.image_url,
    bio: a.bio ? a.bio.slice(0, 200) : a.bio,
  }));
  return <AuthorsBrowser authors={lite} />;
}
