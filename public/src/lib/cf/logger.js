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
