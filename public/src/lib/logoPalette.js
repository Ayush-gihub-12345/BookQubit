// Logo colour directions from the v2 logo pack. Aurora (violet to pink) is the recommended default and is what the
// favicon, app icons and social image use. The header logo follows the active theme so it never clashes with it.
export const LOGO_PALETTES = {
  aurora: { stops: ["#5B5BFF", "#9B4DFF", "#FF5E9C"], accent: "#FFD166" },
  lagoon: { stops: ["#00C9A7", "#1E88E5", "#4F46E5"], accent: "#FFE066" },
  sunset: { stops: ["#FF8A4C", "#FF4D7D", "#7C4DFF"], accent: "#FFF1B8" },
};
export const DEFAULT_LOGO_PALETTE = "aurora";

// Cool themes get Lagoon, warm ones Sunset; light, dark, midnight, custom and "match device" keep Aurora.
const BY_THEME = { ocean: "lagoon", forest: "lagoon", rose: "sunset", sepia: "sunset", imperial: "sunset" };
export const logoPaletteFor = (themeId) => BY_THEME[themeId] || DEFAULT_LOGO_PALETTE;
