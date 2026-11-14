import { redirect } from "next/navigation";
import { getRandomBook } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Surprise me", robots: { index: false } };

// /surprise → a random book in the reader's language (a plain link, so it works from the header, the rail,
// the mobile bar and with JavaScript off). Falls back to the catalog if there is nothing to pick.
export default async function SurprisePage({ params }) {
  const { lang } = await params;
  const book = await getRandomBook(lang).catch(() => null);
  redirect(book?.slug ? `/${lang}/books/${encodeURIComponent(book.slug)}` : `/${lang}/books`);
}
