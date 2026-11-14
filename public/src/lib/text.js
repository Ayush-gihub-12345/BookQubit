// Shared (server + client) text helpers.

/** Split into sentences, keeping terminal punctuation. Handles Latin, Devanagari danda (।) and Urdu/Arabic (۔ ؟). */
export function splitSentences(text) {
  if (!text) return [];
  return String(text)
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?।۔؟])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** BCP-47 tag for speech synthesis from our 2-letter UI codes. */
const SPEECH_TAGS = {
  en: "en-US", hi: "hi-IN", bn: "bn-IN", te: "te-IN", mr: "mr-IN", ta: "ta-IN", gu: "gu-IN", kn: "kn-IN",
  ml: "ml-IN", pa: "pa-IN", ur: "ur-PK", es: "es-ES", fr: "fr-FR", de: "de-DE", pt: "pt-BR", it: "it-IT",
  ru: "ru-RU", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR", ar: "ar-SA",
};
export const speechTag = (lang) => SPEECH_TAGS[lang] || lang || "en-US";
