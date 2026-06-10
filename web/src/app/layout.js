// src/app/layout.js
import Script from "next/script";
import { headers } from "next/headers";

import ThemeProvider from "@/themes/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import RTLProvider from "@/contexts/RTLContext";
import { FontProvider } from "@/contexts/FontContext";

import "./globals.css";

// Supported languages for dynamic metadata
const supportedLanguages = {
  en: { name: "English", dir: "ltr", locale: "en_US" },
  hi: { name: "Hindi", dir: "ltr", locale: "hi_IN" },
  ur: { name: "Urdu", dir: "rtl", locale: "ur_PK" },
  ar: { name: "Arabic", dir: "rtl", locale: "ar_SA" },
  bn: { name: "Bangla", dir: "ltr", locale: "bn_BD" },
  zh: { name: "Chinese", dir: "ltr", locale: "zh_CN" },
  fr: { name: "French", dir: "ltr", locale: "fr_FR" },
  de: { name: "German", dir: "ltr", locale: "de_DE" },
  ja: { name: "Japanese", dir: "ltr", locale: "ja_JP" },
  ko: { name: "Korean", dir: "ltr", locale: "ko_KR" },
  ru: { name: "Russian", dir: "ltr", locale: "ru_RU" },
  it: { name: "Italian", dir: "ltr", locale: "it_IT" },
  es: { name: "Spanish", dir: "ltr", locale: "es_ES" },
  ta: { name: "Tamil", dir: "ltr", locale: "ta_IN" },
  te: { name: "Telugu", dir: "ltr", locale: "te_IN" },
  ml: { name: "Malayalam", dir: "ltr", locale: "ml_IN" },
  kn: { name: "Kannada", dir: "ltr", locale: "kn_IN" },
  mr: { name: "Marathi", dir: "ltr", locale: "mr_IN" },
  ps: { name: "Pashto", dir: "rtl", locale: "ps_AF" },
  fa: { name: "Persian", dir: "rtl", locale: "fa_IR" },
};

// Generate metadata dynamically based on language
export async function generateMetadata({ params }) {
  // Try to get language from params or headers
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const segments = pathname.split("/").filter(Boolean);
  const langCode = segments[0] || "en";
  
  const currentLang = supportedLanguages[langCode] ? langCode : "en";
  const langData = supportedLanguages[currentLang];
  
  const titles = {
    en: "BookQubit – Discover Books, Read Previews & Smart Summaries Online",
    hi: "BookQubit – किताबें खोजें, पूर्वावलोकन पढ़ें और स्मार्ट सारांश ऑनलाइन देखें",
    ur: "BookQubit – کتابیں دریافت کریں، پیش نظارہ پڑھیں اور سمارٹ خلاصے آن لائن دیکھیں",
    ar: "BookQubit – اكتشف الكتب، اقرأ المعاينات والملخصات الذكية عبر الإنترنت",
    bn: "BookQubit – বই আবিষ্কার করুন, প্রিভিউ পড়ুন এবং স্মার্ট সারাংশ অনলাইনে দেখুন",
    zh: "BookQubit – 发现书籍、阅读预览和智能摘要在线",
    fr: "BookQubit – Découvrez des livres, lisez des aperçus et des résumés intelligents en ligne",
    de: "BookQubit – Entdecken Sie Bücher, lesen Sie Vorschauen und intelligente Zusammenfassungen online",
    ja: "BookQubit – 本を発見、プレビューを読む、スマートな要約をオンラインで",
    ko: "BookQubit – 도서 발견, 미리보기 읽기 및 스마트 요약 온라인",
    ru: "BookQubit – Открывайте книги, читайте превью и умные резюме онлайн",
    it: "BookQubit – Scopri libri, leggi anteprime e riassunti intelligenti online",
    es: "BookQubit – Descubre libros, lee vistas previas y resúmenes inteligentes en línea",
    ta: "BookQubit – புத்தகங்களைக் கண்டறியவும், முன்னோட்டங்களைப் படிக்கவும், ஸ்மார்ட் சுருக்கங்களை ஆன்லைனில் காணவும்",
    te: "BookQubit – పుస్తకాలను కనుగొనండి, ప్రివ్యూలను చదవండి మరియు స్మార్ట్ సారాంశాలు ఆన్‌లైన్లో చూడండి",
  };
  
  const descriptions = {
    en: "Discover books you'll love with BookQubit. Read previews, explore detailed summaries, and find your next great read with confidence.",
    hi: "BookQubit के साथ उन किताबों को खोजें जिन्हें आप पसंद करेंगे। पूर्वावलोकन पढ़ें, विस्तृत सारांश देखें, और आत्मविश्वास के साथ अपनी अगली महान पुस्तक खोजें।",
    ur: "BookQubit کے ساتھ وہ کتابیں دریافت کریں جنہیں آپ پسند کریں گے۔ پیش نظارہ پڑھیں، تفصیلی خلاصے دیکھیں، اور اعتماد کے ساتھ اپنی اگلی عظیم کتاب تلاش کریں۔",
    ar: "اكتشف الكتب التي ستحبها مع BookQubit. اقرأ المعاينات، واستكشف الملخصات التفصيلية، واعثر على قراءتك العظيمة القادمة بثقة.",
    bn: "BookQubit এর মাধ্যমে আপনি ভালোবাসবেন এমন বই আবিষ্কার করুন। প্রিভিউ পড়ুন, বিস্তারিত সারাংশ অন্বেষণ করুন, এবং আত্মবিশ্বাসের সাথে আপনার পরবর্তী দুর্দান্ত পড়া খুঁজুন।",
  };
  
  const baseUrl = "https://bookqubit.com";
  const currentUrl = `${baseUrl}/${currentLang}`;
  
  // Build alternate languages for hreflang
  const alternateLanguages = {};
  for (const [code, data] of Object.entries(supportedLanguages)) {
    alternateLanguages[code] = `${baseUrl}/${code}`;
  }
  alternateLanguages["x-default"] = `${baseUrl}/en`;
  
  return {
    metadataBase: new URL(baseUrl),
    applicationName: "BookQubit",
    title: {
      default: titles[currentLang] || titles.en,
      template: `%s | BookQubit`,
    },
    description: descriptions[currentLang] || descriptions.en,
    keywords: [
      "books", "book summaries", "book previews", "book discovery",
      "reading app", "BookQubit", "ebooks", "novels", "online books",
      "book reviews", "book recommendations",
    ],
    authors: [{ name: "BookQubit", url: `${baseUrl}/about` }],
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
      canonical: currentUrl,
      languages: alternateLanguages,
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
      locale: langData.locale,
      alternateLocale: Object.values(supportedLanguages).map(l => l.locale),
      url: currentUrl,
      siteName: "BookQubit",
      title: titles[currentLang] || titles.en,
      description: descriptions[currentLang] || descriptions.en,
      images: [
        {
          url: `${baseUrl}/og-image-${currentLang}.jpg`,
          width: 1200,
          height: 630,
          alt: `BookQubit - Smart Reading Platform in ${langData.name}`,
          type: "image/jpeg",
        },
        {
          url: `${baseUrl}/og-image-square.jpg`,
          width: 600,
          height: 600,
          alt: "BookQubit Logo",
          type: "image/jpeg",
        },
      ],
      emails: ["contact@bookqubit.com"],
      phoneNumbers: ["+1-234-567-8900"],
    },
    twitter: {
      card: "summary_large_image",
      site: "@bookqubit",
      siteId: "1234567890",
      creator: "@bookqubit",
      creatorId: "1234567890",
      title: titles[currentLang] || titles.en,
      description: descriptions[currentLang] || descriptions.en,
      images: [
        {
          url: `${baseUrl}/twitter-card-${currentLang}.jpg`,
          alt: `BookQubit Twitter Card - ${langData.name}`,
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
      facebook: "fcawf09giaubqtu62k97gw1qo81uu0",
      other: {
        "msvalidate.01": "79A82530E831502EBB89097AE87D6AE9",
        "p:domain_verify": "16cbeead871ab4c02072d92867663687",
        "facebook-domain-verification": "fcawf09giaubqtu62k97gw1qo81uu0",
      },
    },
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
}

// Viewport export
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
    <html>
      <head>
        {/* Google Tag Manager */}
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

        <meta charSet="utf-8" />
        
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title="BookQubit Feed" href="/feed.xml" />

        {/* Browser Config */}
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Structured Data - Organization (Language-agnostic) */}
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
                availableLanguage: Object.values(supportedLanguages).map(l => l.name),
              },
              foundingDate: "2024",
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
              inLanguage: Object.keys(supportedLanguages),
            }),
          }}
        />
      </head>

      <body className="antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PVP9RM4X"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

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