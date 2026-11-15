// Approximate country centres [latitude, longitude] for the world map. Names match how the catalog stores countries
// (lower-cased). An unknown country is simply not plotted; it still appears in the list beside the map.
const LL = {
  "united states": [39, -98], usa: [39, -98], "united kingdom": [54, -2], uk: [54, -2], england: [52.5, -1.5], scotland: [56.5, -4], wales: [52.3, -3.7],
  canada: [56, -106], australia: [-25, 134], "new zealand": [-41, 174], ireland: [53, -8], india: [22, 79], pakistan: [30, 69], bangladesh: [24, 90],
  "sri lanka": [7.8, 80.7], nepal: [28.3, 84], china: [35, 103], japan: [36, 138], "south korea": [36.5, 128], korea: [36.5, 128], russia: [61, 100],
  france: [46.5, 2.5], germany: [51, 10], italy: [42.8, 12.5], spain: [40, -3.7], portugal: [39.5, -8], netherlands: [52.2, 5.3], belgium: [50.6, 4.6],
  switzerland: [46.8, 8.2], austria: [47.5, 14.5], sweden: [62, 15], norway: [61, 9], denmark: [56, 10], finland: [64, 26], iceland: [65, -18],
  poland: [52, 19], "czech republic": [49.8, 15.5], czechia: [49.8, 15.5], hungary: [47, 19.5], romania: [46, 25], greece: [39, 22], turkey: [39, 35],
  ukraine: [49, 32], egypt: [26, 30], nigeria: [9, 8], "south africa": [-29, 24], kenya: [0.5, 38], ethiopia: [9, 40], morocco: [32, -6],
  "saudi arabia": [24, 45], "united arab emirates": [24, 54], uae: [24, 54], iran: [32, 53], iraq: [33, 44], israel: [31, 35], lebanon: [33.9, 35.9],
  brazil: [-10, -52], argentina: [-34, -64], chile: [-33, -71], colombia: [4, -73], mexico: [23, -102], peru: [-9, -75], cuba: [21.5, -79],
  indonesia: [-2, 118], philippines: [12, 122], vietnam: [16, 107], thailand: [15, 101], malaysia: [4, 109], singapore: [1.35, 103.8],
};
export const countryLatLon = (name) => LL[String(name || "").trim().toLowerCase()] || null;
