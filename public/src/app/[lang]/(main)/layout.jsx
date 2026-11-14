import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConditionalFooter from "@/components/ConditionalFooter";
import MobileTabBar from "@/components/MobileTabBar";
import SideRail from "@/components/SideRail";
import PlayerProvider from "@/components/player/PlayerProvider";
import MiniPlayer from "@/components/player/MiniPlayer";
import { getLang, LANGUAGES } from "@/lib/lang";
import { getTheme, THEMES } from "@/lib/theme";
import { t } from "@/lib/i18n";
import { facets } from "@/lib/repo";
import { resolveGenres } from "@/lib/genres";

export default async function PublicLayout({ children }) {
  const [lang, theme] = await Promise.all([getLang(), getTheme()]);
  const _ = t(lang);
  // Navigation is generated from the catalog so it can't link to empty pages.
  // facets() is cached (3h, three tiers) and the homepage reads it too; the
  // catch keeps a database hiccup from taking the whole layout down with it.
  const f = await facets(lang).catch(() => ({ categories: [], countries: [], collections: [] }));
  const genres = resolveGenres(f.categories, { limit: 7 });
  const countries = f.countries.filter((c) => c.count >= 3).slice(0, 7);
  const collections = f.collections.filter((c) => c.count >= 3).slice(0, 4);
  const labels = {
    books: _("books"), collections: _("collections"), categories: _("categories"),
    authors: _("authors"), publishers: _("publishers"), comics: _("comics"), tags: _("tags"),
    search: _("search"), signIn: _("signIn"), account: _("account"), signOut: _("signOut"),
    skipToContent: _("skipToContent"),
    surpriseMe: _("navSurpriseMe"), notifications: _("navNotifications"), likedBooks: _("navLikedBooks"),
    theme: _("navTheme"), language: _("navLanguage"), menu: _("navMenu"),
  };

  return (
    <PlayerProvider>
      <a href="#main-content" className="skip-link">{labels.skipToContent}</a>
      <Navbar lang={lang} theme={theme} languages={LANGUAGES} themes={THEMES} labels={labels}
        genres={genres} countries={countries} collections={collections} />
      {/* The rail (lg+) sits in a flex row beside the page. The footer carries the bottom padding for the
          mobile tab bar, and the spacer keeps the mini player from covering the end of the page. */}
      <div className="flex flex-1">
        <SideRail />
        <div className="flex min-w-0 flex-1 flex-col">
          <main id="main-content" className="flex-1">{children}</main>
          <ConditionalFooter>
            <Footer lang={lang} />
          </ConditionalFooter>
          <div aria-hidden className="player-spacer" />
        </div>
      </div>
      <MobileTabBar />
      <MiniPlayer />
    </PlayerProvider>
  );
}
