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
  return <AuthorsBrowser authors={authors} />;
}
