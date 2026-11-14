import { cookies } from "next/headers";

// `swatch` is the single source of truth for each theme's preview color in
// the Navbar picker — previously duplicated as a second hardcoded lookup
// object inside Navbar.jsx itself, which meant adding a theme meant
// remembering to update two places (plus the actual CSS in globals.css).
export const THEMES = [
  // "system" follows the device: the server renders light, a tiny inline script in <head> (see layout.jsx)
  // switches to dark before first paint when the OS prefers dark, and keeps following it.
  { id: "system", name: "Match device", icon: "💻", swatch: "linear-gradient(135deg,#f7f3ea 50%,#0f0e0c 50%)", bg: "linear-gradient(135deg,#f7f3ea 50%,#0f0e0c 50%)", surface: "#fffdf8", brand: "#e0ae34", dark: false },
  { id: "light", name: "Paper", icon: "☀️", swatch: "#f7f3ea", bg: "#f7f3ea", surface: "#fffdf8", brand: "#e0ae34", dark: false },
  { id: "dark", name: "Night", icon: "🌙", swatch: "#0f0e0c", bg: "#0f0e0c", surface: "#171510", brand: "#e0ae34", dark: true },
  { id: "sepia", name: "Sepia", icon: "📜", swatch: "#f3e9d7", bg: "#f3e9d7", surface: "#fbf4e6", brand: "#b8823a", dark: false },
  { id: "midnight", name: "Midnight", icon: "🌌", swatch: "#0a0a16", bg: "#0a0a16", surface: "#13132a", brand: "#a78bfa", dark: true },
  { id: "ocean", name: "Ocean", icon: "🌊", swatch: "#eef7f9", bg: "#eef7f9", surface: "#ffffff", brand: "#0aa2c0", dark: false },
  { id: "forest", name: "Forest", icon: "🌲", swatch: "#f1f6ef", bg: "#f1f6ef", surface: "#ffffff", brand: "#2f8f5b", dark: false },
  { id: "rose", name: "Rose", icon: "🌹", swatch: "#fbf1f3", bg: "#fbf1f3", surface: "#ffffff", brand: "#e0446a", dark: false },
  { id: "imperial", name: "Imperial", icon: "👑", swatch: "#0b0a08", bg: "#0b0a08", surface: "#17140f", brand: "#d4af37", dark: true },
];

// Runs inline in <head> before first paint. Only does anything when the reader chose "Match device":
// picks light/dark from the OS and follows later OS changes. Every other theme is already correct
// in the server-rendered HTML.
export const SYSTEM_THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=([^;]+)/);if(!m||m[1]!=="system")return;var q=matchMedia("(prefers-color-scheme: dark)");var a=function(){document.documentElement.dataset.theme=q.matches?"dark":"light"};a();q.addEventListener("change",function(){var c=document.cookie.match(/(?:^|; )theme=([^;]+)/);if(c&&c[1]==="system")a()})}catch(e){}})();`;

export async function getTheme() {
  const store = await cookies();
  const id = store.get("theme")?.value;
  return THEMES.some((t) => t.id === id) || id === "custom" ? id : "light";
}

// A reader's own custom palette (see lib/customTheme.js for the color math)
// is stored the same way — a plain cookie, read server-side so it applies
// with zero flash, same as every preset above. `theme` itself becomes
// "custom" when this is active; this cookie carries the actual colors.
export async function getCustomThemeColors() {
  const store = await cookies();
  const raw = store.get("customTheme")?.value;
  if (!raw) return null;
  try {
    const { decodeCustomTheme } = await import("./customTheme");
    return decodeCustomTheme(raw);
  } catch {
    return null;
  }
}
