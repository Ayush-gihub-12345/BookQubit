"use client";

// Client-side theme switching, shared by the header popover and the command palette.
// The theme lives in a cookie (read on the server, so there is no flash on the next load). "Match device" is also
// applied right away, because the server renders light and only the inline script in <head> fixes it on reload.
export const THEME_CHOICES = [
  { id: "system", name: "Match device" },
  { id: "light", name: "Paper" },
  { id: "dark", name: "Night" },
  { id: "sepia", name: "Sepia" },
  { id: "midnight", name: "Ink" },
  { id: "ocean", name: "Sea" },
  { id: "forest", name: "Moss" },
  { id: "rose", name: "Pink" },
  { id: "imperial", name: "Leather" },
];

export function applyTheme(id, router) {
  document.cookie = `theme=${id};path=/;max-age=31536000`;
  document.documentElement.dataset.theme =
    id === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : id;
  router?.refresh();
}
