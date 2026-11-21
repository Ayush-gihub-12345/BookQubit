import { getTheme, THEMES } from "@/lib/theme";

// The installed app's colours (status bar, the bar under the content, the splash screen) follow the reader's theme so
// they match the page instead of showing a fixed brand colour. Read per request from the theme cookie; Chrome re-reads
// the manifest about once a day for an installed app, so a theme change reaches an installed app on its next refresh.
export default async function manifest() {
  const id = await getTheme().catch(() => "light");
  const bg = id === "system" || id === "custom" ? "#f7f3ea" : THEMES.find((t) => t.id === id)?.bg || "#f7f3ea";
  return {
    name: "BookQubit — Discover, Listen & Think with Great Books",
    short_name: "BookQubit",
    description: "1-minute book summaries, a personal reading library, and a knowledge graph for readers — in 21 languages.",
    id: "/",
    start_url: "/en",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: bg,
    theme_color: bg,
    categories: ["books", "education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
