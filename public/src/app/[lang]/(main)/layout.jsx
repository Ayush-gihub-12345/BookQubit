import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConditionalFooter from "@/components/ConditionalFooter";
import MobileTabBar from "@/components/MobileTabBar";
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
    <>
      <a href="#main-content" className="skip-link">{labels.skipToContent}</a>
      <Navbar lang={lang} theme={theme} languages={LANGUAGES} themes={THEMES} labels={labels}
        genres={genres} countries={countries} collections={collections} />
      {/* Reserves space for MobileTabBar (fixed, lg:hidden) so page content
          never renders underneath it — matches the bar's own height plus
          the same safe-area inset it pads itself with on notched phones.
          lg:pb-0 removes that space on desktop where the bar doesn't render
          at all. */}
      <main id="main-content" className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
      <ConditionalFooter>
        <Footer lang={lang} />
      </ConditionalFooter>
      <MobileTabBar />
    </>
  );
}
