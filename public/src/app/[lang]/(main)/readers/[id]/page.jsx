import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserProfile, levelFor, getAchievements, getQuotesByUser, getBooksBySlug } from "@/lib/repo";
import { getCf } from "@/lib/cf/env";
import { getProfileExtras } from "@/lib/profile-extras";
import BookCover from "@/components/BookCover";
import Icon from "@/components/Icon";
import { FollowButton } from "@/components/FollowButton";
import ReviewCard from "@/components/ReviewCard";
import TitleTransliterated from "@/components/TitleTransliterated";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const profile = await getUserProfile(id);
  const lang = await getLang();
  return profile
    ? { title: `${profile.user.name} — Reader Profile`, robots: { index: false } }
    : { title: t(lang)("readerNotFound"), robots: { index: false } };
}

export default async function ReaderProfilePage({ params }) {
  const { id } = await params;
  const lang = await getLang();
  const _ = t(lang);
  const profile = await getUserProfile(id);
  if (!profile) notFound();
  const { user, shelf: fullShelf } = profile;
  const { env } = await getCf();
  const extras = await getProfileExtras(env, user.id);
  // Privacy is applied on the server: a reader who hides their activity never has their shelves,
  // stats, streak or achievements sent to the browser at all.
  const hidden = extras.privacy.hideActivity;
  const shelf = hidden ? [] : fullShelf;
  const [achievements, quotes] = await Promise.all([hidden ? [] : getAchievements(user.id), getQuotesByUser(user.id, 6)]);
  const shelfBooks = extras.shelves.length
    ? await getBooksBySlug([...new Set(extras.shelves.flatMap((x) => x.slugs))], "en", "slug, title, cover_url").catch(() => new Map())
    : new Map();
  const unlockedAchievements = achievements.filter((a) => a.unlocked);

  const read = shelf.filter((s) => s.status === "read");
  const reading = shelf.filter((s) => s.status === "reading");
  const rated = shelf.filter((s) => s.rating);
  const reviews = shelf.filter((s) => s.review);
  const points = read.length * 10 + rated.length * 2 + reviews.length * 5;
  const level = levelFor(points);

  const GROUPS = [
    ["bookOpen", _("currentlyReadingLabel"), reading],
    ["check", _("readHeadingLabel"), read],
    ["bookmark", _("wantToReadLabel"), shelf.filter((s) => s.status === "want")],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="card flex flex-col items-center gap-6 p-8 hover:!translate-y-0 sm:flex-row">
        {user.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photo_url} alt="" className="h-24 w-24 rounded-full ring-4 ring-brand-500/30" />
        ) : (
          <span className="grid h-24 w-24 place-items-center rounded-full bg-brand-600 text-4xl font-bold text-white">
            {(user.name || "R")[0].toUpperCase()}
          </span>
        )}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted text-sm">{_("readerSince", { date: user.created_at?.slice(0, 10) })}</p>
          {extras.privacy.bio && <p className="mt-2 max-w-prose text-sm">{extras.privacy.bio}</p>}
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            {!hidden && <span className="pill"><Icon name={level.icon} size={13} /> {level.name}</span>}
            {!hidden && <span className="pill"><Icon name="zap" size={13} /> {_("ptsSuffix", { n: points })}</span>}
            {!hidden && <span className="pill"><Icon name="check" size={13} /> {_("readCountLabel", { n: read.length })}</span>}
            {!hidden && <span className="pill"><Icon name="feather" size={13} /> {_("reviewsCountLabel", { n: reviews.length })}</span>}
            {extras.streak?.current > 0 && <span className="pill"><Icon name="flame" size={13} /> {extras.streak.current}-day streak</span>}
          </div>
          <div className="mt-4 flex justify-center sm:justify-start">
            <FollowButton type="reader" id={user.id} label={_("followLabel")} />
          </div>
        </div>
      </div>

      {hidden && <p className="text-muted mt-8 text-center text-sm">This reader keeps their reading activity private.</p>}

      {extras.spaces.length > 0 && (
        <div>
          <h2 className="mt-10 flex items-center gap-2 text-xl font-bold"><Icon name="layers" size={18} className="text-brand-600" /> Public MindSpaces</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {extras.spaces.map((sp) => (
              <li key={sp.slug}><Link href={`/${lang}/mindspace/${encodeURIComponent(sp.slug)}`} className="card block p-4 hover:!translate-y-0"><span className="font-editorial block truncate font-semibold">{sp.title}</span><span className="text-muted text-xs">{sp.node_count} ideas</span></Link></li>
            ))}
          </ul>
        </div>
      )}

      {extras.shelves.length > 0 && (
        <div>
          <h2 className="mt-10 flex items-center gap-2 text-xl font-bold"><Icon name="bookmark" size={18} className="text-brand-600" /> Shelves</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {extras.shelves.map((sh) => (
              <div key={sh.id} className="card p-4 hover:!translate-y-0">
                <p className="font-editorial font-semibold">{sh.name}</p>
                <ul className="text-muted mt-2 space-y-1 text-sm">
                  {sh.slugs.map((slug) => (
                    <li key={slug}><Link href={`/${lang}/books/${encodeURIComponent(slug)}`} className="hover:text-brand-600 hover:underline">{shelfBooks.get(slug)?.title || slug}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {unlockedAchievements.length > 0 && (
        <div>
          <h2 className="mt-10 flex items-center gap-2 text-xl font-bold">
            <Icon name="award" size={18} className="text-brand-600" /> {_("achievementsLabel")} <span className="text-muted text-sm font-normal">({unlockedAchievements.length})</span>
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {unlockedAchievements.map((a) => (
              <span key={a.id} className="pill !bg-brand-600/10 !text-brand-600" title={a.desc}>
                <Icon name={a.icon} size={13} /> {a.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <div>
          <h2 className="mt-10 flex items-center gap-2 text-xl font-bold">
            <Icon name="feather" size={18} className="text-brand-600" /> {_("reviewsHeading")} <span className="text-muted text-sm font-normal">({reviews.length})</span>
          </h2>
          <div className="mt-4 space-y-4">
            {reviews.map((s) => (
              <ReviewCard
                key={s.book_slug}
                rating={s.rating}
                review={s.review}
                spoiler={s.spoiler}
                updatedAt={s.updated_at}
                book={{ slug: s.book_slug, title: s.title || s.book_slug }}
                spoilerLabel={_("spoilerClickToReveal")}
              />
            ))}
          </div>
        </div>
      )}

      {quotes.length > 0 && (
        <div>
          <h2 className="mt-10 flex items-center gap-2 text-xl font-bold">
            <Icon name="feather" size={18} className="text-brand-600" /> {_("favoriteQuotesLabel")}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quotes.map((q) => (
              <Link key={q.id} href={`/${lang}/books/${encodeURIComponent(q.book_slug)}`}
                className="card !border-brand-500/20 bg-brand-600/5 p-4 hover:!translate-y-0">
                <p className="whitespace-pre-line text-sm italic leading-relaxed">"{q.text}"</p>
                <p className="text-muted mt-2 text-xs">— <TitleTransliterated text={q.title || q.book_slug} />{q.page ? _("quotePageAbbrev", { page: q.page }) : ""}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {GROUPS.map(([icon, title, items]) =>
        items.length ? (
          <div key={title}>
            <h2 className="mt-10 flex items-center gap-2 text-xl font-bold">
              <Icon name={icon} size={18} className="text-brand-600" /> {title} <span className="text-muted text-sm font-normal">({items.length})</span>
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-6">
              {items.map((s) => (
                <Link key={s.book_slug} href={`/${lang}/books/${encodeURIComponent(s.book_slug)}`} className="card group overflow-hidden">
                  <div className="aspect-[2/3] overflow-hidden bg-black/5">
                    <BookCover title={s.title || s.book_slug} author={s.author} cover_url={s.cover_url}
                      imgClassName="transition group-hover:scale-105" />
                  </div>
                  <div className="p-2.5">
                    <p className="line-clamp-1 text-xs font-semibold"><TitleTransliterated text={s.title || s.book_slug} /></p>
                    {s.rating && <p className="text-[10px] text-amber-400">{"★".repeat(s.rating)}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null
      )}

      {!hidden && !shelf.length && <p className="text-muted mt-16 text-center">{_("emptyShelfMessage")}</p>}
    </div>
  );
}
