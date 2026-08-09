import Script from "next/script";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

// Self-hosted at build time rather than fetched from fonts.googleapis.com.
// The old <link rel="stylesheet"> to Google Fonts was render-blocking and on
// a third-party origin, so a mobile visitor paid DNS + TLS + CSS download to
// googleapis.com, and only THEN discovered the actual font files on a second
// origin (gstatic.com) — all before anything could paint. Lighthouse measured
// it as the biggest single blocker on mobile (render-blocking requests, ~1,030
// ms, with LCP at 8.3s).
//
// next/font downloads these at build time and serves them from our own origin
// with the CSS inlined, so there's no blocking round-trip and no extra origins.
// `display: "swap"` keeps text visible in a fallback face while they load.
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
        {/* No font <link> here any more — next/font inlines the @font-face
            rules and serves the files from this origin, so the preconnects to
            googleapis/gstatic aren't needed either (they were warming up
            connections we no longer make). */}
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
