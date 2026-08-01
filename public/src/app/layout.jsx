import Script from "next/script";
import "./globals.css";
import { getLang, RTL } from "@/lib/lang";
import { getTheme } from "@/lib/theme";
import { ToastProvider } from "@/components/Toast";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://bookqubit.com"),
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
    <html lang={lang} dir={RTL.includes(lang) ? "rtl" : "ltr"} data-theme={theme}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="alternate" type="application/rss+xml" title="BookQubit — New Releases" href="/feed.xml" />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-BXT9J1YW9J" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BXT9J1YW9J', { send_page_view: false });
          `}
        </Script>
        <GoogleAnalytics />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
