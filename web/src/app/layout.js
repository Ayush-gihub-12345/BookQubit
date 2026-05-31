import Script from "next/script";

import ThemeProvider from "@/themes/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import RTLProvider from "@/contexts/RTLContext";
import { FontProvider } from "@/contexts/FontContext";

import "./globals.css";

export const metadata = {
  // Main Domain
  metadataBase: new URL("https://bookqubit.com"),

  applicationName: "BookQubit",

  appleWebApp: {
    capable: true,
    title: "BookQubit",
    statusBarStyle: "default",
  },

  title: {
    default: "BookQubit – Discover Books, Read Previews & Smart Summaries Online",
    template: "%s | BookQubit",
  },

  description: "Discover books you'll love with BookQubit. Read previews, explore detailed summaries, and find your next great read with confidence.",

  keywords: [
    "books", "book summaries", "book previews", "book discovery",
    "reading app", "BookQubit", "ebooks", "novels", "online books",
    "book reviews", "book recommendations",
  ],

  authors: [{ name: "BookQubit" }],
  creator: "BookQubit",
  publisher: "BookQubit",
  category: "books",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://bookqubit.com",
    languages: {
      'en': 'https://bookqubit.com/en',
      'hi': 'https://bookqubit.com/hi',
      'ur': 'https://bookqubit.com/ur',
      'ar': 'https://bookqubit.com/ar',
      'bn': 'https://bookqubit.com/bn',
      'zh': 'https://bookqubit.com/zh',
      'fr': 'https://bookqubit.com/fr',
      'de': 'https://bookqubit.com/de',
      'ja': 'https://bookqubit.com/ja',
      'ko': 'https://bookqubit.com/ko',
      'ru': 'https://bookqubit.com/ru',
      'it': 'https://bookqubit.com/it',
      'es': 'https://bookqubit.com/es',
      'ta': 'https://bookqubit.com/ta',
      'te': 'https://bookqubit.com/te',
    },
  },

  manifest: "/favicons/site.webmanifest",

  icons: {
    icon: [
      { url: "/favicons/favicon.ico" },
      { url: "/favicons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicons/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["hi_IN", "ur_PK", "ar_SA", "bn_BD", "zh_CN", "fr_FR", "de_DE", "ja_JP", "ko_KR", "ru_RU", "it_IT", "es_ES", "ta_IN", "te_IN"],
    url: "https://bookqubit.com",
    siteName: "BookQubit",
    title: "BookQubit | Book Discovery, Previews, Details & Smart Summaries",
    description: "Discover your next favorite book with BookQubit. Explore detailed previews, in-depth book details, and concise summaries.",
    images: [
      {
        url: "https://bookqubit.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BookQubit - Smart Reading Platform",
        type: "image/jpeg",
      },
      {
        url: "https://bookqubit.com/og-image-square.jpg",
        width: 600,
        height: 600,
        alt: "BookQubit Logo",
        type: "image/jpeg",
      },
    ],
    emails: ["contact@bookqubit.com"],
    phoneNumbers: ["+1-234-567-8900"],
    faxNumbers: ["+1-234-567-8901"],
  },

  twitter: {
    card: "summary_large_image",
    site: "@bookqubit",
    siteId: "1234567890",
    creator: "@bookqubit",
    creatorId: "1234567890",
    title: "BookQubit | Book Discovery, Previews, Details & Smart Summaries",
    description: "Discover books, previews, summaries, and detailed reading insights on BookQubit.",
    images: [
      {
        url: "https://bookqubit.com/twitter-card.jpg",
        alt: "BookQubit Twitter Card",
        width: 1200,
        height: 600,
      },
    ],
  },

  verification: {
    google: "qjvxvVO6qUEdHhidcz7qeUdwGWrklQZOMYE5CZN-paw",
    yandex: "3413ce67b7b5bd51",
    bing: "79A82530E831502EBB89097AE87D6AE9",
    pinterest: "16cbeead871ab4c02072d92867663687",
    facebook: "fcawf09giaubqtu62k97gw1qo81uu0", // ✅ Fixed: Added actual Facebook verification code
    other: {
      "msvalidate.01": "79A82530E831502EBB89097AE87D6AE9",
      "p:domain_verify": "16cbeead871ab4c02072d92867663687",
      "facebook-domain-verification": "fcawf09giaubqtu62k97gw1qo81uu0", // ✅ Fixed: Replaced placeholder with actual code
    },
  },

  category: "Books",
  section: "Book Discovery Platform",
  classification: "Book Discovery & Reading Platform",
  referrer: "strict-origin-when-cross-origin",

  formatDetection: {
    email: true,
    address: false,
    telephone: true,
  },

  appLinks: {
    ios: {
      url: "https://bookqubit.com/app",
      app_store_id: "1234567890",
      app_name: "BookQubit",
    },
    android: {
      package: "com.bookqubit.app",
      app_name: "BookQubit",
    },
  },
};

// Separate viewport export (required for Next.js 15+)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager - Main Script (placed high in <head>) */}
        <Script
          id="gtm-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-PVP9RM4X');
            `,
          }}
        />

        {/* Charset */}
        <meta charSet="utf-8" />

        {/* Canonical */}
        <link rel="canonical" href="https://bookqubit.com" />

        {/* Application Name */}
        <meta name="application-name" content="BookQubit" />
        <meta name="apple-mobile-web-app-title" content="BookQubit" />
        <meta property="og:site_name" content="BookQubit" />

        {/* Google Site Verification */}
        <meta
          name="google-site-verification"
          content="qjvxvVO6qUEdHhidcz7qeUdwGWrklQZOMYE5CZN-paw"
        />

        {/* Bing Verification */}
        <meta name="msvalidate.01" content="79A82530E831502EBB89097AE87D6AE9" />

        {/* Yandex Verification */}
        <meta name="yandex-verification" content="3413ce67b7b5bd51" />

        {/* Pinterest Verification */}
        <meta name="p:domain_verify" content="16cbeead871ab4c02072d92867663687" />
        <meta name="pinterest" content="16cbeead871ab4c02072d92867663687" />

        {/* Facebook Verification - ✅ FIXED with actual code */}
        <meta
          name="facebook-domain-verification"
          content="fcawf09giaubqtu62k97gw1qo81uu0"
        />

        {/* Browser Config */}
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Referrer */}
        <meta name="referrer" content="no-referrer-when-downgrade" />

        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicons/favicon.ico" />
        <link rel="shortcut icon" href="/favicons/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicons/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/favicons/favicon.svg"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicons/apple-touch-icon.png"
        />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/favicons/web-app-manifest-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/favicons/web-app-manifest-512x512.png"
        />

        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        {/* RSS Feed */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="BookQubit Feed"
          href="/feed.xml"
        />

        {/* Alternate Languages */}
        <link rel="alternate" href="https://bookqubit.com" hrefLang="en" />
        <link rel="alternate" href="https://bookqubit.com/hi" hrefLang="hi" />
        <link rel="alternate" href="https://bookqubit.com/ur" hrefLang="ur" />
        <link rel="alternate" href="https://bookqubit.com/ar" hrefLang="ar" />
        <link rel="alternate" href="https://bookqubit.com/bn" hrefLang="bn" />
        <link rel="alternate" href="https://bookqubit.com/zh" hrefLang="zh" />
        <link rel="alternate" href="https://bookqubit.com/fr" hrefLang="fr" />
        <link rel="alternate" href="https://bookqubit.com/de" hrefLang="de" />
        <link rel="alternate" href="https://bookqubit.com/ja" hrefLang="ja" />
        <link rel="alternate" href="https://bookqubit.com/ko" hrefLang="ko" />
        <link rel="alternate" href="https://bookqubit.com/ru" hrefLang="ru" />
        <link rel="alternate" href="https://bookqubit.com/it" hrefLang="it" />
        <link rel="alternate" href="https://bookqubit.com/es" hrefLang="es" />
        <link rel="alternate" href="https://bookqubit.com/ta" hrefLang="ta" />
        <link rel="alternate" href="https://bookqubit.com/te" hrefLang="te" />
        <link rel="alternate" href="https://bookqubit.com" hrefLang="x-default" />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://bookqubit.com/#organization",
              name: "BookQubit",
              url: "https://bookqubit.com",
              logo: {
                "@type": "ImageObject",
                url: "https://bookqubit.com/favicons/apple-touch-icon.png",
                width: 180,
                height: 180,
              },
              sameAs: [
                "https://twitter.com/bookqubit",
                "https://facebook.com/bookqubit",
                "https://instagram.com/bookqubit",
                "https://pinterest.com/bookqubit",
                "https://linkedin.com/company/bookqubit",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+1-234-567-8900",
                contactType: "customer service",
                email: "contact@bookqubit.com",
                availableLanguage: ["English", "Hindi", "Urdu", "Arabic", "Bengali", "Chinese", "French", "German", "Japanese", "Korean", "Russian", "Italian", "Spanish", "Tamil", "Telugu"],
              },
              foundingDate: "2024",
              founders: [
                {
                  "@type": "Person",
                  name: "BookQubit Team",
                },
              ],
              address: {
                "@type": "PostalAddress",
                addressCountry: "IN",
              },
            }),
          }}
        />

        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://bookqubit.com/#website",
              url: "https://bookqubit.com",
              name: "BookQubit",
              description: "Discover books you'll love with BookQubit. Read previews, explore detailed summaries, and find your next great read with confidence.",
              potentialAction: {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://bookqubit.com/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string",
              },
              inLanguage: ["en", "hi", "ur", "ar", "bn", "zh", "fr", "de", "ja", "ko", "ru", "it", "es", "ta", "te"],
            }),
          }}
        />

        {/* Structured Data - BreadcrumbList (Home) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://bookqubit.com",
                },
              ],
            }),
          }}
        />
      </head>

      <body className="antialiased">
        {/* Google Tag Manager (noscript) - Immediately after opening <body> */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PVP9RM4X"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Pinterest Tag (Optional - Replace YOUR_PINTEREST_TAG_ID) */}
        <Script
          id="pinterest-tag"
          strategy="afterInteractive"
        >
          {`
            !function(e){if(!window.pintrk){window.pintrk = function () {
            window.pintrk.queue.push(Array.prototype.slice.call(arguments))};
            var n=window.pintrk;n.queue=[],n.version="3.0";var
            t=document.createElement("script");t.async=!0,t.src=e;var
            r=document.getElementsByTagName("script")[0];
            r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
            pintrk('load', 'YOUR_PINTEREST_TAG_ID');
            pintrk('page');
          `}
        </Script>

        <ThemeProvider>
          <LanguageProvider>
            <RTLProvider>
              <FontProvider>
                {children}
              </FontProvider>
            </RTLProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}