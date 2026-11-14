"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "../Icon";
import SaveOfflineButton from "../SaveOfflineButton";
import Translated from "../Translated";
import { usePlayer, hasVoiceFor } from "./PlayerProvider";
import { splitSentences } from "@/lib/text";

const INTENTS = [
  ["general", "General"],
  ["founder", "Founder"],
  ["tech", "Builder"],
  ["student", "Student"],
  ["action", "Action plan"],
];
const DEPTHS = [
  ["minute", "1-minute"],
  ["ideas", "Key ideas"],
  ["full", "Full summary"],
];

// Blinkist/Shortform-style reader: Read | Listen switch, audience angle tabs, layered depth.
// `initial` is the server-rendered summary (always present — baseline needs no AI), so the page
// is complete before any client fetch and nothing here can leave it empty.
export default function SummaryReader({ book, initial, initialAudioUrl, fullText }) {
  const player = usePlayer();
  const [intent, setIntent] = useState("general");
  const [depth, setDepth] = useState("minute");
  const [data, setData] = useState({ summary: initial, audioUrl: initialAudioUrl || null, unavailable: null });
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState(null); // null = unknown yet
  const cache = useRef({ general: { summary: initial, audioUrl: initialAudioUrl || null } });
  const abort = useRef(null);

  // Is there any way to speak this? (audio file, or an installed browser voice)
  useEffect(() => {
    if (data.audioUrl) { setVoice(true); return; }
    const check = () => setVoice(hasVoiceFor(book.lang));
    check();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.addEventListener?.("voiceschanged", check);
      return () => window.speechSynthesis.removeEventListener?.("voiceschanged", check);
    }
  }, [data.audioUrl, book.lang]);

  async function pick(next) {
    setIntent(next);
    if (cache.current[next]) { setData({ ...cache.current[next], unavailable: null }); return; }
    abort.current?.abort();
    const ctl = (abort.current = new AbortController());
    setLoading(true);
    try {
      const r = await fetch(`/api/summary?slug=${encodeURIComponent(book.slug)}&lang=${book.lang}&intent=${next}`, { signal: ctl.signal });
      const j = await r.json();
      if (!r.ok) throw new Error("bad");
      const entry = { summary: j.summary, audioUrl: j.audioUrl, unavailable: j.unavailable || null };
      if (!j.unavailable) cache.current[next] = entry;
      setData(entry);
    } catch (e) {
      if (e.name !== "AbortError") setData((d) => ({ ...d, unavailable: "network" }));
    } finally {
      if (abort.current === ctl) setLoading(false);
    }
  }

  const { summary } = data;
  const trackId = `${book.slug}:${book.lang}:${intent}`;
  const active = player?.track?.id === trackId;
  const sentences = useMemo(() => splitSentences(summary.script), [summary.script]);
  // Summaries built from stored data narrate their own thesis as the first sentence; showing it again as a
  // large pull-quote right above would just repeat it.
  const thesisInScript = sentences.includes((summary.thesis || "").trim());

  function listen() {
    if (!player) return;
    if (active) { player.toggle(); return; }
    player.load({
      id: trackId, slug: book.slug, lang: book.lang, title: book.title,
      subtitle: `${book.author || ""}${intent !== "general" ? ` · ${INTENTS.find((i) => i[0] === intent)[1]}` : ""}`.replace(/^ · /, ""),
      cover: book.cover_url, src: data.audioUrl, text: summary.script,
    });
  }
  const playing = active && player.playing;
  const canListen = voice !== false;
  const note = {
    rate_limited: "You've reached the hourly limit for new angles. Try again soon, or read the General summary.",
    ai_unavailable: "This angle isn't available right now, so you're seeing the General summary.",
    network: "Couldn't load this angle. Check your connection and try again.",
  }[data.unavailable];

  return (
    <section aria-labelledby="sum-h" className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="sum-h" className="font-editorial text-xl font-semibold sm:text-2xl">Understand in 60 seconds</h2>
        <SaveOfflineButton url={`/${book.lang}/books/${encodeURIComponent(book.slug)}`} title={book.title} className="ms-auto" />
      </div>

      {/* Read | Listen — the one primary control */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button" onClick={listen} disabled={!canListen || loading}
          className="btn-primary min-w-40 justify-center disabled:opacity-50"
          aria-label={playing ? "Pause summary" : "Listen to the 60-second summary"}
        >
          <Icon name={playing ? "pause" : "headphones"} size={16} />
          {playing ? "Pause" : active ? "Resume" : "Listen"}
        </button>
        {voice === false && <p className="text-muted text-sm">Audio isn&apos;t available for this language on your device. You can still read it below.</p>}
      </div>

      {/* Audience angle */}
      <div role="tablist" aria-label="Summary angle" className="border-line mt-5 flex gap-5 overflow-x-auto border-b">
        {INTENTS.map(([id, label]) => (
          <button key={id} role="tab" type="button" aria-selected={intent === id} onClick={() => pick(id)}
            className={`-mb-px shrink-0 border-b-2 pb-2 text-sm font-medium transition ${intent === id ? "border-brand-600 text-brand-700" : "text-muted hover:text-fg border-transparent"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Depth */}
      <div role="tablist" aria-label="Summary depth" className="bg-brand-50 mt-4 inline-flex rounded-full p-1 text-sm">
        {DEPTHS.map(([id, label]) => (
          <button key={id} role="tab" type="button" aria-selected={depth === id} onClick={() => setDepth(id)}
            className={`rounded-full px-3.5 py-1.5 font-medium transition ${depth === id ? "bg-surface text-fg shadow-sm" : "text-muted"}`}>
            {label}
          </button>
        ))}
      </div>

      {note && <p role="status" className="text-muted mt-3 text-sm">{note}</p>}

      <div className={`reader-sepia-ok mt-5 transition-opacity ${loading ? "opacity-50" : ""}`} aria-busy={loading}>
        {loading && <div className="skeleton h-24 w-full" aria-hidden />}

        {!loading && depth === "minute" && (
          <div className="relative ps-4">
            <span className="bg-line absolute inset-y-0 start-0 w-0.5 rounded" aria-hidden>
              <span className="bg-brand-600 block w-full rounded transition-[height] duration-300"
                style={{ height: active && sentences.length ? `${((player.activeIndex + 1) / sentences.length) * 100}%` : "0%" }} />
            </span>
            {!thesisInScript && <p className="font-editorial text-xl leading-snug sm:text-2xl">{summary.thesis}</p>}
            <p className={`font-editorial text-base leading-[1.8] sm:text-lg ${thesisInScript ? "" : "mt-4"}`}>
              {sentences.map((s, i) => (
                <span key={i}>
                  <button type="button" onClick={() => active ? player.seekToSentence(i) : listen()}
                    className={`text-start transition-colors ${active && player.activeIndex === i ? "underline decoration-[var(--gold)] decoration-2 underline-offset-4" : "hover:bg-brand-50"}`}
                    title="Play from here">
                    {s}
                  </button>{" "}
                </span>
              ))}
            </p>
          </div>
        )}

        {!loading && depth === "ideas" && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {summary.takeaways.map((t) => (
              <li key={t} className="border-line bg-surface font-editorial rounded-2xl border p-4 text-base leading-snug">{t}</li>
            ))}
            {summary.quotes?.map((q) => (
              <li key={q} className="font-editorial border-brand-500 text-muted border-s-2 ps-4 italic sm:col-span-2">&ldquo;{q}&rdquo;</li>
            ))}
          </ul>
        )}

        {!loading && depth === "full" && (
          fullText
            ? <Translated as="p" className="font-editorial max-w-prose whitespace-pre-line text-base leading-[1.8]" text={fullText} />
            : <p className="text-muted text-sm">No longer summary has been written for this book yet. The 1-minute and Key ideas views cover it.</p>
        )}

        {!loading && intent === "action" && depth !== "full" && summary.takeaways.length > 0 && (
          <div className="bg-brand-50 mt-5 rounded-2xl p-4">
            <h3 className="font-editorial text-lg font-semibold">Try this week</h3>
            <ul className="mt-2 list-disc space-y-1 ps-5 text-sm">
              {summary.takeaways.slice(0, 3).map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        )}
      </div>

      <p className="text-muted mt-4 text-xs">
        {data.audioUrl ? "Narrated audio" : "Read aloud by your device"}
        {intent !== "general" || data.audioUrl === null ? " · Summaries are generated from the book's published details and may be incomplete." : ""}
      </p>
    </section>
  );
}
