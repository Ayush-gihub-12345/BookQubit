import { getLang } from "@/lib/lang";

// page.jsx here is a client component, so it can't export `metadata` itself —
// see the same note in community/layout.jsx.
export async function generateMetadata() {
  const lang = await getLang();
  return {
    title: "Request a Book",
    description: "Can't find a book on BookQubit? Request it and we'll add it to the catalog.",
    alternates: { canonical: `/${lang}/request-a-book` },
  };
}

export default function RequestABookLayout({ children }) {
  return children;
}
