// page.jsx here is a client component (useSearchParams, live chat state), so
// it can't export `metadata` itself — Next.js only allows that from a Server
// Component. This layout supplies it instead; the page rendered as
// `{children}` stays untouched.
export const metadata = {
  title: "Community",
  description: "Join discussions with fellow readers on BookQubit, book by book — sign in to chat, ask questions, and share what you're reading.",
  alternates: { canonical: "/community" },
};

export default function CommunityLayout({ children }) {
  return children;
}
