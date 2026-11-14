"use client";

// Fire-and-forget client event → /api/log (structured Workers Logs).
export function logClient(event, fields = {}) {
  try {
    const body = JSON.stringify({ event, ...fields });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/log", new Blob([body], { type: "application/json" }));
    else fetch("/api/log", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
  } catch { /* never block UI on telemetry */ }
}
