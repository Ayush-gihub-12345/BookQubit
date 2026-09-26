import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConditionalFooter from "@/components/ConditionalFooter";
import MobileTabBar from "@/components/MobileTabBar";
import { getLang, LANGUAGES } from "@/lib/lang";
import { getTheme, THEMES } from "@/lib/theme";
import { t } from "@/lib/i18n";

export default async function PublicLayout({ children }) {
  const [lang, theme] = await Promise.all([getLang(), getTheme()]);
  const _ = t(lang);
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
      <Navbar lang={lang} theme={theme} languages={LANGUAGES} themes={THEMES} labels={labels} />
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
