import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getLang, RTL, LANGUAGES } from "@/lib/lang";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://bookqubit.com"),
  title: { default: "BookQubit — Discover, Summarize & Buy Great Books", template: "%s | BookQubit" },
  description:
    "Explore curated books, summaries, key insights, authors, publishers and comics — in 12 languages. Find your next great read on BookQubit.",
  openGraph: { siteName: "BookQubit", type: "website" },
};

export default async function RootLayout({ children }) {
  const lang = await getLang();
  return (
    <html lang={lang} dir={RTL.includes(lang) ? "rtl" : "ltr"}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <Navbar lang={lang} languages={LANGUAGES} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
