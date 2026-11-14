// WebSocket gateway for live reading rooms (presence + "new message" nudges). Called from
// worker-entry.js BEFORE the Next app, because Next route handlers can't upgrade connections.
// Pure given (request, env): unit-tested with fakes.

const ROOM_ID = /^[a-zA-Z0-9:_-]{1,80}$/;

/** @returns {Response|null} a response if the request is a room request, else null (let Next handle it). */
export function routeRoom(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/ws/room/")) return null;

  if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected a WebSocket upgrade", { status: 426 });

  // Same-origin only: a page on another site must not be able to open sockets with a visitor's cookies.
  const origin = request.headers.get("Origin");
  if (origin) {
    let host = "";
    try { host = new URL(origin).host; } catch { /* malformed */ }
    if (host !== url.host) return new Response("Forbidden", { status: 403 });
  }

  let id = "";
  try { id = decodeURIComponent(url.pathname.slice("/ws/room/".length)); } catch { return new Response("Bad room id", { status: 400 }); }
  if (!ROOM_ID.test(id)) return new Response("Bad room id", { status: 400 });
  if (!env.READING_ROOM_DO) return new Response("Live rooms unavailable", { status: 503 });

  const stub = env.READING_ROOM_DO.get(env.READING_ROOM_DO.idFromName(id));
  return stub.fetch(request);
}
