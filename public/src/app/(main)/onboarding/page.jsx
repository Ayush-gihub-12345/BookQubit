"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import BookCover from "@/components/BookCover";
import Icon from "@/components/Icon";

const STEPS = ["Favorite genres", "Rate books", "Your picks"];
const RATE_TARGET = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState(undefined);
  const [step, setStep] = useState(0);

  const [categories, setCategories] = useState([]);
  const [genres, setGenres] = useState([]);

  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [rated, setRated] = useState({}); // slug -> rating
  const [wanted, setWanted] = useState({}); // slug -> true
  const [ratedBooks, setRatedBooks] = useState({}); // slug -> book (for display)
  const [suggestions, setSuggestions] = useState([]);

  const [recs, setRecs] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) { setUser(null); return; }
    return auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) router.push("/login");
    });
  }, [router]);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  // Seed the "rate books" grid with books matching chosen genres, so there's
  // always something to rate without the user having to search first.
  useEffect(() => {
    if (step !== 1 || suggestions.length) return;
    const params = genres.length ? `?category=${encodeURIComponent(genres[0])}` : "";
    fetch(`/api/books${params}`).then((r) => r.ok ? r.json() : { books: [] }).then((d) => setSuggestions((d.books || []).slice(0, 12))).catch(() => {});
  }, [step, genres, suggestions.length]);

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/suggest?q=${encodeURIComponent(q.trim())}&lang=en`);
        const d = await r.json();
        setResults(d.books || []);
      } catch { setResults([]); }
      setSearching(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const toggleGenre = (g) => setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  const rate = async (book, stars) => {
    setRated((prev) => ({ ...prev, [book.slug]: stars }));
    setRatedBooks((prev) => ({ ...prev, [book.slug]: book }));
    const idToken = await user.getIdToken();
    await fetch("/api/shelf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, slug: book.slug, rating: stars, status: "read" }),
    });
  };

  const markWant = async (book) => {
    setWanted((prev) => ({ ...prev, [book.slug]: true }));
    const idToken = await user.getIdToken();
    await fetch("/api/shelf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, slug: book.slug, status: "want" }),
    });
  };

  const ratedCount = Object.keys(rated).length;
  const pool = useMemo(() => {
    const seen = new Set();
    const combined = [...results, ...suggestions];
    return combined.filter((b) => (seen.has(b.slug) ? false : (seen.add(b.slug), true)));
  }, [results, suggestions]);

  const finishRating = async () => {
    setSaving(true);
    try {
      const idToken = await user.getIdToken();
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, genres }),
      });
      const params = genres.length ? `?category=${encodeURIComponent(genres[0])}` : "";
      const r = await fetch(`/api/books${params}`);
      const d = r.ok ? await r.json() : { books: [] };
      setRecs((d.books || []).filter((b) => !rated[b.slug]).slice(0, 8));
      setStep(2);
    } finally { setSaving(false); }
  };

  const finish = async () => {
    setSaving(true);
    try {
      const idToken = await user.getIdToken();
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, onboarded: true }),
      });
      router.push("/account");
    } finally { setSaving(false); }
  };

  if (!firebaseEnabled || user === undefined) return null;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              i === step ? "bg-brand-600 text-white" : i < step ? "bg-brand-600/15 text-brand-600" : "text-muted bg-black/5 dark:bg-white/5"
            }`}>
              {i < step ? <Icon name="check" size={13} /> : <span>{i + 1}</span>} {label}
            </div>
            {i < STEPS.length - 1 && <Icon name="chevronDown" size={12} className="text-muted -rotate-90" />}
          </div>
        ))}
      </div>

      {/* Step 0: genres */}
      {step === 0 && (
        <div className="card p-8 text-center hover:!translate-y-0">
          <h1 className="text-2xl font-bold">What do you love to read?</h1>
          <p className="text-muted mt-2 text-sm">Pick a few genres — we'll use these to personalize your recommendations. You can change this anytime.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {categories.map((c) => (
              <button key={c.name} onClick={() => toggleGenre(c.name)}
                className={`pill !text-sm ${genres.includes(c.name) ? "!bg-brand-600 !text-white" : ""}`}>
                {c.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(1)}
            disabled={!genres.length}
            className="btn-primary mt-8 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue <Icon name="arrowRight" size={15} />
          </button>
        </div>
      )}

      {/* Step 1: rate books */}
      {step === 1 && (
        <div>
          <div className="card flex flex-col items-center gap-4 p-6 text-center hover:!translate-y-0 sm:flex-row sm:text-left">
            <div className="flex-1">
              <p className="text-sm font-semibold">You've rated <b className="text-brand-600">{ratedCount}</b> book{ratedCount === 1 ? "" : "s"}</p>
              <div className="bg-line mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full">
                <div className="h-full bg-brand-600 transition-all" style={{ width: `${Math.min(100, (ratedCount / RATE_TARGET) * 100)}%` }} />
              </div>
              <p className="text-muted mt-2 text-xs">
                {ratedCount >= RATE_TARGET
                  ? "Great — that's enough for solid recommendations."
                  : `Rate ${RATE_TARGET - ratedCount} more to unlock personalized picks.`}
              </p>
            </div>
            <button onClick={finishRating} disabled={saving} className="btn-primary shrink-0 text-sm">
              I'm finished rating <Icon name="arrowRight" size={14} />
            </button>
          </div>

          <div className="relative mt-6">
            <Icon name="search" size={15} className="text-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search books you've read…"
              className="input w-full !pl-11"
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(q.trim().length >= 2 ? results : pool).map((b) => (
              <div key={b.slug} className="card p-3 hover:!translate-y-0">
                <div className="aspect-[2/3] overflow-hidden rounded-lg bg-black/5">
                  <BookCover title={b.title} author={b.author} cover_url={b.cover_url} />
                </div>
                <p className="mt-2 line-clamp-1 text-xs font-semibold">{b.title}</p>
                <p className="text-muted line-clamp-1 text-[11px]">{b.author}</p>
                <div className="mt-1.5 flex items-center justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => rate(b, n)} aria-label={`Rate ${n} stars`}
                      className={`text-base transition hover:scale-125 ${(rated[b.slug] || 0) >= n ? "text-amber-400" : "text-muted opacity-30"}`}>★</button>
                  ))}
                </div>
                <button
                  onClick={() => markWant(b)}
                  className={`mt-1.5 w-full rounded-lg py-1 text-[11px] font-semibold transition ${
                    wanted[b.slug] ? "bg-brand-600/15 text-brand-600" : "text-muted hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {wanted[b.slug] ? "Added to Want to Read" : "Want to Read"}
                </button>
              </div>
            ))}
            {searching && <p className="text-muted col-span-full text-center text-sm">Searching…</p>}
            {!searching && q.trim().length >= 2 && !results.length && (
              <p className="text-muted col-span-full text-center text-sm">No matches for "{q}".</p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: recommendations */}
      {step === 2 && (
        <div className="card p-8 text-center hover:!translate-y-0">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600/10 text-brand-600">
            <Icon name="zap" size={24} />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Picked for you</h1>
          <p className="text-muted mt-2 text-sm">Based on your genres and ratings — your dashboard will keep refining these as you read more.</p>

          {recs.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {recs.map((b) => (
                <Link key={b.slug} href={`/books/${encodeURIComponent(b.slug)}`} className="card group overflow-hidden text-left">
                  <div className="aspect-[2/3] overflow-hidden bg-black/5">
                    <BookCover title={b.title} author={b.author} cover_url={b.cover_url} imgClassName="transition group-hover:scale-105" />
                  </div>
                  <p className="line-clamp-1 p-2 text-xs font-semibold">{b.title}</p>
                </Link>
              ))}
            </div>
          )}

          <button onClick={finish} disabled={saving} className="btn-primary mt-8">
            Go to my dashboard <Icon name="arrowRight" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
