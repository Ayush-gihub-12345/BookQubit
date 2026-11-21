import Script from "next/script";
import {
  Noto_Sans, Noto_Sans_Devanagari, Noto_Sans_Bengali, Noto_Sans_Tamil, Noto_Sans_Telugu,
  Noto_Sans_Gujarati, Noto_Sans_Kannada, Noto_Sans_Malayalam, Noto_Sans_Gurmukhi,
  Noto_Sans_Arabic, Noto_Nastaliq_Urdu, Literata,
} from "next/font/google";
import "./globals.css";

// One type family across every script the site ships a UI in.
//
// The site offers 21 interface languages, ten of them Indian, but it used to
// load only Inter and Sora with `subsets: ["latin"]`. A Hindi page therefore
// rendered its Devanagari in whatever the visitor's device happened to have
// (verified on production: /hi carries ~450 Devanagari characters and loads
// only Inter's Latin glyphs), so the product's headline promise looked
// different — and often worse — on every phone.
//
// Noto Sans is one design across Latin, Cyrillic, Devanagari and the other
// scripts below, so a reader in Tamil gets the same weight and rhythm as one
// in English. Every face is declared here but costs an English visitor
// nothing: each @font-face carries a unicode-range for its own script, and
// characters from that range. `preload` is off for all of them except the
// Latin face, so no script a visitor doesn't use is ever fetched early.
// (Options are written out per call because next/font only accepts values it
// can read statically; a shared spread object is a build error.)
//
// CJK (zh/ja/ko) deliberately stays on the system fonts: those are good on
// every platform and a web CJK face is several MB.
const noto = Noto_Sans({ display: "swap", subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-noto" });
const deva = Noto_Sans_Devanagari({ display: "swap", preload: false, subsets: ["devanagari"], variable: "--font-deva" });
const beng = Noto_Sans_Bengali({ display: "swap", preload: false, subsets: ["bengali"], variable: "--font-beng" });
const taml = Noto_Sans_Tamil({ display: "swap", preload: false, subsets: ["tamil"], variable: "--font-taml" });
const telu = Noto_Sans_Telugu({ display: "swap", preload: false, subsets: ["telugu"], variable: "--font-telu" });
const gujr = Noto_Sans_Gujarati({ display: "swap", preload: false, subsets: ["gujarati"], variable: "--font-gujr" });
const knda = Noto_Sans_Kannada({ display: "swap", preload: false, subsets: ["kannada"], variable: "--font-knda" });
const mlym = Noto_Sans_Malayalam({ display: "swap", preload: false, subsets: ["malayalam"], variable: "--font-mlym" });
const guru = Noto_Sans_Gurmukhi({ display: "swap", preload: false, subsets: ["gurmukhi"], variable: "--font-guru" });
const arab = Noto_Sans_Arabic({ display: "swap", preload: false, subsets: ["arabic"], variable: "--font-arab" });
// Urdu is conventionally set in Nastaliq, not the Naskh-style Arabic face.
const urdu = Noto_Nastaliq_Urdu({ display: "swap", preload: false, subsets: ["arabic"], variable: "--font-urdu" });
// Headings only. A variable font, so every weight is one file; `preload` stays
// on because the page title is usually the largest thing on screen.
const literata = Literata({ display: "swap", subsets: ["latin", "latin-ext"], variable: "--font-literata" });
const FONT_VARS = [literata, noto, deva, beng, taml, telu, gujr, knda, mlym, guru, arab, urdu].map((f) => f.variable).join(" ");
import { getLang, RTL } from "@/lib/lang";
import { getTheme, getCustomThemeColors, SYSTEM_THEME_SCRIPT, THEMES } from "@/lib/theme";
import { paletteToCssVars } from "@/lib/customTheme";
import { ToastProvider } from "@/components/Toast";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import EnvBanner from "@/components/EnvBanner";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import ThemeColorSync from "@/components/ThemeColorSync";
import { isDevEnv } from "@/lib/env";
import { SITE_URL } from "@/lib/site";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "BookQubit — Discover, Summarize & Buy Great Books", template: "%s | BookQubit" },
  description:
    "Explore curated books, summaries, key insights, authors, publishers and comics — in 21 languages. Find your next great read on BookQubit.",
  openGraph: { siteName: "BookQubit", type: "website" },
  twitter: { card: "summary_large_image" },
};

// The browser/app chrome (status bar, and the bottom bar of an installed app) takes the page's own background colour,
// like YouTube does, instead of a fixed brand colour. "Match device" follows the OS light/dark setting.
export async function generateViewport() {
  const id = await getTheme();
  const t = THEMES.find((x) => x.id === id);
  return {
    themeColor: id === "system"
      ? [{ media: "(prefers-color-scheme: light)", color: "#f7f3ea" }, { media: "(prefers-color-scheme: dark)", color: "#121110" }]
      : t ? t.bg : "#f7f3ea",
    viewportFit: "cover", // lets env(safe-area-inset-*) work on notched phones
  };
}

export default async function RootLayout({ children }) {
  // The dev deployment must not feed the production Google Analytics property:
  // its traffic is test traffic and would pollute the real numbers.
  const devEnv = isDevEnv();
  const [lang, theme] = await Promise.all([getLang(), getTheme()]);
  // Only reads the customTheme cookie when it could possibly matter — every
  // other theme switch is a plain CSS-class-driven [data-theme="X"] block,
  // no extra cookie read needed.
  const customColors = theme === "custom" ? await getCustomThemeColors() : null;
  const customStyle = customColors ? paletteToCssVars(customColors) : undefined;

  return (
    <html
      lang={lang}
      dir={RTL.includes(lang) ? "rtl" : "ltr"}
      data-theme={theme === "system" ? "light" : theme}
      suppressHydrationWarning
      style={customStyle}
      translate="no"
      className={`${FONT_VARS} notranslate`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SYSTEM_THEME_SCRIPT }} />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        {/* The site already ships its own translation/transliteration for
            every language (i18n.js dictionaries, Translated/TitleTransliterated
            components) — Chrome's own "Translate this page?" prompt only
            confuses things on top of that (it sees a `lang` attribute that
            doesn't match the mostly-English HTML Chrome parses before our
            client-side translation swaps text in). `notranslate` + `translate="no"`
            tells Chrome (and other browsers honoring the convention) to never
            offer its own translate UI here. */}
        <meta name="google" content="notranslate" />
        {/* No font <link> — next/font inlines @font-face and serves the files
            from this origin, so the googleapis/gstatic preconnects are gone
            too (they warmed connections we no longer make).
            Preconnect to the cover CDN instead: every card image comes from
            there, so paying that handshake early is a real win. */}
        <link rel="preconnect" href="https://covers.openlibrary.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://covers.openlibrary.org" />
        <link rel="alternate" type="application/rss+xml" title="BookQubit — New Releases" href="/feed.xml" />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <EnvBanner />
        {!devEnv && (
          <>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-42XWW9D7JK" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            // send_page_view: false — GoogleAnalytics.jsx fires page_view itself
            // on every App Router navigation (see its comment for why: gtag's
            // own auto-pageview only fires once, on the initial full load).
            gtag('config', 'G-42XWW9D7JK', { send_page_view: false });
          `}
        </Script>
        <GoogleAnalytics />
        <ServiceWorkerRegister />
        <ThemeColorSync />
          </>
        )}
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
