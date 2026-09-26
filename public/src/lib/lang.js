import { cookies, headers } from "next/headers";

export { LANGUAGES, RTL } from "./languages";
import { LANGUAGES } from "./languages";

// middleware.js resolves the language from the URL's /xx/ segment and hands
// it to this same request via the `x-bq-lang` header — reading the header
// (not just the cookie it also sets) matters because a middleware-set cookie
// only becomes visible on the *next* request; without this, the very
// request that changed language would still render with the old cookie
// value. The cookie stays as a fallback for anything that calls getLang()
// outside middleware's matcher.
export async function getLang() {
  const h = await headers();
  const fromHeader = h.get("x-bq-lang");
  if (LANGUAGES.some((l) => l.code === fromHeader)) return fromHeader;
  const store = await cookies();
  const code = store.get("lang")?.value;
  return LANGUAGES.some((l) => l.code === code) ? code : "en";
}
