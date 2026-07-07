"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import { readWishlist } from "@/components/WishlistButton";

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

  useEffect(() => {
    setWishlist(readWishlist());
    const auth = getFirebaseAuth();
    if (!auth) { setUser(null); return; }
    return auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (!u) { router.push("/login"); return; }
      const [shelfRes, lbRes] = await Promise.all([
        fetch(`/api/shelf?uid=${u.uid}`).then((r) => r.json()),
        fetch("/api/leaderboard").then((r) => r.json()).catch(() => ({ readers: [] })),
      ]);
      setShelf(shelfRes.shelf || []);
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
            {rank && <Link href="/readers" className="pill !text-sm">🏆 Rank #{rank.position}</Link>}
          </div>
        </div>
        <Link href="/readers" className="btn-ghost text-sm">🏆 Leaderboard</Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          ["✅", stats.read, "Books read"],
          ["📖", stats.reading, "Reading now"],
          ["🔖", stats.want, "Want to read"],
          ["📄", stats.pagesRead.toLocaleString(), "Pages read"],
          ["★", stats.avgRating, "Avg rating"],
        ].map(([icon, val, label]) => (
          <div key={label} className="card p-4 text-center hover:!translate-y-0">
            <p className="text-2xl">{icon}</p>
            <p className="mt-1 text-2xl font-extrabold">{val}</p>
            <p className="text-muted text-xs">{label}</p>
          </div>
        ))}
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
            <Link key={s.book_slug} href={`/books/${encodeURIComponent(s.book_slug)}`} className="card group overflow-hidden">
              <div className="relative aspect-[2/3] overflow-hidden bg-black/5">
                {s.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.cover_url} alt={s.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                ) : (
                  <div className="text-muted grid h-full place-items-center p-4 text-center text-sm font-semibold">{s.title || s.book_slug}</div>
                )}
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                  {s.status === "read" ? "✅ Read" : s.status === "reading" ? `📖 ${s.progress || 0}%` : "🔖 Want"}
                </span>
              </div>
              <div className="p-3">
                <p className="line-clamp-1 text-sm font-semibold">{s.title || s.book_slug}</p>
                <p className="text-muted line-clamp-1 text-xs">{s.author}</p>
                {s.rating && <p className="mt-0.5 text-xs text-amber-400">{"★".repeat(s.rating)}</p>}
              </div>
            </Link>
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
                  {b.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.cover_url} alt={b.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                  )}
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
