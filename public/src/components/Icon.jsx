// Single consistent icon set (lucide-style strokes). Usage: <Icon name="book" size={16} />
const PATHS = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5M9 21v-6h6v6",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15A2.5 2.5 0 0 0 6.5 22H20v-2.5",
  bookOpen: "M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z",
  layers: "m12 2 10 6-10 6L2 8zM2 14l10 6 10-6",
  feather: "M20.2 3.8a4.5 4.5 0 0 0-6.4 0L4 13.6V20h6.4l9.8-9.8a4.5 4.5 0 0 0 0-6.4zM14 6l4 4M4 20 13 11",
  building: "M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M9 21v-4h6v4M9 7h1m4 0h1M9 11h1m4 0h1",
  zap: "M13 2 4 14h6l-1 8 9-12h-6z",
  trophy: "M8 21h8m-4-4v4m-6-17h12v5a6 6 0 0 1-12 0zM6 6H3v2a4 4 0 0 0 3 3.87M18 6h3v2a4 4 0 0 1-3 3.87",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2-4.35-4.35",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z",
  palette: "M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3 3h-2a2 2 0 0 0-2 2c0 1 .5 1.5.5 2.5S13.5 21 12 21zM7.5 10.5h.01M12 7h.01m4.49 3.5h.01",
  menu: "M4 6h16M4 12h16M4 18h16",
  x: "M18 6 6 18M6 6l12 12",
  star: "m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z",
  flame: "M12 22c4 0 7-2.7 7-7 0-3-2-5.5-3.5-7C15 10 13 10 13 7c0-2-.5-4-3-5 .5 3-1 4.5-2.5 6.5C6 10.5 5 12.5 5 15c0 4.3 3 7 7 7z",
  heart: "M19 14c1.5-1.5 2-3 2-4.5A4.5 4.5 0 0 0 16.5 5c-1.7 0-3.2.8-4.5 2.5C10.7 5.8 9.2 5 7.5 5A4.5 4.5 0 0 0 3 9.5c0 1.5.5 3 2 4.5l7 7z",
  bookmark: "M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
  check: "M20 6 9 17l-5-5",
  user: "M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  barChart: "M3 3v18h18M8 17V9m4 8V5m4 12v-6",
  calendar: "M8 2v4m8-4v4M3 8h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-14v5l3 3",
  trendingUp: "m22 7-8.5 8.5-5-5L2 17M16 7h6v6",
  hash: "M4 9h16M4 15h16M10 3 8 21M16 3l-2 18",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9",
  chevronDown: "m6 9 6 6 6-6",
  cart: "M2 3h2l2.5 12.5a2 2 0 0 0 2 1.5h8.7a2 2 0 0 0 2-1.5L21 7H5.1M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  headphones: "M3 18v-6a9 9 0 0 1 18 0v6m-2 3a2 2 0 0 1-2-2v-4a2 2 0 0 1 4 0v4a2 2 0 0 1-2 2zm-14 0a2 2 0 0 0 2-2v-4a2 2 0 0 0-4 0v4a2 2 0 0 0 2 2z",
  users: "M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M15.5 3.13a4 4 0 0 1 0 7.75",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm3.8-12.8-2 5.6-5.6 2 2-5.6z",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  share: "M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4m4-4v13",
  shieldCheck: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zm-3-10 2 2 4-4",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9m-4.3 13a2 2 0 0 1-3.4 0",
  eyeOff: "M17.94 17.94A10 10 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22",
  arrowRight: "M5 12h14m-7-7 7 7-7 7",
  award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm-3.5-1.5L7 22l5-3 5 3-1.5-8.5",
};

export default function Icon({ name, size = 16, className = "", strokeWidth = 2, filled = false }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block shrink-0 ${className}`} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
