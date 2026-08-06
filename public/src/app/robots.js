const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://bookqubit.shop";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/login", "/admin", "/liked"] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
