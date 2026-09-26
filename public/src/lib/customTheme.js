// Turns the 3 colors a reader actually picks (background, text, accent) into
// the full 12-variable palette every theme needs (see globals.css's
// [data-theme="X"] blocks) — nobody wants to hand-pick 12 colors and get the
// contrast wrong, so the extra 9 are derived with simple, dependency-free
// hex math. Isomorphic on purpose (no "use client"/next/headers import):
// the picker calls deriveFullPalette() in the browser for a live preview,
// and lib/theme.js's getCustomThemeColors() calls decodeCustomTheme() on the
// server when rendering — same module, no duplicated color logic.

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const v = parseInt(n, 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

function rgbToHex({ r, g, b }) {
  const c = (x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

// Same idea as CSS color-mix(in srgb, a p%, b) — linear blend in sRGB, which
// is plenty good for deriving UI tints/shades (no need for perceptual color
// spaces here).
function mix(hexA, hexB, weightAPercent) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  const w = weightAPercent / 100;
  return rgbToHex({ r: a.r * w + b.r * (1 - w), g: a.g * w + b.g * (1 - w), b: a.b * w + b.b * (1 - w) });
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

const CUSTOM_KEYS = [
  "bg", "surface", "fg", "muted", "line", "pillBg", "pillFg",
  "brand50", "brand100", "brand500", "brand600", "brand700", "pillHoverBrightness",
];

// `bg`/`fg`/`accent` are what the reader actually picks in the color-picker
// modal; everything else is derived so the result always has usable
// contrast regardless of whether they picked a light or dark background.
export function deriveFullPalette({ bg, fg, accent }) {
  const isDark = relativeLuminance(bg) < 0.5;
  return {
    bg,
    fg,
    // Surface (card background) sits a little closer to `fg` than `bg`
    // does, so cards visibly lift off the page — same intent as the
    // hand-authored themes' own bg/surface pairs.
    surface: mix(fg, bg, isDark ? 8 : 4),
    // Secondary text: roughly halfway between fg and bg.
    muted: mix(fg, bg, isDark ? 45 : 55),
    // Borders: subtle, mostly bg with a touch of fg mixed in.
    line: mix(fg, bg, isDark ? 18 : 10),
    // Chips/pills: accent tinted heavily toward the page background so it
    // reads as a soft badge, not a solid block.
    pillBg: mix(accent, bg, isDark ? 30 : 15),
    pillFg: mix(accent, fg, 70),
    // Brand scale: 50/100 are light tints (mixed toward white so they work
    // as hover backgrounds even on a dark custom theme, matching how the
    // built-in dark/midnight themes handle it), 500 is the accent as
    // picked, 600/700 step darker for buttons/hover states.
    brand50: mix(accent, isDark ? bg : "#ffffff", isDark ? 35 : 12),
    brand100: mix(accent, isDark ? bg : "#ffffff", isDark ? 55 : 25),
    brand500: accent,
    brand600: mix(accent, "#000000", 88),
    brand700: mix(accent, "#000000", 76),
    // brand-50/100 read as barely-there hover backgrounds on a dark surface
    // at the light themes' 1.06 brightness bump — see globals.css's
    // --pill-hover-brightness comment for why this is a variable at all.
    pillHoverBrightness: isDark ? "1.25" : "1.06",
  };
}

// Maps the derived palette's camelCase keys to the exact CSS custom
// property names globals.css expects, for building an inline `style` object
// on <html> (see app/layout.jsx).
export function paletteToCssVars(palette) {
  return {
    "--bg": palette.bg,
    "--surface": palette.surface,
    "--fg": palette.fg,
    "--muted": palette.muted,
    "--line": palette.line,
    "--pill-bg": palette.pillBg,
    "--pill-fg": palette.pillFg,
    "--color-brand-50": palette.brand50,
    "--color-brand-100": palette.brand100,
    "--color-brand-500": palette.brand500,
    "--color-brand-600": palette.brand600,
    "--color-brand-700": palette.brand700,
    "--pill-hover-brightness": palette.pillHoverBrightness,
  };
}

export function encodeCustomTheme(palette) {
  // Fixed key order, values only — shorter than JSON-with-keys and still
  // trivial to decode back into the named palette a cookie value needs to
  // survive round-tripping through encodeURIComponent unscathed.
  return encodeURIComponent(CUSTOM_KEYS.map((k) => palette[k] || "").join(","));
}

export function decodeCustomTheme(raw) {
  const parts = decodeURIComponent(raw).split(",");
  if (parts.length !== CUSTOM_KEYS.length) return null;
  const palette = {};
  CUSTOM_KEYS.forEach((k, i) => { palette[k] = parts[i]; });
  if (!/^#[0-9a-f]{6}$/i.test(palette.bg)) return null;
  return palette;
}
