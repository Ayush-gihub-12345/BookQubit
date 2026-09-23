import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConditionalFooter from "@/components/ConditionalFooter";
import { getLang, LANGUAGES } from "@/lib/lang";
import { getTheme, THEMES } from "@/lib/theme";
import { getTranslation } from "@/lib/getTranslation";
import { TranslationProvider } from "@/context/TranslationContext";
import { useT } from "@/context/TranslationContext"; // only if a child client comp needs it

export default async function PublicLayout({ children }) {
  const [lang, theme] = await Promise.all([getLang(), getTheme()]);
  const translation = await getTranslation(lang);

  // Server-side helper to translate the skip link directly (no context needed on server)
  const tServer = (key) => {
    const parts = key.split(".");
    let node = translation;
    for (const p of parts) { if (node == null) break; node = node[p]; }
    return typeof node === "string" ? node : key;
  };

  return (
    <TranslationProvider locale={lang} translation={translation}>
      <a href="#main-content" className="skip-link">
        {tServer("a11y.skipToContent")}
      </a>

      <Navbar
        lang={lang}
        theme={theme}
        languages={LANGUAGES}
        themes={THEMES}
      />

      <main id="main-content" className="flex-1">{children}</main>

      <ConditionalFooter>
        <Footer lang={lang} />
      </ConditionalFooter>
    </TranslationProvider>
  );
}