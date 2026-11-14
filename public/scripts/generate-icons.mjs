// Generates PWA PNG icons from src/app/icon.svg's book glyph. Run: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const BOOK =
  "M32 16.5c-5.8-4.6-13.2-6.5-20-6.5-1.1 0-2 .9-2 2v33c0 1.1.9 2 2 2 6.8 0 14.2 1.9 18.6 6 .8.7 2 .7 2.8 0 4.4-4.1 11.8-6 18.6-6 1.1 0 2-.9 2-2V12c0-1.1-.9-2-2-2-6.8 0-14.2 1.9-20 6.5z";
const PAGES =
  "M29.5 21.8c-4.2-3.1-9.6-4.5-14.5-4.7v27.4c4.9.3 10.1 1.6 14.5 4.3V21.8zM34.5 21.8v27c4.4-2.7 9.6-4 14.5-4.3V17.1c-4.9.2-10.3 1.6-14.5 4.7z";

// `scale` shrinks the glyph so maskable icons keep it inside the 80% safe zone.
const svg = ({ rx, scale }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${rx}" fill="#1f4d3b"/>
  <g transform="translate(32 32) scale(${scale}) translate(-32 -32)"><path fill="#fff" d="${BOOK}"/><path fill="#1f4d3b" d="${PAGES}"/></g>
</svg>`;

await mkdir("public/icons", { recursive: true });
const jobs = [
  ["icon-192.png", 192, { rx: 14, scale: 0.9 }],
  ["icon-512.png", 512, { rx: 14, scale: 0.9 }],
  ["maskable-512.png", 512, { rx: 0, scale: 0.62 }],
  ["apple-touch-icon.png", 180, { rx: 0, scale: 0.8 }],
];
for (const [name, size, opts] of jobs) {
  await sharp(Buffer.from(svg(opts)), { density: 384 }).resize(size, size).png().toFile(`public/icons/${name}`);
  console.log("wrote", name);
}
