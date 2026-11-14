import { NextResponse } from "next/server";
import { getBook, getSiteSettings } from "@/lib/repo";
import { getCf } from "@/lib/cf/env";
import { buyLink, audibleLink } from "@/lib/cf/geo-affiliate";
import { logEvent } from "@/lib/cf/logger";

// GET /api/go?slug=...&lang=en&kind=buy|audible
// Geo-routed outbound redirect: picks the storefront for the visitor's country
// (request.cf.country), logs the click by country, then 302s. The target is built
// server-side from the book row — never from a query parameter (no open redirect).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const lang = searchParams.get("lang") || "en";
  const kind = searchParams.get("kind") === "audible" ? "audible" : "buy";
  const back = new URL(`/${lang}/books/${encodeURIComponent(slug || "")}`, request.url);
  if (!slug) return NextResponse.redirect(new URL(`/${lang}/books`, request.url), 302);

  const book = await getBook(slug, lang);
  if (!book) return NextResponse.redirect(back, 302);

  const { env, cf } = await getCf();
  const country = (cf && cf.country) || request.headers.get("cf-ipcountry") || "US";
  const { amazon_assoc_tag } = await getSiteSettings();
  const link =
    kind === "audible"
      ? audibleLink(country, book)
      : buyLink({ ...env, AMAZON_ASSOC_TAG: amazon_assoc_tag || env.AMAZON_ASSOC_TAG }, country, book);

  if (!link) return NextResponse.redirect(back, 302);
  logEvent("affiliate_click", { country, store: link.store, kind, slug: book.slug, lang });
  return NextResponse.redirect(link.url, { status: 302, headers: { "Cache-Control": "no-store" } });
}
