/**
 * ReadingRoom Durable Object — one instance per book (or club) id.
 *  - GET  /presence           → { readers: n }
 *  - GET  /ws  (Upgrade)      → live presence + chat broadcast
 *  - POST /checkpoint         → debounced audio checkpoint (flushed to D1 every 30s)
 * Uses WebSocket Hibernation so idle rooms cost nothing.
 */
import { DurableObject } from "cloudflare:workers";

export class ReadingRoom extends DurableObject {
  // `this.ctx` / `this.env` come from the DurableObject base class.
  get state() {
    return this.ctx;
  }

  count() {
    return this.state.getWebSockets().length;
  }

  broadcast(obj, except) {
    const msg = JSON.stringify(obj);
    for (const ws of this.state.getWebSockets()) {
      if (ws !== except) {
        try { ws.send(msg); } catch { /* socket gone */ }
      }
    }
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.endsWith("/presence")) {
      return Response.json({ readers: this.count() });
    }

    if (url.pathname.endsWith("/checkpoint") && request.method === "POST") {
      const cp = await request.json();
      await this.state.storage.put(`cp:${cp.userId}:${cp.bookSlug}`, cp);
      if (!(await this.state.storage.getAlarm())) await this.state.storage.setAlarm(Date.now() + 30_000);
      return Response.json({ ok: true });
    }

    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      this.state.acceptWebSocket(pair[1]);
      this.broadcast({ type: "presence", readers: this.count() });
      return new Response(null, { status: 101, webSocket: pair[0] });
    }
    return new Response("Not found", { status: 404 });
  }

  async webSocketMessage(ws, data) {
    let m;
    try { m = JSON.parse(data); } catch { return; }
    if (m.type === "chat" && typeof m.text === "string") {
      this.broadcast({ type: "chat", text: m.text.slice(0, 500), name: String(m.name || "Reader").slice(0, 40), at: Date.now() });
    }
  }

  async webSocketClose() {
    this.broadcast({ type: "presence", readers: Math.max(0, this.count() - 1) });
  }

  // Flush buffered checkpoints to D1 (≤ 1 write per user/book per 30s window).
  async alarm() {
    const db = this.env.ENGAGEMENT_DB;
    const all = await this.state.storage.list({ prefix: "cp:" });
    if (db) {
      for (const [key, cp] of all) {
        await db
          .prepare(
            `INSERT INTO audio_checkpoints (user_id, book_slug, kind, position_seconds, speed, updated_at)
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(user_id, book_slug, kind) DO UPDATE SET position_seconds = excluded.position_seconds, speed = excluded.speed, updated_at = CURRENT_TIMESTAMP`
          )
          .bind(cp.userId, cp.bookSlug, cp.kind || "summary", Number(cp.position) || 0, cp.speed ?? null)
          .run();
        await this.state.storage.delete(key);
      }
    }
  }
}
