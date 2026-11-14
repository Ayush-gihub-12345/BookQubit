import { optional } from "./env.js";
import { logError } from "./logger.js";

export const MODELS = {
  embed: "@cf/google/embeddinggemma-300m", // 768-dim, multilingual
  llm: "@cf/qwen/qwen3-30b-a3b-fp8",
  ttsEn: "@cf/deepgram/aura-2-en",
};

export const INTENTS = {
  general: "a general reader who wants the core ideas",
  founder: "a startup founder or business operator who wants practical business lessons",
  tech: "a software developer or technical builder who wants engineering-relevant takeaways",
  student: "a student preparing for exams who wants concepts and memorable points",
  action: "someone who wants a short, concrete action plan they can start today",
};

/** @returns {Promise<number[]|null>} 768-dim embedding, or null when AI is unavailable. */
export async function embedText(env, text) {
  const ai = optional(env, "AI");
  if (!ai || !text) return null;
  try {
    const out = await ai.run(MODELS.embed, { text: [String(text).slice(0, 2000)] });
    return (out && out.data && out.data[0]) || null;
  } catch (e) {
    logError("embedText", e);
    return null;
  }
}

/**
 * Structured 1-minute summary for a book from its stored metadata.
 * Returns { thesis, takeaways[], quotes[], script } or null.
 * `script` is the ~150-word narration used for TTS.
 */
export async function generateSummary(env, book, intent = "general") {
  const ai = optional(env, "AI");
  if (!ai) return null;
  const audience = INTENTS[intent] || INTENTS.general;
  const prompt =
    `Write a one-minute summary of the book below for ${audience}. ` +
    `Respond with ONLY JSON: {"thesis": string, "takeaways": string[3-5], "quotes": string[0-2], "script": string (about 150 words, spoken style)}. ` +
    `Use only what the book metadata supports; do not invent quotes. Write in language code "${book.lang || "en"}".\n\n` +
    `Title: ${book.title}\nAuthor: ${book.author || ""}\nDescription: ${(book.description || "").slice(0, 1500)}\n` +
    `Existing summary: ${(book.summary || "").slice(0, 1500)}\nKey points: ${book.key_points || ""}`;
  try {
    const out = await ai.run(MODELS.llm, { messages: [{ role: "user", content: prompt }], max_tokens: 700 });
    const raw = typeof out === "string" ? out : out.response || out.result?.response || "";
    const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const parsed = JSON.parse(json);
    if (!parsed.script || !Array.isArray(parsed.takeaways)) return null;
    return parsed;
  } catch (e) {
    logError("generateSummary", e, { slug: book.slug, intent });
    return null;
  }
}

/** English TTS → Uint8Array (mp3) or null. Other languages fall back to browser speech on the client. */
export async function synthesizeSpeech(env, text) {
  const ai = optional(env, "AI");
  if (!ai || !text) return null;
  try {
    const out = await ai.run(MODELS.ttsEn, { text: String(text).slice(0, 2500), encoding: "mp3" });
    if (out instanceof ReadableStream) return new Uint8Array(await new Response(out).arrayBuffer());
    if (out && out.audio) {
      const bin = atob(out.audio);
      return Uint8Array.from(bin, (c) => c.charCodeAt(0));
    }
    return null;
  } catch (e) {
    logError("synthesizeSpeech", e);
    return null;
  }
}
