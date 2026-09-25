import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ConditionalFooter from "@/components/ConditionalFooter";
import { getLang, LANGUAGES } from "@/lib/lang";
import { getTheme, THEMES } from "@/lib/theme";
import { getTranslation } from "@/lib/getTranslation";
import { TranslationProvider } from "@/context/TranslationContext";

export default async function PublicLayout({ children }) {
  const [lang, theme] = await Promise.all([getLang(), getTheme()]);
  const translation = await getTranslation(lang);

  return (
    <TranslationProvider locale={lang} translation={translation}>
      <a href="#main-content" className="skip-link">
        {translation.skipToContent || "Skip to content"}
      </a>
      <Navbar lang={lang} theme={theme} languages={LANGUAGES} themes={THEMES} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <ConditionalFooter>
        <Footer lang={lang} />
      </ConditionalFooter>
    </TranslationProvider>
  );
}
