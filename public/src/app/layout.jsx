import { Inter, Sora } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { getLang, RTL } from "@/lib/lang";
import { getTheme } from "@/lib/theme";
import { ToastProvider } from "@/components/Toast";
import GoogleAnalytics from "@/components/GoogleAnalytics";

// Self-hosted via next/font instead of a <link> to fonts.googleapis.com —
// removes two render-blocking cross-origin requests (stylesheet + font file
// round trips) from the critical path entirely; the font is served from our
// own origin and inlined at build time. Variable names feed the existing
// --font-body/--font-display custom properties in globals.css.
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter-loaded", display: "swap" });
const sora = Sora({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-sora-loaded", display: "swap" });

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
    <html lang={lang} dir={RTL.includes(lang) ? "rtl" : "ltr"} data-theme={theme} className={`${inter.variable} ${sora.variable}`}>
      <head>
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
