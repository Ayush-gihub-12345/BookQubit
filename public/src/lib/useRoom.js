"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Live room connection (presence + "new message" nudges) to the room's Durable Object.
 * Fails soft: if sockets are unavailable it stays disconnected and callers keep polling.
 * Returns { readers, connected, notify }.
 */
export function useRoom(roomId, onSignal) {
  const [readers, setReaders] = useState(0);
  const [connected, setConnected] = useState(false);
  const socket = useRef(null);
  const handler = useRef(onSignal);
  handler.current = onSignal;

  useEffect(() => {
    if (!roomId || typeof WebSocket === "undefined") return;
    let closed = false, retry = 0, timer;
    const open = () => {
      const ws = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws/room/${encodeURIComponent(roomId)}`);
      socket.current = ws;
      ws.onopen = () => { retry = 0; setConnected(true); };
      ws.onmessage = (e) => {
        try {
          const m = JSON.parse(e.data);
          if (m.type === "presence") setReaders(m.readers);
          else if (m.type === "new") handler.current?.();
        } catch { /* ignore malformed frames */ }
      };
      ws.onclose = () => {
        setConnected(false);
        if (closed) return;
        // Exponential backoff (1s → 30s) with jitter; polling covers the gap.
        timer = setTimeout(open, Math.min(30000, 1000 * 2 ** retry++) * (0.7 + Math.random() * 0.6));
      };
      ws.onerror = () => ws.close();
    };
    open();
    return () => { closed = true; clearTimeout(timer); socket.current?.close(); setConnected(false); setReaders(0); };
  }, [roomId]);

  const notify = useCallback(() => {
    const ws = socket.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "new" }));
  }, []);

  return { readers, connected, notify };
}
