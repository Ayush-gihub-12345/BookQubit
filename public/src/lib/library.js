// Pure library helpers (no I/O): CSV parsing, Goodreads mapping, stats maths. Shared by the
// import UI (client) and the API routes (server), and unit-tested in isolation.

/** RFC-4180-style CSV → array of row objects keyed by the header row. Handles quotes, "" escapes, CRLF, embedded newlines. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const s = String(text || "").replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); if (row.length > 1 || row[0] !== "") rows.push(row); }
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

/** Goodreads wraps ISBNs as ="9780735211292". Returns digits (and trailing X) only, or "". */
export function cleanIsbn(v) {
  const s = String(v || "").replace(/[^0-9Xx]/g, "").toUpperCase();
  return s.length === 10 || s.length === 13 ? s : "";
}

/** "Atomic Habits: An Easy & Proven Way… (Habits, #1)" → "atomic habits" for matching. */
export function normalizeTitle(title) {
  return String(title || "")
    .replace(/\s*\([^)]*\)\s*$/, "") // trailing "(Series, #n)"
    .split(/[:—]/)[0] // drop subtitle
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STATUS = { read: "read", "currently-reading": "reading", "to-read": "want" };
const toDate = (d) => {
  const m = String(d || "").match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
};

/** One Goodreads export row → our import shape (or null if unusable). */
export function mapGoodreadsRow(r) {
  const title = (r["Title"] || "").trim();
  if (!title) return null;
  const rating = Number(r["My Rating"]);
  const shelf = (r["Exclusive Shelf"] || "").trim().toLowerCase();
  return {
    title,
    author: (r["Author"] || "").trim(),
    isbn: cleanIsbn(r["ISBN13"]) || cleanIsbn(r["ISBN"]),
    status: STATUS[shelf] || "want",
    rating: rating > 0 && rating <= 5 ? rating : null,
    review: (r["My Review"] || "").trim().slice(0, 4000) || null,
    finishedAt: toDate(r["Date Read"]),
    addedAt: toDate(r["Date Added"]),
    pages: Number(r["Number of Pages"]) > 0 ? Number(r["Number of Pages"]) : null,
  };
}

// ── stats maths ───────────────────────────────────────────────────────────────

export const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

/** Current and longest daily streak from a Set/array of YYYY-MM-DD strings. Current streak survives until end of "today". */
export function streaks(days, today = dayKey(Date.now())) {
  const set = new Set(days);
  const prev = (k) => dayKey(Date.parse(k + "T00:00:00Z") - 86400000);
  let current = 0;
  let k = set.has(today) ? today : prev(today); // reading yesterday still counts; today is "not over"
  while (set.has(k)) { current++; k = prev(k); }
  const sorted = [...set].sort();
  let longest = 0, run = 0, last = null;
  for (const d of sorted) {
    run = last && prev(d) === last ? run + 1 : 1;
    longest = Math.max(longest, run);
    last = d;
  }
  return { current, longest };
}

/** daily_activity rows ({day,pages,audio_seconds,books_finished}) → 12-month arrays for a year. */
export function monthly(rows, year) {
  const pages = Array(12).fill(0), audioMinutes = Array(12).fill(0), books = Array(12).fill(0);
  for (const r of rows) {
    if (!r.day.startsWith(String(year))) continue;
    const m = Number(r.day.slice(5, 7)) - 1;
    pages[m] += r.pages || 0;
    audioMinutes[m] += Math.round((r.audio_seconds || 0) / 60);
    books[m] += r.books_finished || 0;
  }
  return { pages, audioMinutes, books };
}

/** Heatmap: the last `weeks` weeks ending today, Sunday-first columns; level 0-4 by activity. */
export function heatmap(rows, today = dayKey(Date.now()), weeks = 53) {
  const score = new Map(rows.map((r) => [r.day, (r.pages || 0) + Math.round((r.audio_seconds || 0) / 120) + (r.books_finished || 0) * 20]));
  const end = Date.parse(today + "T00:00:00Z");
  const dow = new Date(end).getUTCDay();
  const start = end - ((weeks - 1) * 7 + dow) * 86400000;
  const cells = [];
  for (let i = 0; i < weeks * 7; i++) {
    const t = start + i * 86400000;
    if (t > end) break;
    const day = dayKey(t);
    const s = score.get(day) || 0;
    cells.push({ day, level: s === 0 ? 0 : s < 10 ? 1 : s < 30 ? 2 : s < 60 ? 3 : 4 });
  }
  return cells;
}

/** Yearly goal pace: how many books ahead (+) or behind (-) schedule. */
export function goalPace({ target, finished, now = new Date() }) {
  const year = now.getUTCFullYear();
  const start = Date.UTC(year, 0, 1);
  const total = (Date.UTC(year + 1, 0, 1) - start) / 86400000;
  const elapsed = Math.floor((now.getTime() - start) / 86400000) + 1;
  const expected = (target * elapsed) / total;
  const delta = Math.round(finished - expected);
  return {
    pct: target ? Math.min(100, Math.round((finished / target) * 100)) : 0,
    delta,
    label: delta === 0 ? "On pace" : delta > 0 ? `${delta} book${delta === 1 ? "" : "s"} ahead of schedule` : `${-delta} book${delta === -1 ? "" : "s"} behind schedule`,
  };
}

/** Top-N distribution from a list of strings: [{name, n}], descending. */
export function distribution(values, top = 8) {
  const m = new Map();
  for (const v of values) if (v) m.set(v, (m.get(v) || 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, top).map(([name, n]) => ({ name, n }));
}
