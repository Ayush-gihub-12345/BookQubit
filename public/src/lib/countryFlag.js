// Country name (as stored in the catalog) -> flag emoji. Unknown names get no flag rather than a wrong one.
const ISO = {
  "united states": "US", "usa": "US", "united kingdom": "GB", "uk": "GB", "england": "GB", "scotland": "GB", "wales": "GB",
  "canada": "CA", "australia": "AU", "new zealand": "NZ", "ireland": "IE", "india": "IN", "pakistan": "PK", "bangladesh": "BD",
  "sri lanka": "LK", "nepal": "NP", "china": "CN", "japan": "JP", "south korea": "KR", "korea": "KR", "russia": "RU",
  "france": "FR", "germany": "DE", "italy": "IT", "spain": "ES", "portugal": "PT", "netherlands": "NL", "belgium": "BE",
  "switzerland": "CH", "austria": "AT", "sweden": "SE", "norway": "NO", "denmark": "DK", "finland": "FI", "iceland": "IS",
  "poland": "PL", "czech republic": "CZ", "czechia": "CZ", "hungary": "HU", "romania": "RO", "greece": "GR", "turkey": "TR",
  "ukraine": "UA", "egypt": "EG", "nigeria": "NG", "south africa": "ZA", "kenya": "KE", "ethiopia": "ET", "morocco": "MA",
  "saudi arabia": "SA", "united arab emirates": "AE", "uae": "AE", "iran": "IR", "iraq": "IQ", "israel": "IL", "lebanon": "LB",
  "brazil": "BR", "argentina": "AR", "chile": "CL", "colombia": "CO", "mexico": "MX", "peru": "PE", "cuba": "CU",
  "indonesia": "ID", "philippines": "PH", "vietnam": "VN", "thailand": "TH", "malaysia": "MY", "singapore": "SG",
};

/** "India" -> "🇮🇳"; "" when the country isn't recognised. */
export function countryFlag(name) {
  const code = ISO[String(name || "").trim().toLowerCase()];
  if (!code) return "";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}
