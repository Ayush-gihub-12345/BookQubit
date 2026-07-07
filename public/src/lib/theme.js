import { cookies } from "next/headers";

export const THEMES = [
  { id: "light", name: "Light", icon: "☀️" },
  { id: "dark", name: "Dark", icon: "🌙" },
  { id: "sepia", name: "Sepia", icon: "📜" },
  { id: "midnight", name: "Midnight", icon: "🌌" },
  { id: "ocean", name: "Ocean", icon: "🌊" },
  { id: "forest", name: "Forest", icon: "🌲" },
  { id: "rose", name: "Rose", icon: "🌹" },
];

export async function getTheme() {
  const store = await cookies();
  const id = store.get("theme")?.value;
  return THEMES.some((t) => t.id === id) ? id : "light";
}
