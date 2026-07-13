export default function manifest() {
  return {
    name: "BookQubit — Discover, Track & Discuss Great Books",
    short_name: "BookQubit",
    description: "A multilingual book-discovery and social-reading platform — shelves, ratings, reviews, discussions, and personalized recommendations.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7fb",
    theme_color: "#4f46e5",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
