import { NextResponse } from "next/server";
import { LANGUAGES } from "@/lib/languages";

const VALID_CODES = new Set(LANGUAGES.map((l) => l.code));
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// The entire language-routing story lives here. Two branches:
//
// 1. Path already starts with a valid /xx/ segment — pass through, but hand
//    the resolved language to this SAME request's Server Components via a
//    request header (`x-bq-lang`), not just a response cookie. A cookie set
//    here only reaches the *next* request's `cookies()` read — the render
//    that's about to happen for THIS request would still see whatever the
//    browser's old cookie said, showing the wrong language on every first
//    load of a new URL. The header sidesteps that entirely. The cookie is
//    still refreshed too, as a fallback for anything outside this
//    middleware's matcher and to drive the redirect-target choice below.
//
// 2. No valid /xx/ prefix (bare "/", an old pre-migration URL like "/books",
//    or a stray internal link nobody's updated yet) — 301 to the same path
//    under a resolved language: the existing `lang` cookie if it's still
//    valid, else "en". Terminates in exactly one redirect; the target is
//    always prefixed, so there's no loop.
export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // Belt-and-suspenders: the matcher below is meant to exclude these
  // already, but a matcher regex is easy to get subtly wrong (verified
  // live — an earlier version's negative lookahead used "admin/", which
  // requires a trailing slash and so missed the bare "/admin" route
  // itself, redirecting it to "/en/admin"). Checking explicitly here means
  // a matcher mistake degrades to a no-op instead of a wrong redirect.
  if (pathname === "/admin" || pathname.startsWith("/admin/") ||
      pathname === "/api" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const segments = pathname.split("/");
  const first = segments[1];

  if (VALID_CODES.has(first)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-bq-lang", first);
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.cookies.set("lang", first, { path: "/", maxAge: COOKIE_MAX_AGE });
    return res;
  }

  const cookieLang = request.cookies.get("lang")?.value;
  const targetLang = VALID_CODES.has(cookieLang) ? cookieLang : "en";
  const rest = pathname === "/" ? "" : pathname;
  const url = request.nextUrl.clone();
  url.pathname = `/${targetLang}${rest}`;
  url.search = search;
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: [
    "/((?!api(?:/|$)|admin(?:/|$)|_next/|robots.txt|feed.xml|manifest.webmanifest|icon.svg|opengraph-image|.*\\.[^/]+$).*)",
  ],
};
