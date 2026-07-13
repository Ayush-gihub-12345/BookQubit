"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import BookCover from "@/components/BookCover";
import Icon from "@/components/Icon";
import Logo from "@/components/Logo";

const STEPS = ["Genres", "Reading Goal", "Authors", "Rate Books", "Done"];
const RATE_TARGET = 5;
const GOAL_PRESETS = [12, 24, 52, 100];

const GENRE_ICONS = {
  fiction: "bookOpen", philosophy: "compass", history: "clock", psychology: "users",
  "self-help": "zap", business: "trendingUp", finance: "barChart", biography: "user",
  science: "zap", "science fiction": "star", fantasy: "star", romance: "heart",
  thriller: "flame", mystery: "search", poetry: "feather", religion: "shieldCheck",
  health: "heart", technology: "grid", travel: "compass", horror: "eyeOff",
};
const iconForGenre = (name) => GENRE_ICONS[name?.toLowerCase()] || "book";

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState(undefined);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);

  const [categories, setCategories] = useState([]);
  const [genres, setGenres] = useState([]);

  const [goalTarget, setGoalTarget] = useState(null);
  const [goalCustom, setGoalCustom] = useState("");

  const [allAuthors, setAllAuthors] = useState([]);
  const [followedAuthors, setFollowedAuthors] = useState(new Set());

  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [rated, setRated] = useState({});
  const [wanted, setWanted] = useState({});
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

  useEffect(() => {
    if (step !== 2 || allAuthors.length) return;
    fetch("/api/authors").then((r) => r.json()).then((d) => setAllAuthors(d.authors || [])).catch(() => {});
  }, [step, allAuthors.length]);

  // Seed the "rate books" grid with books matching chosen genres, so there's
  // always something to rate without the user having to search first.
  useEffect(() => {
    if (step !== 3 || suggestions.length) return;
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

  const pickGoal = async (n) => {
    setGoalTarget(n);
    setGoalCustom("");
    const idToken = await user.getIdToken();
    await fetch("/api/goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, target: n }),
    });
  };

  const toggleAuthor = async (author) => {
    const following = followedAuthors.has(author.slug);
    setFollowedAuthors((prev) => {
      const next = new Set(prev);
      following ? next.delete(author.slug) : next.add(author.slug);
      return next;
    });
    const idToken = await user.getIdToken();
    await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, type: "author", id: author.slug, follow: !following }),
    });
  };

  const recommendedAuthors = useMemo(() => {
    if (!allAuthors.length) return [];
    const matched = allAuthors.filter((a) => a.genres?.some((g) => genres.includes(g)));
    const rest = allAuthors.filter((a) => !matched.includes(a));
    return [...matched, ...rest].slice(0, 12);
  }, [allAuthors, genres]);

  const rate = async (book, stars) => {
    setRated((prev) => ({ ...prev, [book.slug]: stars }));
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

  // Persists genres as soon as they're picked (step 0 -> 1) rather than
  // waiting until the very end, so preferences are saved even if the reader
  // abandons the flow partway through.
  const saveGenresAndContinue = async () => {
    setSaving(true);
    try {
      const idToken = await user.getIdToken();
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, genres }),
      });
      setStep(1);
    } finally { setSaving(false); }
  };

  const finishRating = async () => {
    setSaving(true);
    try {
      const params = genres.length ? `?category=${encodeURIComponent(genres[0])}` : "";
      const r = await fetch(`/api/books${params}`);
      const d = r.ok ? await r.json() : { books: [] };
      setRecs((d.books || []).filter((b) => !rated[b.slug]).slice(0, 8));
      setStep(4);
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

  // ── Welcome splash — a distinct gate before the numbered wizard begins ──
  if (!started) {
    return (
      <div className="mx-auto flex min-h-[75vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-brand-600/20 blur-2xl" />
          <div className="relative"><Logo size={56} /></div>
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
          Welcome{user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted mt-2 max-w-sm text-sm leading-relaxed">
          Let's build your reading profile — takes about two minutes, and every answer makes your
          recommendations sharper from day one.
        </p>
        <div className="card mt-8 w-full space-y-3 p-5 text-left hover:!translate-y-0">
          {[
            ["compass", "Pick your favorite genres"],
            ["calendar", "Set a reading goal for the year"],
            ["feather", "Follow a few authors you love"],
            ["star", "Rate books you've already read"],
          ].map(([icon, label]) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-600/10 text-brand-600">
                <Icon name={icon} size={15} />
              </span>
              {label}
            </div>
          ))}
        </div>
        <button onClick={() => setStarted(true)} className="btn-primary mt-8 w-full sm:w-auto">
          Let's Go <Icon name="arrowRight" size={15} />
        </button>
        <Link href="/account" className="text-muted mt-4 text-xs hover:text-brand-600">Skip setup for now</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Progress */}
      <div className="mx-auto mb-10 max-w-md">
        <div className="mb-2 flex items-center justify-between">
          {step > 0 && step < 4 ? (
            <button onClick={() => setStep((s) => s - 1)} className="text-muted flex items-center gap-1 text-xs font-semibold hover:text-brand-600">
              <Icon name="arrowRight" size={11} className="rotate-180" /> Back
            </button>
          ) : <span />}
          <p className="text-muted text-xs font-semibold uppercase tracking-wider">
            Step {Math.min(step + 1, STEPS.length)} of {STEPS.length} — {STEPS[step]}
          </p>
        </div>
        <div className="bg-line h-1.5 w-full overflow-hidden rounded-full">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      <div key={step} className="onboarding-step">
        {/* Step 0: genres */}
        {step === 0 && (
          <div className="card p-8 text-center hover:!translate-y-0">
            <h1 className="text-2xl font-bold">What do you love to read?</h1>
            <p className="text-muted mt-2 text-sm">Pick a few genres — we'll use these throughout BookQubit to personalize what you see. You can change this anytime.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              {categories.map((c) => (
                <button key={c.name} onClick={() => toggleGenre(c.name)}
                  className={`pill !text-sm ${genres.includes(c.name) ? "!bg-brand-600 !text-white" : ""}`}>
                  <Icon name={iconForGenre(c.name)} size={13} /> {c.name}
                </button>
              ))}
            </div>
            <button
              onClick={saveGenresAndContinue}
              disabled={!genres.length || saving}
              className="btn-primary mt-8 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue <Icon name="arrowRight" size={15} />
            </button>
          </div>
        )}

        {/* Step 1: reading goal */}
        {step === 1 && (
          <div className="card p-8 text-center hover:!translate-y-0">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600/10 text-brand-600">
              <Icon name="calendar" size={24} />
            </span>
            <h1 className="mt-4 text-2xl font-bold">Set a reading goal for {new Date().getFullYear()}</h1>
            <p className="text-muted mt-2 text-sm">Goals with a number attached actually get finished. Pick one — you can adjust it anytime from your dashboard.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              {GOAL_PRESETS.map((n) => (
                <button key={n} onClick={() => pickGoal(n)}
                  className={`pill !px-5 !py-2 !text-base ${goalTarget === n ? "!bg-brand-600 !text-white" : ""}`}>
                  {n} books
                </button>
              ))}
            </div>
            <div className="mx-auto mt-4 flex max-w-[220px] items-center gap-2">
              <input
                type="number" min="1" max="1000" value={goalCustom}
                onChange={(e) => setGoalCustom(e.target.value)}
                placeholder="Custom number" className="input text-center text-sm"
              />
              <button
                onClick={() => goalCustom && pickGoal(Number(goalCustom))}
                disabled={!goalCustom}
                className="btn-ghost shrink-0 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Set
              </button>
            </div>
            {goalTarget && (
              <p className="mt-4 text-sm font-semibold text-brand-600">
                <Icon name="check" size={14} className="inline" /> Goal set: {goalTarget} books this year
              </p>
            )}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button onClick={() => setStep(2)} className="text-muted text-sm hover:text-brand-600">Skip for now</button>
              <button onClick={() => setStep(2)} className="btn-primary">
                Continue <Icon name="arrowRight" size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: authors to follow */}
        {step === 2 && (
          <div className="card p-8 text-center hover:!translate-y-0">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600/10 text-brand-600">
              <Icon name="feather" size={24} />
            </span>
            <h1 className="mt-4 text-2xl font-bold">Follow a few authors</h1>
            <p className="text-muted mt-2 text-sm">Follow writers you already love (or want to discover) — new releases and discussions from them will surface first.</p>

            {recommendedAuthors.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {recommendedAuthors.map((a) => {
                  const following = followedAuthors.has(a.slug);
                  return (
                    <button key={a.slug} onClick={() => toggleAuthor(a)}
                      className={`card flex flex-col items-center gap-2 p-4 hover:!translate-y-0 ${following ? "!border-brand-500 bg-brand-600/5" : ""}`}>
                      {a.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.image_url} alt="" className="h-16 w-16 rounded-full object-cover" />
                      ) : (
                        <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-600/15 text-xl font-bold text-brand-600">
                          {a.name?.[0]}
                        </span>
                      )}
                      <span className="line-clamp-1 text-sm font-semibold">{a.name}</span>
                      <span className={`pill !px-3 !py-1 !text-[11px] ${following ? "!bg-brand-600 !text-white" : ""}`}>
                        {following ? <><Icon name="check" size={11} /> Following</> : "Follow"}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted mt-6 text-sm">Loading authors…</p>
            )}

            <div className="mt-8 flex items-center justify-center gap-4">
              <button onClick={() => setStep(3)} className="text-muted text-sm hover:text-brand-600">Skip for now</button>
              <button onClick={() => setStep(3)} className="btn-primary">
                Continue <Icon name="arrowRight" size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: rate books */}
        {step === 3 && (
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
                <div key={b.slug} className={`card p-3 hover:!translate-y-0 ${rated[b.slug] ? "!border-brand-500/50" : ""}`}>
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

        {/* Step 4: summary + recommendations */}
        {step === 4 && (
          <div className="card overflow-hidden p-8 text-center hover:!translate-y-0">
            <div className="celebrate-burst mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
              <Icon name="check" size={28} />
            </div>
            <h1 className="mt-4 text-2xl font-bold">You're all set{user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}</h1>
            <p className="text-muted mt-2 text-sm">Here's your reading profile — refine any of it anytime from your dashboard.</p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["compass", genres.length, "Genres picked"],
                ["calendar", goalTarget || "—", "Yearly goal"],
                ["feather", followedAuthors.size, "Authors followed"],
                ["star", ratedCount, "Books rated"],
              ].map(([icon, val, label]) => (
                <div key={label} className="card p-3 hover:!translate-y-0">
                  <span className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-brand-600/10 text-brand-600">
                    <Icon name={icon} size={15} />
                  </span>
                  <p className="mt-1.5 text-lg font-extrabold">{val}</p>
                  <p className="text-muted text-[11px]">{label}</p>
                </div>
              ))}
            </div>

            {recs.length > 0 && (
              <>
                <p className="text-muted mt-8 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                  <Icon name="zap" size={13} className="text-brand-600" /> Picked for you
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {recs.map((b) => (
                    <Link key={b.slug} href={`/books/${encodeURIComponent(b.slug)}`} className="card group overflow-hidden text-left">
                      <div className="aspect-[2/3] overflow-hidden bg-black/5">
                        <BookCover title={b.title} author={b.author} cover_url={b.cover_url} imgClassName="transition group-hover:scale-105" />
                      </div>
                      <p className="line-clamp-1 p-2 text-xs font-semibold">{b.title}</p>
                    </Link>
                  ))}
                </div>
              </>
            )}

            <button onClick={finish} disabled={saving} className="btn-primary mt-8">
              Enter BookQubit <Icon name="arrowRight" size={15} />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .onboarding-step { animation: stepIn 0.35s ease both; }
        @keyframes stepIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .celebrate-burst { animation: burst 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes burst { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
