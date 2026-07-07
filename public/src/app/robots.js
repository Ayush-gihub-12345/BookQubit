const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://bookqubit.com";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/login"] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
