// Country → storefront. Pure and unit-testable. Tags come from env vars so each
// marketplace uses its own Associates ID; falls back to AMAZON_ASSOC_TAG.
const STORES = {
  IN: { host: "www.amazon.in", tagVar: "AMAZON_TAG_IN" },
  US: { host: "www.amazon.com", tagVar: "AMAZON_TAG_US" },
  GB: { host: "www.amazon.co.uk", tagVar: "AMAZON_TAG_GB" },
  AE: { host: "www.amazon.ae", tagVar: "AMAZON_TAG_AE" },
  SA: { host: "www.amazon.sa", tagVar: "AMAZON_TAG_SA" },
  DE: { host: "www.amazon.de", tagVar: "AMAZON_TAG_DE" },
  BR: { host: "www.amazon.com.br", tagVar: "AMAZON_TAG_BR" },
  JP: { host: "www.amazon.co.jp", tagVar: "AMAZON_TAG_JP" },
};
const FALLBACK = STORES.US;

export function storeFor(country) {
  return STORES[String(country || "").toUpperCase()] || FALLBACK;
}

/**
 * Build a labelled outbound link. `label` is always shown next to the button.
 * @returns {{ url: string, store: string, label: string } | null}
 */
export function buyLink(env, country, book) {
  const store = storeFor(country);
  const tag = (env && (env[store.tagVar] || env.AMAZON_ASSOC_TAG)) || "";
  let url = null;
  if (book.amazon_asin) {
    url = `https://${store.host}/dp/${encodeURIComponent(book.amazon_asin)}${tag ? `?tag=${encodeURIComponent(tag)}` : ""}`;
  } else if (book.amazon_url) {
    url = book.amazon_url;
  } else if (book.isbn) {
    url = `https://${store.host}/s?k=${encodeURIComponent(book.isbn)}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`;
  }
  return url ? { url, store: store.host, label: tag ? "Affiliate link" : "External provider" } : null;
}

export function audibleLink(country, book) {
  const host = String(country).toUpperCase() === "IN" ? "www.audible.in" : String(country).toUpperCase() === "GB" ? "www.audible.co.uk" : "www.audible.com";
  return { url: `https://${host}/search?keywords=${encodeURIComponent(`${book.title} ${book.author || ""}`.trim())}`, store: host, label: "External provider" };
}

/** Availability badge shown on every book (never claims unlicensed full audio). */
export function availability({ hasFullAudio, hasSummaryAudio, hasSummaryText, hasExternalAudio }) {
  if (hasFullAudio) return "Full Audio Available";
  if (hasSummaryAudio) return "1-Min Summary & Sample";
  if (hasExternalAudio) return "Listen on Audible / External";
  return hasSummaryText ? "Text Summary Only" : "Text Summary Only";
}
