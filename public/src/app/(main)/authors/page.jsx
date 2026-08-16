import AuthorsBrowser from "@/components/AuthorsBrowser";
import { queryAuthors, getAuthorCountries } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Authors",
  description: "Browse authors on BookQubit — bios, nationality, and every book they've written, with ratings and reader favorites.",
  alternates: { canonical: "/authors" },
};

// Fetches only the first page server-side (queryAuthors/getAuthorCountries
// filter the already-cached full list in-memory, no extra DB reads) —
// AuthorsBrowser fetches every subsequent page/filter/search from
// /api/authors instead of receiving the whole catalog up front. See the
// comment on queryAuthors() in repo.js for why that mattered: shipping the
// full list broke the page's server render outright.
export default async function AuthorsPage() {
  const lang = await getLang();
  const [initial, countries] = await Promise.all([
    queryAuthors(lang, { sort: "name", page: 1, perPage: 60 }),
    getAuthorCountries(lang),
  ]);
  return (
    <AuthorsBrowser
      lang={lang}
      initialAuthors={initial.authors}
      initialHasMore={initial.hasMore}
      countries={countries}
    />
  );
}
