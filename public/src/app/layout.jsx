import Script from "next/script";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

// Downloaded at build time and served from our own origin, instead of the
// runtime <link> to fonts.googleapis.com that used to live in <head>.
//
// That link was render-blocking AND cross-origin, so a mobile visitor paid
// DNS + TLS + CSS download to googleapis.com and only THEN discovered the
// font files on a second origin (gstatic.com) — all before first paint.
// Lighthouse measured it as the largest single blocker on mobile
// (render-blocking requests ~1,030 ms, with LCP at 8.3s).
//
// next/font inlines the @font-face rules and serves the files locally, so
// there is no blocking round-trip and no extra origins. `display: "swap"`
// keeps text readable in a fallback face while they load.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});
const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});
import { getLang, RTL } from "@/lib/lang";
import { getTheme } from "@/lib/theme";
import { ToastProvider } from "@/components/Toast";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://www.bookqubit.shop"),
  title: { default: "BookQubit — Discover, Summarize & Buy Great Books", template: "%s | BookQubit" },
  description:
    "Explore curated books, summaries, key insights, authors, publishers and comics — in 21 languages. Find your next great read on BookQubit.",
  openGraph: { siteName: "BookQubit", type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport = {
  themeColor: "#4f46e5",
};

export default async function RootLayout({ children }) {
  const [lang, theme] = await Promise.all([getLang(), getTheme()]);

  return (
    <html
      lang={lang}
      dir={RTL.includes(lang) ? "rtl" : "ltr"}
      data-theme={theme}
      className={`${inter.variable} ${sora.variable}`}
    >
      <head>
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
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-2MX9WZ1SPL" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2MX9WZ1SPL', { send_page_view: false });
          `}
        </Script>
        <GoogleAnalytics />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
