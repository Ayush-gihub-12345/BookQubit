/**
 * Structured JSON logs (picked up by Workers Logs). Event names in use:
 * search, search_zero, audio_play, audio_complete, affiliate_click,
 * ai_cache (hit|miss), job, error.
 */
export function logEvent(event, fields = {}) {
  try {
    console.log(JSON.stringify({ event, ts: Date.now(), ...fields }));
  } catch {
    /* logging must never break a request */
  }
}

export function logError(where, err, fields = {}) {
  logEvent("error", { where, message: String((err && err.message) || err), ...fields });
}

/**
 * Aggregate analytics via Workers Analytics Engine (optional `ANALYTICS` binding).
 * Cheap, high-cardinality, and kept OUT of D1 so counting clicks/plays costs zero database
 * writes. Layout: index1 = event, blob1 = event, blob2 = country/lang, blob3 = subject
 * (slug/query), double1 = value (default 1). No-op when the binding is absent.
 */
export function track(env, event, { country = "", subject = "", value = 1 } = {}) {
  try {
    env?.ANALYTICS?.writeDataPoint({
      indexes: [event],
      blobs: [event, String(country).slice(0, 8), String(subject).slice(0, 120)],
      doubles: [value],
    });
  } catch {
    /* analytics must never break a request */
  }
}
