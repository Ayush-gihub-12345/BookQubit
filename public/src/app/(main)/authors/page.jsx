import AuthorsBrowser from "@/components/AuthorsBrowser";
import { listAuthors } from "@/lib/repo";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const metadata = { title: "Authors" };

export default async function AuthorsPage() {
  const authors = await listAuthors(await getLang());
  return <AuthorsBrowser authors={authors} />;
}
