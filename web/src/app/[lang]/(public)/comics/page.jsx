// src/app/[lang]/(public)/comics/page.jsx
import ComicsListPage from "@/features/comic/comiclist/ComicsListPage";
import { getComicsByLanguage } from "@/data/comics";

// Generate metadata for SEO with language support
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const currentLanguage = lang || "en";

  // Fetch comics data for metadata
  const comics = getComicsByLanguage(currentLanguage);
  const totalComics = comics?.length || 0;
  const categories = [
    ...new Set(comics?.map((comic) => comic.category).filter(Boolean)),
  ];

  const titles = {
    en: `Browse Comics | BookQubit`,
    hi: `कॉमिक्स ब्राउज़ करें | BookQubit`,
    ur: `کامکس براؤز کریں | BookQubit`,
    ar: `تصفح القصص المصورة | BookQubit`,
    bn: `কমিকস ব্রাউজ করুন | BookQubit`,
    es: `Explorar Cómics | BookQubit`,
    fr: `Parcourir les Bandes Dessinées | BookQubit`,
    de: `Comics durchsuchen | BookQubit`,
    ja: `漫画を探す | BookQubit`,
    zh: `浏览漫画 | BookQubit`,
  };

  const descriptions = {
    en: `Explore ${totalComics}+ comics across ${categories.length}+ categories including Manga, Superhero, Graphic Novels, Webtoons, and more. Find your next favorite comic series on BookQubit.`,
    hi: `${totalComics}+ कॉमिक्स और ${categories.length}+ श्रेणियों में मंगा, सुपरहीरो, ग्राफिक उपन्यास, वेबटून और बहुत कुछ देखें। BookQubit पर अपनी अगली पसंदीदा कॉमिक श्रृंखला खोजें।`,
    ur: `${totalComics}+ کامکس اور ${categories.length}+ زمروں میں مانگا، سپر ہیرو، گرافک ناول، ویب ٹونز اور مزید دریافت کریں۔ BookQubit پر اپنی اگلی پسندیدہ کامکس سیریز تلاش کریں۔`,
    ar: `استكشف ${totalComics}+ قصة مصورة عبر ${categories.length}+ فئة بما في ذلك المانجا والأبطال الخارقين والروايات المصورة والويبتونز والمزيد. ابحث عن سلسلة القصص المصورة المفضلة لديك على BookQubit.`,
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bookqubit.com";
  const canonicalUrl = `${baseUrl}/${currentLanguage}/comics`;

  // Generate alternate language URLs
  const alternateLanguages = {
    en: `${baseUrl}/en/comics`,
    hi: `${baseUrl}/hi/comics`,
    ur: `${baseUrl}/ur/comics`,
    ar: `${baseUrl}/ar/comics`,
    bn: `${baseUrl}/bn/comics`,
    es: `${baseUrl}/es/comics`,
    fr: `${baseUrl}/fr/comics`,
    de: `${baseUrl}/de/comics`,
    ja: `${baseUrl}/ja/comics`,
    zh: `${baseUrl}/zh/comics`,
  };

  return {
    title: titles[currentLanguage] || titles.en,
    description: descriptions[currentLanguage] || descriptions.en,
    keywords: [
      "comics",
      "manga",
      "graphic novels",
      "webtoons",
      "superhero comics",
      "comic books",
      currentLanguage === "hi" ? "कॉमिक्स" : "read comics online",
      "comic categories",
      "browse comics",
      "digital comics",
      "comic series",
      currentLanguage === "hi" ? "मंगा" : "manga online",
    ].join(", "),

    // Open Graph / Facebook
    openGraph: {
      title: titles[currentLanguage] || titles.en,
      description: descriptions[currentLanguage] || descriptions.en,
      type: "website",
      url: canonicalUrl,
      siteName: "BookQubit",
      images: [
        {
          url: `/og-comics-${currentLanguage}.jpg`,
          width: 1200,
          height: 630,
          alt: `Browse Comics Collection - BookQubit in ${currentLanguage.toUpperCase()}`,
        },
      ],
      locale:
        currentLanguage === "hi"
          ? "hi_IN"
          : currentLanguage === "ur"
            ? "ur_PK"
            : currentLanguage === "ar"
              ? "ar_SA"
              : currentLanguage === "bn"
                ? "bn_BD"
                : currentLanguage === "es"
                  ? "es_ES"
                  : currentLanguage === "fr"
                    ? "fr_FR"
                    : currentLanguage === "de"
                      ? "de_DE"
                      : currentLanguage === "ja"
                        ? "ja_JP"
                        : currentLanguage === "zh"
                          ? "zh_CN"
                          : "en_US",
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: titles[currentLanguage] || titles.en,
      description: descriptions[currentLanguage] || descriptions.en,
      images: [`/twitter-card-comics-${currentLanguage}.jpg`],
      creator: "@bookqubit",
      site: "@bookqubit",
    },

    // Additional SEO
    alternates: {
      canonical: canonicalUrl,
      languages: alternateLanguages,
    },

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

    // Other metadata
    category: "comics",
    authors: [{ name: "BookQubit", url: `${baseUrl}/about` }],
    publisher: "BookQubit",
  };
}

// Generate static params for static site generation
export async function generateStaticParams() {
  const languages = [
    "en",
    "hi",
    "ur",
    "ar",
    "bn",
    "es",
    "fr",
    "de",
    "ja",
    "zh",
  ];

  return languages.map((lang) => ({
    lang: lang,
  }));
}

// Loading component for Suspense
function ComicsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto mb-4"></div>
          <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto"></div>
        </div>

        {/* Search and filter skeleton */}
        <div className="mb-12">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4"></div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Comics grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main page component
export default function ComicsPage() {
  // Structured data for SEO (JSON-LD) - language aware
  const getStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: {
        en: "Comics Collection",
        hi: "कॉमिक्स संग्रह",
        ur: "کامکس مجموعہ",
        ar: "مجموعة القصص المصورة",
      },
      description: {
        en: "Browse and discover comics by category",
        hi: "श्रेणी के अनुसार कॉमिक्स ब्राउज़ करें और खोजें",
        ur: "زمرہ کے لحاظ سے کامکس براؤز کریں اور دریافت کریں",
        ar: "تصفح واكتشاف القصص المصورة حسب الفئة",
      },
      url: "https://bookqubit.com/comics",
      isPartOf: {
        "@type": "WebSite",
        name: "BookQubit",
        url: "https://bookqubit.com",
      },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: {
              en: "Manga",
              hi: "मंगा",
              ur: "مانگا",
              ar: "المانجا",
            },
            url: "https://bookqubit.com/comics/manga",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: {
              en: "Superhero Comics",
              hi: "सुपरहीरो कॉमिक्स",
              ur: "سپر ہیرو کامکس",
              ar: "قصص الأبطال الخارقين المصورة",
            },
            url: "https://bookqubit.com/comics/superhero",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: {
              en: "Graphic Novels",
              hi: "ग्राफिक उपन्यास",
              ur: "گرافک ناول",
              ar: "الروايات المصورة",
            },
            url: "https://bookqubit.com/comics/graphic-novels",
          },
          {
            "@type": "ListItem",
            position: 4,
            name: {
              en: "Webtoons",
              hi: "वेबटून",
              ur: "ویب ٹونز",
              ar: "الويبتونز",
            },
            url: "https://bookqubit.com/comics/webtoons",
          },
          {
            "@type": "ListItem",
            position: 5,
            name: {
              en: "Independent Comics",
              hi: "स्वतंत्र कॉमिक्स",
              ur: "آزاد کامکس",
              ar: "القصص المصورة المستقلة",
            },
            url: "https://bookqubit.com/comics/independent",
          },
        ],
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://bookqubit.com/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    };
  };

  const structuredData = getStructuredData();

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <ComicsListPage />
    </>
  );
}
