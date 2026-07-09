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

  if (!firebaseEnabled) return <div className="text-muted grid min-h-[50vh] place-items-center">Sign-in is not configured.</div>;
  if (user === undefined) return <div className="text-muted grid min-h-[50vh] place-items-center">Loading…</div>;
  if (!user) return null;

  const visible = tab === "all" ? shelf : shelf.filter((s) => s.status === tab);

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

      {/* Shelf */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">My Shelf</h2>
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`pill ${tab === t.id ? "!bg-brand-600 !text-white" : ""}`}>
              {t.label}
            </button>
          ))}
        </div>
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
