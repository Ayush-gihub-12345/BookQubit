import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  };

  return (
    <>
      <a href="#main-content" className="skip-link">{labels.skipToContent}</a>
      <Navbar lang={lang} theme={theme} languages={LANGUAGES} themes={THEMES} labels={labels} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer lang={lang} />
    </>
  );
}
