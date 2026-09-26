import { cookies } from "next/headers";

// `swatch` is the single source of truth for each theme's preview color in
// the Navbar picker — previously duplicated as a second hardcoded lookup
// object inside Navbar.jsx itself, which meant adding a theme meant
// remembering to update two places (plus the actual CSS in globals.css).
export const THEMES = [
  { id: "light", name: "Light", icon: "☀️", swatch: "#ffffff" },
  { id: "dark", name: "Dark", icon: "🌙", swatch: "#0b1220" },
  { id: "sepia", name: "Sepia", icon: "📜", swatch: "#b07d2f" },
  { id: "midnight", name: "Midnight", icon: "🌌", swatch: "#7c3aed" },
  { id: "ocean", name: "Ocean", icon: "🌊", swatch: "#0891b2" },
  { id: "forest", name: "Forest", icon: "🌲", swatch: "#059669" },
  { id: "rose", name: "Rose", icon: "🌹", swatch: "#e11d48" },
  { id: "imperial", name: "Imperial", icon: "👑", swatch: "#d4af37" },
];

export async function getTheme() {
  const store = await cookies();
  const id = store.get("theme")?.value;
  return THEMES.some((t) => t.id === id) ? id : "light";
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
