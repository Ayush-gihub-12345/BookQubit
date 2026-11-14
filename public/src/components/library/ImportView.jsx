"use client";

import { useRef, useState } from "react";
import { authFetch } from "@/lib/authFetch";
import { parseCsv, mapGoodreadsRow } from "@/lib/library";
import { useLang } from "@/lib/useLang";

const CHUNK = 25;

// Drag-and-drop Goodreads CSV → parsed in the browser → sent in small chunks with live progress.
export default function ImportView() {
  const lang = useLang();
  const input = useRef(null);
  const [drag, setDrag] = useState(false);
  const [state, setState] = useState({ phase: "idle" }); // idle | running | done | error

  async function run(file) {
    if (!file) return;
    let rows;
    try {
      rows = parseCsv(await file.text()).map(mapGoodreadsRow).filter(Boolean);
    } catch {
      return setState({ phase: "error", message: "That file couldn't be read as a CSV." });
    }
    if (!rows.length) return setState({ phase: "error", message: "No books found. Export your library from Goodreads (My Books → Import and export) and upload that CSV." });
    if (rows.length > 10000) return setState({ phase: "error", message: "That file has more than 10,000 books. Split it and import in parts." });

    setState({ phase: "running", done: 0, total: rows.length, matched: 0, unmatched: [] });
    const start = await authFetch("/api/library/import", { method: "POST", body: JSON.stringify({ action: "start", total: rows.length }) });
    if (!start || !start.ok) {
      const unavailable = start && start.status === 503;
      return setState({ phase: "error", message: unavailable ? "Importing isn't available yet on this site." : "Couldn't start the import. Sign in again and retry." });
    }
    const { jobId } = await start.json();

    let done = 0, matched = 0;
    const unmatched = [];
    for (let i = 0; i < rows.length; i += CHUNK) {
      let ok = false;
      for (let attempt = 0; attempt < 3 && !ok; attempt++) {
        const res = await authFetch("/api/library/import", { method: "POST", body: JSON.stringify({ action: "chunk", jobId, rows: rows.slice(i, i + CHUNK) }) });
        if (res && res.ok) {
          const j = await res.json();
          matched += j.matched; done += j.processed; unmatched.push(...j.unmatched); ok = true;
        } else if (res && res.status === 429) {
          return setState({ phase: "error", message: `Slow down — you hit the hourly limit after ${done} books. Come back later and re-upload; books already imported are kept.` });
        } else await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
      }
      if (!ok) return setState({ phase: "error", message: `The import stopped after ${done} books because of a network problem. Re-upload to continue; books already imported are kept.` });
      setState({ phase: "running", done, total: rows.length, matched, unmatched: unmatched.slice(0, 50) });
    }
    await authFetch("/api/library/import", { method: "POST", body: JSON.stringify({ action: "finish", jobId }) });
    setState({ phase: "done", done, total: rows.length, matched, unmatched });
  }

  const pct = state.total ? Math.round((state.done / state.total) * 100) : 0;
  return (
    <div className="max-w-2xl">
      <p className="text-muted text-sm">Bring your shelves, ratings and read dates from Goodreads. Books already on your shelves are never overwritten.</p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); run(e.dataTransfer.files?.[0]); }}
        className={`mt-4 rounded-2xl border-2 border-dashed p-10 text-center transition ${drag ? "border-brand-600 bg-brand-50" : "border-line"}`}
      >
        <p className="font-editorial text-lg">Drop your Goodreads CSV here</p>
        <button type="button" onClick={() => input.current?.click()} disabled={state.phase === "running"} className="btn-primary mt-4 disabled:opacity-50">Choose file</button>
        <input ref={input} type="file" accept=".csv,text/csv" className="sr-only" aria-label="Goodreads CSV file" onChange={(e) => run(e.target.files?.[0])} />
      </div>

      {state.phase === "running" && (
        <div className="mt-5" role="status" aria-live="polite">
          <div className="bg-line h-2 overflow-hidden rounded-full"><div className="bg-brand-600 h-full transition-[width]" style={{ width: `${pct}%` }} /></div>
          <p className="text-muted mt-2 text-sm">Importing… {state.done} of {state.total} books · {state.matched} matched</p>
        </div>
      )}
      {state.phase === "error" && <p role="alert" className="mt-5 text-sm text-red-600">{state.message}</p>}
      {state.phase === "done" && (
        <div className="mt-5" role="status">
          <p className="font-editorial text-lg">Imported {state.matched} of {state.total} books.</p>
          {state.unmatched.length > 0 && (
            <details className="mt-2 text-sm">
              <summary className="text-muted cursor-pointer">{state.unmatched.length} not found in the BookQubit catalog</summary>
              <ul className="text-muted mt-2 list-disc ps-5">{state.unmatched.slice(0, 100).map((t, i) => <li key={i}>{t}</li>)}</ul>
              <a href={`/${lang}/request-a-book`} className="text-brand-700 mt-2 inline-block underline">Request missing books</a>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
