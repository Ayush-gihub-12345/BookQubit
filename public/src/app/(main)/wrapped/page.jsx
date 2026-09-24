"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getFirebaseAuth, firebaseEnabled } from "@/lib/firebase";
import BookCover from "@/components/BookCover";
import Icon from "@/components/Icon";
import TitleTransliterated from "@/components/TitleTransliterated";
import { useLang } from "@/lib/useLang";
import { t } from "@/lib/i18n";

const CURRENT_YEAR = new Date().getFullYear();
const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString(undefined, { month: "short" }));

export default function WrappedPage() {
  const router = useRouter();
  const tr = t(useLang());
  const [user, setUser] = useState(undefined);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) { setUser(null); return; }
    return auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) router.push("/login");
    });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/wrapped?uid=${user.uid}&year=${year}`).then((r) => r.json()).then(setData);
  }, [user, year]);

  const share = async () => {
    if (!data) return;
    const text = `My ${year} in books on BookQubit: ${data.totalBooks} books, ${data.totalPages.toLocaleString()} pages` +
      (data.topGenre ? `, mostly ${data.topGenre}` : "") + ". 📚";
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch { /* fall through */ }
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!firebaseEnabled || user === undefined || !data) return null;
  if (!user) return null;

  const maxMonth = Math.max(1, ...data.months.map((m) => m.count));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="band relative overflow-hidden rounded-3xl p-8 text-center sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">{tr("yourYearInBooks")}</p>
        <div className="mt-3 flex items-center justify-center gap-3">
          {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map((y) => (
            <button key={y} onClick={() => setYear(y)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${y === year ? "bg-white text-ink-900" : "text-white/70 hover:text-white"}`}>
              {y}
            </button>
          ))}
        </div>
        <h1 className="mt-4 text-5xl font-extrabold text-white sm:text-6xl">{data.totalBooks}</h1>
        <p className="mt-1 text-lg text-white/80">{data.totalBooks === 1 ? tr("finishedInYearSingular", { year }) : tr("finishedInYearPlural", { year })}</p>
        <button onClick={share} className="btn-primary mt-6 !bg-white !text-ink-900 hover:!brightness-95">
          <Icon name={copied ? "check" : "share"} size={15} /> {copied ? tr("copiedLabel") : tr("shareYourYearLabel")}
        </button>
      </div>

      {data.totalBooks === 0 ? (
        <div className="card mt-8 p-10 text-center hover:!translate-y-0">
          <Icon name="book" size={28} className="text-muted mx-auto" />
          <p className="mt-3 font-semibold">{tr("noBooksFinishedYet", { year })}</p>
          <p className="text-muted mt-1 text-sm">{tr("markFewReadComeBack")}</p>
          <Link href="/books" className="btn-primary mt-4 inline-flex">{tr("browseBooksLabel")}</Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["barChart", data.totalPages.toLocaleString(), tr("pagesReadLabel")],
              ["star", data.avgRating ?? "—", tr("avgRatingGivenLabel")],
              ["feather", data.reviewsWritten, tr("reviewsWrittenLabel")],
              ["compass", data.topGenre || "—", tr("topGenreLabel")],
            ].map(([icon, val, label]) => (
              <div key={label} className="card p-4 text-center hover:!translate-y-0">
                <span className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-brand-600/10 text-brand-600">
                  <Icon name={icon} size={18} />
                </span>
                <p className="mt-2 truncate text-xl font-extrabold">{val}</p>
                <p className="text-muted text-xs">{label}</p>
              </div>
            ))}
          </div>

          <div className="card mt-6 p-5 hover:!translate-y-0">
            <p className="mb-4 flex items-center gap-2 text-sm font-bold">
              <Icon name="trendingUp" size={16} className="text-brand-600" /> {tr("booksFinishedByMonth")}
            </p>
            <div className="flex h-28 items-end gap-2">
              {data.months.map((m, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-xs font-semibold">{m.count > 0 ? m.count : ""}</span>
                  <div className="w-full rounded-t-md bg-brand-600/80 transition-all" style={{ height: `${Math.max(4, (m.count / maxMonth) * 80)}px` }} />
                  <span className="text-muted text-[11px]">{MONTH_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {data.topRatedBook && (
              <Link href={`/books/${encodeURIComponent(data.topRatedBook.book_slug)}`} className="card flex gap-4 p-4 hover:!translate-y-0">
                <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg shadow">
                  <BookCover title={data.topRatedBook.title || data.topRatedBook.book_slug} author={data.topRatedBook.author} cover_url={data.topRatedBook.cover_url} />
                </div>
                <div className="min-w-0">
                  <p className="text-muted text-xs font-bold uppercase tracking-wide">{tr("topRatedReadLabel")}</p>
                  <p className="mt-1 line-clamp-2 font-semibold"><TitleTransliterated text={data.topRatedBook.title || data.topRatedBook.book_slug} /></p>
                  {data.topRatedBook.rating && <p className="mt-1 text-amber-400">{"★".repeat(data.topRatedBook.rating)}</p>}
                </div>
              </Link>
            )}
            {data.longestBook && (
              <Link href={`/books/${encodeURIComponent(data.longestBook.book_slug)}`} className="card flex gap-4 p-4 hover:!translate-y-0">
                <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg shadow">
                  <BookCover title={data.longestBook.title || data.longestBook.book_slug} author={data.longestBook.author} cover_url={data.longestBook.cover_url} />
                </div>
                <div className="min-w-0">
                  <p className="text-muted text-xs font-bold uppercase tracking-wide">{tr("biggestReadLabel")}</p>
                  <p className="mt-1 line-clamp-2 font-semibold"><TitleTransliterated text={data.longestBook.title || data.longestBook.book_slug} /></p>
                  {data.longestBook.page_count && <p className="text-muted mt-1 text-sm">{data.longestBook.page_count} {tr("pagesSuffixWord")}</p>}
                </div>
              </Link>
            )}
          </div>

          {data.topAuthor && (
            <p className="text-muted mt-6 text-center text-sm">
              {(() => {
                const [before, after] = tr("spentMostTimeWith").split("{author}");
                return <>{before}<span className="font-semibold text-brand-600"><TitleTransliterated text={data.topAuthor} /></span>{after}</>;
              })()}
            </p>
          )}
        </>
      )}
    </div>
  );
}
