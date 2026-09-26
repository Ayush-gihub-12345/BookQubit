import { notFound } from "next/navigation";
import { LANGUAGES } from "@/lib/lang";

// Middleware is the actual authority on which `[lang]` values ever reach
// this point (invalid/unprefixed paths get redirected before rendering) —
// this check is cheap insurance for any request that somehow bypasses it
// (e.g. a prerender/build-time path), not the primary validation.
export function generateStaticParams() {
  return LANGUAGES.map((l) => ({ lang: l.code }));
}

export default async function LangLayout({ children, params }) {
  const { lang } = await params;
  if (!LANGUAGES.some((l) => l.code === lang)) notFound();
  return children;
}
