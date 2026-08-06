// page.jsx here is a client component, so it can't export `metadata` itself —
// see the same note in community/layout.jsx.
export const metadata = {
  title: "Request a Book",
  description: "Can't find a book on BookQubit? Request it and we'll add it to the catalog.",
  alternates: { canonical: "/request-a-book" },
};

export default function RequestABookLayout({ children }) {
  return children;
}
