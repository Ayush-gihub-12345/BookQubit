"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import { readWishlist } from "@/components/WishlistButton";
import BookCover from "@/components/BookCover";
import Icon from "@/components/Icon";
import ShelfItemCard from "@/components/ShelfItemCard";

const TABS = [
  { id: "all", label: "All" },
  { id: "reading", label: "📖 Reading" },
  { id: "read", label: "✅ Read" },
  { id: "want", label: "🔖 Want to Read" },
];

const LEVELS = [
  { min: 400, name: "Grand Librarian", icon: "🏛️" },
  { min: 150, name: "Bibliophile", icon: "📚" },
  { min: 50, name: "Bookworm", icon: "🐛" },
  { min: 10, name: "Page Turner", icon: "📖" },
  { min: 0, name: "New Reader", icon: "🌱" },
];

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(undefined);
  const [shelf, setShelf] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [tab, setTab] = useState("all");
  const [rank, setRank] = useState(null);
  const [goal, setGoal] = useState(null);
  const [goalInput, setGoalInput] = useState("");

  useEffect(() => {
    setWishlist(readWishlist());
    const auth = getFirebaseAuth();
    if (!auth) { setUser(null); return; }
    return auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (!u) { router.push("/login"); return; }
      const [shelfRes, lbRes, goalRes] = await Promise.all([
        fetch(`/api/shelf?uid=${u.uid}`).then((r) => r.json()),
        fetch("/api/leaderboard").then((r) => r.json()).catch(() => ({ readers: [] })),
        fetch(`/api/goal?uid=${u.uid}`).then((r) => r.json()).catch(() => null),
      ]);
      setShelf(shelfRes.shelf || []);
      setGoal(goalRes);
      const i = (lbRes.readers || []).findIndex((r) => r.id === u.uid);
      if (i >= 0) setRank({ position: i + 1, ...lbRes.readers[i] });
    });
  }, [router]);

  const [shelfQuery, setShelfQuery] = useState("");
  const [shelfSort, setShelfSort] = useState("recent");

  const stats = useMemo(() => {
    const read = shelf.filter((s) => s.status === "read");
    const reading = shelf.filter((s) => s.status === "reading");
    const want = shelf.filter((s) => s.status === "want");
    const rated = shelf.filter((s) => s.rating);
    const pagesRead = read.reduce((n, s) => n + (s.page_count || 0), 0);
    const points = read.length * 10 + rated.length * 2;
    return {
      read: read.length, reading: reading.length, want: want.length,
      pagesRead,
      avgRating: rated.length ? (rated.reduce((n, s) => n + s.rating, 0) / rated.length).toFixed(1) : "—",
      points,
      level: LEVELS.find((l) => points >= l.min),
    };
  }, [shelf]);

  // Books finished per month, last 6 months — pure client-side aggregation, no new API.
  const activity = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString(undefined, { month: "short" }), count: 0 };
    });
    shelf.forEach((s) => {
      if (s.status !== "read" || !s.finished_at) return;
      const d = new Date(s.finished_at);
      const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (m) m.count++;
    });
    const max = Math.max(1, ...months.map((m) => m.count));
    return { months, max };
  }, [shelf]);

  // Top genres across the whole shelf, by book category.
  const genres = useMemo(() => {
    const counts = new Map();
    shelf.forEach((s) => { if (s.category) counts.set(s.category, (counts.get(s.category) || 0) + 1); });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [shelf]);

  const reviews = useMemo(
    () => shelf.filter((s) => s.review && s.review.trim()).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)),
    [shelf]
  );

  if (!firebaseEnabled) return <div className="text-muted grid min-h-[50vh] place-items-center">Sign-in is not configured.</div>;
  if (user === undefined) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-10">
        <div className="card h-[140px] hover:!translate-y-0" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-24 hover:!translate-y-0" />)}
        </div>
        <div className="card mt-6 h-24 hover:!translate-y-0" />
      </div>
    );
  }
  if (!user) return null;

  let visible = tab === "all" ? shelf : shelf.filter((s) => s.status === tab);
  if (shelfQuery.trim()) {
    const q = shelfQuery.trim().toLowerCase();
    visible = visible.filter((s) => (s.title || "").toLowerCase().includes(q) || (s.author || "").toLowerCase().includes(q));
  }
  visible = [...visible].sort((a, b) => {
    if (shelfSort === "title") return (a.title || "").localeCompare(b.title || "");
    if (shelfSort === "rating") return (b.rating || 0) - (a.rating || 0);
    return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Profile + level */}
      <div className="card flex flex-col items-center gap-6 p-8 hover:!translate-y-0 sm:flex-row">
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" className="h-20 w-20 rounded-full ring-4 ring-brand-500/30" />
        ) : (
          <span className="grid h-20 w-20 place-items-center rounded-full bg-brand-600 text-3xl font-bold text-white">
            {(user.displayName || user.email)[0].toUpperCase()}
          </span>
        )}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold">{user.displayName || "Reader"}</h1>
          <p className="text-muted text-sm">{user.email}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="pill !text-sm">{stats.level.icon} {stats.level.name}</span>
            <span className="pill !text-sm">⚡ {stats.points} pts</span>
            {goal?.streak > 0 && <span className="pill !bg-orange-500/15 !text-sm !text-orange-500">🔥 {goal.streak}-day streak</span>}
            {rank && <Link href="/leaderboard" className="pill !text-sm">🏆 Rank #{rank.position}</Link>}
          </div>
        </div>
        <Link href="/leaderboard" className="btn-ghost text-sm">🏆 Bookworm Ranking</Link>
        <Link href="/community" className="btn-ghost text-sm">Community</Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          ["check", stats.read, "Books read"],
          ["bookOpen", stats.reading, "Reading now"],
          ["bookmark", stats.want, "Want to read"],
          ["barChart", stats.pagesRead.toLocaleString(), "Pages read"],
          ["star", stats.avgRating, "Avg rating"],
        ].map(([icon, val, label]) => (
          <div key={label} className="card p-4 text-center hover:!translate-y-0">
            <span className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-brand-600/10 text-brand-600">
              <Icon name={icon} size={18} />
            </span>
            <p className="mt-2 text-2xl font-extrabold">{val}</p>
            <p className="text-muted text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Reading goal */}
      <div className="card mt-6 flex flex-col items-center gap-6 p-6 hover:!translate-y-0 sm:flex-row">
        {goal?.target ? (
          <>
            <div
              className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
              style={{
                background: `conic-gradient(var(--color-brand-600) ${Math.min(100, Math.round(((goal.done || 0) / goal.target) * 100)) * 3.6}deg, color-mix(in srgb, var(--color-brand-600) 15%, transparent) 0deg)`,
              }}
            >
              <div className="bg-surface grid h-[76px] w-[76px] place-items-center rounded-full text-center">
                <span>
                  <span className="block text-xl font-extrabold">{goal.done || 0}</span>
                  <span className="text-muted block text-[10px]">of {goal.target}</span>
                </span>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold">📅 {goal.year} Reading Challenge</h3>
              <p className="text-muted mt-1 text-sm">
                {goal.done >= goal.target
                  ? "🎉 Goal complete — you're unstoppable!"
                  : `${goal.target - goal.done} more ${goal.target - goal.done === 1 ? "book" : "books"} to reach your goal. Keep going!`}
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold">📅 Set your {new Date().getFullYear()} Reading Challenge</h3>
            <p className="text-muted mt-1 text-sm">How many books will you read this year?</p>
          </div>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const target = Number(goalInput);
            if (!target) return;
            await fetch("/api/goal", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken: await user.getIdToken(), target }),
            });
            setGoal((g) => ({ ...(g || { year: new Date().getFullYear(), done: 0 }), target }));
            setGoalInput("");
          }}
          className="flex gap-2"
        >
          <input
            type="number" min="1" max="1000" value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder={goal?.target ? String(goal.target) : "24"}
            className="input w-24 text-center"
          />
          <button type="submit" className="btn-primary !px-4 text-sm">
            {goal?.target ? "Update" : "Set goal"}
          </button>
        </form>
      </div>

      {/* Activity + genres */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-5 hover:!translate-y-0">
          <p className="mb-4 flex items-center gap-2 text-sm font-bold">
            <Icon name="trendingUp" size={16} className="text-brand-600" /> Reading activity
            <span className="text-muted font-normal">— books finished, last 6 months</span>
          </p>
          <div className="flex h-28 items-end gap-3">
            {activity.months.map((m) => (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-xs font-semibold">{m.count > 0 ? m.count : ""}</span>
                <div
                  className="w-full rounded-t-md bg-brand-600/80 transition-all"
                  style={{ height: `${Math.max(4, (m.count / activity.max) * 80)}px` }}
                />
                <span className="text-muted text-[11px]">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 hover:!translate-y-0">
          <p className="mb-4 flex items-center gap-2 text-sm font-bold">
            <Icon name="compass" size={16} className="text-brand-600" /> Favorite genres
          </p>
          {genres.length ? (
            <div className="flex flex-wrap gap-2">
              {genres.map(([g, n]) => (
                <Link key={g} href={`/books?category=${encodeURIComponent(g)}`} className="pill !text-xs">
                  {g} <span className="text-muted">· {n}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">Add books to your shelf to see your favorite genres.</p>
          )}
        </div>
      </div>

      {/* Shelf */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">My Shelf</h2>
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`pill ${tab === t.id ? "!bg-brand-600 !text-white" : ""}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Icon name="search" size={14} className="text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={shelfQuery} onChange={(e) => setShelfQuery(e.target.value)}
            placeholder="Search your shelf…" className="input w-full !pl-9 text-sm"
          />
        </div>
        <select value={shelfSort} onChange={(e) => setShelfSort(e.target.value)} className="input !w-auto text-sm">
          <option value="recent">Recently updated</option>
          <option value="title">Title A–Z</option>
          <option value="rating">Highest rated</option>
        </select>
      </div>

      {visible.length ? (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((s) => (
            <ShelfItemCard
              key={s.book_slug}
              entry={s}
              getIdToken={() => user.getIdToken()}
              onUpdate={(updated) => setShelf((prev) => prev.map((x) => (x.book_slug === updated.book_slug ? updated : x)))}
            />
          ))}
        </div>
      ) : (
        <div className="text-muted mt-10 text-center">
          <p className="text-4xl">📚</p>
          <p className="mt-2">Nothing here yet — open any book and mark it.</p>
          <Link href="/books" className="btn-primary mt-4 inline-flex">Browse Books</Link>
        </div>
      )}

      {/* Your reviews */}
      {reviews.length > 0 && (
        <>
          <h2 className="mt-12 text-2xl font-bold">Your Reviews <span className="text-muted text-sm font-normal">({reviews.length})</span></h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {reviews.map((s) => (
              <Link key={s.book_slug} href={`/books/${encodeURIComponent(s.book_slug)}#reviews`} className="card flex gap-3 p-4 hover:!translate-y-0">
                <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-black/5">
                  <BookCover title={s.title || s.book_slug} author={s.author} cover_url={s.cover_url} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold">{s.title || s.book_slug}</p>
                  {s.rating ? <p className="text-xs text-amber-400">{"★".repeat(s.rating)}</p> : null}
                  <p className="text-muted mt-1 line-clamp-2 text-xs leading-relaxed">{s.review}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Wishlist */}
      {wishlist.length > 0 && (
        <>
          <h2 className="mt-12 text-2xl font-bold">Wishlist <span className="text-muted text-sm font-normal">({wishlist.length})</span></h2>
          <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {wishlist.map((b) => (
              <Link key={b.slug} href={`/books/${encodeURIComponent(b.slug)}`} className="card group overflow-hidden">
                <div className="aspect-[2/3] overflow-hidden bg-black/5">
                  <BookCover title={b.title} author={b.author} cover_url={b.cover_url}
                    imgClassName="transition group-hover:scale-105" />
                </div>
                <p className="line-clamp-1 p-2.5 text-xs font-semibold">{b.title}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
