import { cookies } from "next/headers";

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी" },
  { code: "ur", name: "اردو" },
  { code: "ar", name: "العربية" },
  { code: "bn", name: "বাংলা" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
  { code: "ru", name: "Русский" },
  { code: "ta", name: "தமிழ்" },
];

export const RTL = ["ur", "ar", "fa", "ps"];

export async function getLang() {
  const store = await cookies();
  const code = store.get("lang")?.value;
  return LANGUAGES.some((l) => l.code === code) ? code : "en";
}
