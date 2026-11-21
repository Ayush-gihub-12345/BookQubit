import { cookies } from "next/headers";

// `swatch` is the single source of truth for each theme's preview color in
// the Navbar picker — previously duplicated as a second hardcoded lookup
// object inside Navbar.jsx itself, which meant adding a theme meant
// remembering to update two places (plus the actual CSS in globals.css).
export const THEMES = [
  // "system" follows the device: the server renders light, a tiny inline script in <head> (see layout.jsx)
  // switches to dark before first paint when the OS prefers dark, and keeps following it.
  { id: "system", name: "Match device", icon: "💻", swatch: "linear-gradient(135deg,#f7f3ea 50%,#121110 50%)", bg: "#f7f3ea", surface: "#fffdf8", brand: "#e0ae34", dark: false },
  { id: "light", name: "Paper", icon: "☀️", swatch: "#f7f3ea", bg: "#f7f3ea", surface: "#fffdf8", brand: "#c9951c", dark: false },
  { id: "dark", name: "Night", icon: "🌙", swatch: "#121110", bg: "#121110", surface: "#1a1816", brand: "#d9a935", dark: true },
  { id: "sepia", name: "Sepia", icon: "📜", swatch: "#f3e9d7", bg: "#f3e9d7", surface: "#fbf4e6", brand: "#b8823a", dark: false },
  { id: "midnight", name: "Ink", icon: "🖋️", swatch: "#0e1420", bg: "#0e1420", surface: "#151c2a", brand: "#7ea6d9", dark: true },
  { id: "ocean", name: "Sea", icon: "🌊", swatch: "#eff5f5", bg: "#eff5f5", surface: "#fdfefe", brand: "#2a8a96", dark: false },
  { id: "forest", name: "Moss", icon: "🌿", swatch: "#f1f4ee", bg: "#f1f4ee", surface: "#fdfefb", brand: "#4a7c4e", dark: false },
  { id: "rose", name: "Pink", icon: "🌸", swatch: "#f9f1ef", bg: "#f9f1ef", surface: "#fffdfc", brand: "#b8566b", dark: false },
  { id: "imperial", name: "Leather", icon: "📕", swatch: "#17110d", bg: "#17110d", surface: "#1f1812", brand: "#c9a066", dark: true },
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
