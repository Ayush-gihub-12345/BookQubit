"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { splitSentences, speechTag } from "@/lib/text";
import { getFirebaseAuth } from "@/lib/firebase";
import { authFetch } from "@/lib/authFetch";
import { logClient } from "./log";

// One global player for the whole app (mounted in the (main) layout, so it survives
// client-side navigation). Two engines behind one API:
//   • "file"   — an <audio> element for real audio (R2-hosted generated summaries)
//   • "speech" — browser Web Speech API reading the summary script aloud; used when
//                no audio file exists, and the only option for languages without
//                server TTS. Sentence-level progress drives the read-along highlight.
//
// Track: { id, slug, lang, title, subtitle, cover, src?, text }

const Ctx = createContext(null);
export const usePlayer = () => useContext(Ctx);

const STORE = "bq-player-v1";
const CHARS_PER_SEC = 15; // speech pace at 1x, only used to estimate duration/position
export const SPEEDS = [0.75, 1, 1.25, 1.5, 2, 2.5];

const read = () => { try { return JSON.parse(localStorage.getItem(STORE) || "null"); } catch { return null; } };
const write = (v) => { try { localStorage.setItem(STORE, JSON.stringify(v)); } catch { /* storage blocked */ } };

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}
export function hasVoiceFor(lang) {
  if (!speechSupported()) return false;
  const tag = speechTag(lang).toLowerCase();
  const base = tag.split("-")[0];
  return window.speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith(base));
}
function pickVoice(tag) {
  const voices = window.speechSynthesis.getVoices();
  const t = tag.toLowerCase();
  return voices.find((v) => v.lang.toLowerCase() === t) || voices.find((v) => v.lang.toLowerCase().startsWith(t.split("-")[0])) || null;
}

export default function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [track, setTrack] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [fileDuration, setFileDuration] = useState(0);
  const [speed, setSpeedState] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sleepEndsAt, setSleepEndsAt] = useState(null);

  const sentences = useMemo(() => splitSentences(track?.text || ""), [track]);
  const weights = useMemo(() => {
    const total = sentences.reduce((n, s) => n + s.length, 0) || 1;
    let acc = 0;
    return { total, starts: sentences.map((s) => { const a = acc; acc += s.length; return a / total; }) };
  }, [sentences]);

  const engine = track?.src ? "file" : "speech";
  const duration = engine === "file" ? fileDuration : weights.total / (CHARS_PER_SEC * speed);

  const refs = useRef({});
  refs.current = { track, speed, sentences, engine, duration, position, playing };
  const genRef = useRef(0);
  const advanceRef = useRef(null);
  const [queue, setQueue] = useState([]);
  const queueRef = useRef([]);
  queueRef.current = queue;
  const sentStartRef = useRef(0);
  const lastSyncRef = useRef(0);

  // ── speech engine ────────────────────────────────────────────────────────
  const speakFrom = useCallback((i) => {
    if (!speechSupported()) return;
    const ss = window.speechSynthesis;
    ss.cancel();
    const gen = ++genRef.current;
    const run = (k) => {
      const { sentences: ss2, track: tr, speed: sp } = refs.current;
      if (gen !== genRef.current) return;
      if (k >= ss2.length) { setPlaying(false); setActiveIndex(0); setPosition(0); advanceRef.current?.(); return; }
      setActiveIndex(k);
      sentStartRef.current = performance.now();
      const u = new SpeechSynthesisUtterance(ss2[k]);
      const tag = speechTag(tr.lang);
      u.lang = tag; u.rate = sp;
      const v = pickVoice(tag); if (v) u.voice = v;
      u.onend = () => run(k + 1);
      u.onerror = (e) => { if (e.error !== "canceled" && e.error !== "interrupted") setPlaying(false); };
      ss.speak(u);
    };
    run(i);
  }, []);

  // position ticker for speech (file engine uses timeupdate)
  useEffect(() => {
    if (!playing || engine !== "speech") return;
    const id = setInterval(() => {
      const { duration: d } = refs.current;
      const start = weights.starts[activeIndex] ?? 0;
      const sentLen = (sentences[activeIndex]?.length || 0) / weights.total;
      const sentSecs = (sentLen * d) || 1;
      const into = Math.min(sentSecs, (performance.now() - sentStartRef.current) / 1000);
      setPosition(start * d + into);
    }, 250);
    return () => clearInterval(id);
  }, [playing, engine, activeIndex, weights, sentences]);

  // ── controls ─────────────────────────────────────────────────────────────
  const play = useCallback(() => {
    const { engine: e, position: pos, duration: d } = refs.current;
    if (e === "file") { audioRef.current?.play().catch(() => setPlaying(false)); }
    else {
      const frac = d ? pos / d : 0;
      let idx = 0; weights.starts.forEach((s, i) => { if (s <= frac + 1e-6) idx = i; });
      speakFrom(idx);
    }
    setPlaying(true);
  }, [speakFrom, weights]);

  const pause = useCallback(() => {
    const { engine: e } = refs.current;
    if (e === "file") audioRef.current?.pause();
    else { genRef.current++; speechSupported() && window.speechSynthesis.cancel(); }
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => (refs.current.playing ? pause() : play()), [play, pause]);

  const seek = useCallback((sec) => {
    const { engine: e, duration: d } = refs.current;
    const t = Math.max(0, Math.min(d || 0, sec));
    setPosition(t);
    if (e === "file") { if (audioRef.current) audioRef.current.currentTime = t; return; }
    const frac = d ? t / d : 0;
    let idx = 0; weights.starts.forEach((s, i) => { if (s <= frac + 1e-6) idx = i; });
    setActiveIndex(idx);
    if (refs.current.playing) speakFrom(idx);
  }, [speakFrom, weights]);

  const seekToSentence = useCallback((i) => {
    const d = refs.current.duration;
    seek((weights.starts[i] ?? 0) * d);
    if (!refs.current.playing) play();
  }, [seek, weights, play]);

  const skip = useCallback((delta) => seek(refs.current.position + delta), [seek]);

  const setSpeed = useCallback((s) => {
    setSpeedState(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
    if (refs.current.engine === "speech" && refs.current.playing) {
      refs.current.speed = s; // utterance reads it on the next sentence; restart now for immediacy
      speakFrom(activeIndexRef.current);
    }
  }, [speakFrom]);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;

  const setSleep = useCallback((minutes) => setSleepEndsAt(minutes ? Date.now() + minutes * 60000 : null), []);
  useEffect(() => {
    if (!sleepEndsAt) return;
    const id = setTimeout(() => { pause(); setSleepEndsAt(null); }, Math.max(0, sleepEndsAt - Date.now()));
    return () => clearTimeout(id);
  }, [sleepEndsAt, pause]);

  const load = useCallback(async (next, { autoplay = true, startAt } = {}) => {
    if (refs.current.track && refs.current.track.id === next.id) {
      if (autoplay && !refs.current.playing) play();
      setExpanded(false);
      return;
    }
    // Resolve the start position FIRST (local, then cross-device for signed-in
    // readers) so the pending state is in place before the track swap renders.
    const saved = read();
    let start = startAt ?? (saved?.positions?.[next.id] || 0);
    if (!start) {
      try {
        const u = getFirebaseAuth()?.currentUser;
        if (u) {
          const res = await authFetch(`/api/checkpoint?slug=${encodeURIComponent(next.slug)}&kind=summary`, {}, u);
          start = res && res.ok ? (await res.json()).position || 0 : 0;
        }
      } catch { /* offline */ }
    }
    genRef.current++;
    speechSupported() && window.speechSynthesis.cancel();
    audioRef.current?.pause();
    setPlaying(false); setActiveIndex(0); setPosition(0); setFileDuration(0);
    pendingRef.current = { autoplay, start };
    setTrack(next);
    logClient("audio_play", { slug: next.slug, engine: next.src ? "file" : "speech" });
  }, [play]);
  const pendingRef = useRef(null);

  // ── queue (audiobook shelves, "Play all", up next) ───────────────────────
  // A queue entry is a light descriptor { slug, lang, title, author, cover }; the script and audio are fetched
  // only when its turn comes (/api/summary is cached), so queueing twenty books costs nothing up front.
  const loadBook = useCallback(async (d, opts) => {
    try {
      const r = await fetch(`/api/summary?slug=${encodeURIComponent(d.slug)}&lang=${d.lang || "en"}&intent=general`);
      const j = await r.json();
      if (!r.ok || !j.summary?.script) return false;
      await load({
        id: `${d.slug}:${d.lang || "en"}:general`, slug: d.slug, lang: d.lang || "en", title: d.title, subtitle: d.author || "",
        cover: d.cover, src: j.audioUrl, text: j.summary.script,
      }, opts);
      return true;
    } catch { return false; }
  }, [load]);

  const advance = useCallback(async () => {
    const q = queueRef.current;
    if (!q.length) return;
    const [next, ...rest] = q;
    queueRef.current = rest; setQueue(rest);
    if (!(await loadBook(next))) advanceRef.current?.(); // skip a book with no summary rather than stall
  }, [loadBook]);
  advanceRef.current = advance;

  const playQueue = useCallback(async (list) => {
    if (!list?.length) return;
    const rest = list.slice(1);
    queueRef.current = rest; setQueue(rest);
    if (!(await loadBook(list[0]))) advanceRef.current?.();
  }, [loadBook]);
  const enqueue = useCallback((d) => {
    if (queueRef.current.some((x) => x.slug === d.slug) || refs.current.track?.slug === d.slug) return;
    const next = [...queueRef.current, d]; queueRef.current = next; setQueue(next);
  }, []);
  const clearQueue = useCallback(() => { queueRef.current = []; setQueue([]); }, []);

  // apply a pending load once the new track's refs are in place
  useEffect(() => {
    if (!track || !pendingRef.current) return;
    const { autoplay, start } = pendingRef.current;
    pendingRef.current = null;
    if (audioRef.current) { audioRef.current.playbackRate = refs.current.speed; }
    if (start) setPosition(start);
    if (engine === "file" && audioRef.current && start) audioRef.current.currentTime = start;
    if (engine === "speech" && start) {
      const d = weights.total / (CHARS_PER_SEC * refs.current.speed);
      let idx = 0; weights.starts.forEach((s, i) => { if (s <= start / d + 1e-6) idx = i; });
      setActiveIndex(idx);
    }
    if (autoplay) setTimeout(play, 0);
  }, [track]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = useCallback(() => {
    pause(); setTrack(null); setExpanded(false); setPosition(0);
    try { localStorage.removeItem(STORE); } catch { /* ignore */ }
  }, [pause]);

  // ── persistence + server checkpoint ──────────────────────────────────────
  useEffect(() => {
    const s = read();
    if (s?.track) { setTrack(s.track); setSpeedState(s.speed || 1); setPosition(s.positions?.[s.track.id] || 0); }
  }, []);
  useEffect(() => {
    if (!track) return;
    const prev = read() || {};
    write({ track, speed, positions: { ...(prev.positions || {}), [track.id]: position } });
  }, [track, speed, Math.floor(position / 5)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!track) return;
    const flush = async () => {
      try {
        const u = getFirebaseAuth()?.currentUser;
        if (!u) return;
        const idToken = await u.getIdToken();
        await fetch("/api/checkpoint", {
          method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
          body: JSON.stringify({ idToken, slug: track.slug, kind: "summary", position: refs.current.position, speed: refs.current.speed }),
        });
      } catch { /* best effort */ }
    };
    const id = setInterval(() => { if (refs.current.playing) flush(); }, 30000);
    if (!playing) flush();
    return () => clearInterval(id);
  }, [track, playing]);

  // ── lock-screen / media keys ─────────────────────────────────────────────
  useEffect(() => {
    if (!track || !("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title, artist: track.subtitle || "BookQubit",
        artwork: track.cover ? [{ src: track.cover }] : [],
      });
      navigator.mediaSession.setActionHandler("play", play);
      navigator.mediaSession.setActionHandler("pause", pause);
      navigator.mediaSession.setActionHandler("seekbackward", () => skip(-15));
      navigator.mediaSession.setActionHandler("seekforward", () => skip(15));
    } catch { /* partial support */ }
  }, [track, play, pause, skip]);

  // reserve space so page content never hides behind the dock
  useEffect(() => {
    document.body.dataset.player = track ? "on" : "off";
    return () => { delete document.body.dataset.player; };
  }, [track]);

  const value = {
    track, playing, position, duration, speed, engine, expanded, setExpanded, activeIndex,
    segments: sentences, sleepEndsAt,
    load, toggle, play, pause, seek, seekToSentence, skip, setSpeed, setSleep, close,
    queue, playQueue, enqueue, clearQueue, advance, loadBook,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={track?.src || undefined}
        preload="metadata"
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          setPosition(t);
          const d = e.currentTarget.duration || 1;
          let idx = 0; weights.starts.forEach((s, i) => { if (s <= t / d + 1e-6) idx = i; });
          setActiveIndex(idx);
        }}
        onLoadedMetadata={(e) => setFileDuration(e.currentTarget.duration || 0)}
        onEnded={() => { setPlaying(false); logClient("audio_complete", { slug: refs.current.track?.slug }); advanceRef.current?.(); }}
        onPause={() => engine === "file" && setPlaying(false)}
        onPlay={() => engine === "file" && setPlaying(true)}
      />
    </Ctx.Provider>
  );
}
