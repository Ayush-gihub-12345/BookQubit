// src/app/[lang]/(public)/comics/[slug]/page.jsx
import { ComicsDetailsPage } from "@/features/comic/comicdeatils";
import { getComicsByLanguage } from "@/data/comics/index";

// Force dynamic rendering to avoid static generation issues
export const dynamic = "force-dynamic";
export const dynamicParams = true;

// Helper function to get language-specific slug field name
const getSlugFieldName = (language) => {
  const slugMap = {
    hi: "hindiSlug",
    ur: "urduSlug",
    ar: "arabicSlug",
    bn: "bengaliSlug",
    es: "spanishSlug",
    fr: "frenchSlug",
    de: "germanSlug",
    ja: "japaneseSlug",
    zh: "chineseSlug",
    ru: "russianSlug",
    it: "italianSlug",
    ko: "koreanSlug",
  };
  return slugMap[language] || "slug";
};

// Generate metadata for SEO with language from URL
export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;
    const currentLanguage = resolvedParams?.lang || "en";

    if (!slug) {
      return {
        title: "Comic Not Found | BookQubit",
        description: "The requested comic could not be found.",
        robots: { index: false },
      };
    }

    const comics = getComicsByLanguage(currentLanguage);
    const slugField = getSlugFieldName(currentLanguage);

    const comic = comics?.find((c) => {
      if (!c) return false;
      // Check regular slug
      if (c.slug === slug) return true;
      // Check language-specific slug (e.g., hindiSlug for Hindi)
      if (c[slugField] === slug) return true;
      // Check decoded URI component (for special characters like Devanagari)
      const decodedSlug = decodeURIComponent(slug);
      if (c[slugField] === decodedSlug) return true;
      if (c.slug === decodedSlug) return true;
      return false;
    });

    if (!comic) {
      return {
        title: "Comic Not Found | BookQubit",
        description:
          "The requested comic could not be found. Explore our collection of comics and graphic novels.",
        robots: { index: false },
      };
    }

    // Build author string from multiple creators
    const creators = [];
    if (comic.author) creators.push(comic.author);
    if (comic.artist) creators.push(comic.artist);
    if (comic.writer) creators.push(comic.writer);
    const authorString = creators.join(", ");

    // Build keywords from comic metadata
    const keywords = [
      comic.title,
      comic.genre,
      comic.series,
      ...(comic.characters || []),
      comic.author,
      comic.artist,
      "comic book",
      "graphic novel",
      currentLanguage === "en"
        ? "read comics online"
        : currentLanguage === "hi"
          ? "कॉमिक्स ऑनलाइन पढ़ें"
          : currentLanguage === "ur"
            ? "کامکس آن لائن پڑھیں"
            : currentLanguage === "ar"
              ? "قراءة القصص المصورة عبر الإنترنت"
              : currentLanguage === "es"
                ? "leer cómics en línea"
                : "lire des bandes dessinées en ligne",
    ]
      .filter(Boolean)
      .join(", ");

    const seoTitle = `${comic.title}${comic.issueNumber ? ` #${comic.issueNumber}` : ""} | ${comic.series || "Comic"} | BookQubit`;
    const seoDescription =
      comic.description?.substring(0, 160) ||
      `Read ${comic.title} by ${authorString}. ${comic.genre ? `A ${comic.genre} comic ` : ""}available online at BookQubit.`;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bookqubit.com";
    const canonicalUrl = `${baseUrl}/${currentLanguage}/comics/${comic.slug}`;

    // Generate alternate language URLs
    const alternateLanguages = {
      en: `${baseUrl}/en/comics/${comic.slug}`,
      hi: `${baseUrl}/hi/comics/${comic.hindiSlug || comic.slug}`,
      ur: `${baseUrl}/ur/comics/${comic.urduSlug || comic.slug}`,
      ar: `${baseUrl}/ar/comics/${comic.arabicSlug || comic.slug}`,
      bn: `${baseUrl}/bn/comics/${comic.bengaliSlug || comic.slug}`,
      es: `${baseUrl}/es/comics/${comic.slug}`,
      fr: `${baseUrl}/fr/comics/${comic.slug}`,
      de: `${baseUrl}/de/comics/${comic.slug}`,
      ja: `${baseUrl}/ja/comics/${comic.slug}`,
      zh: `${baseUrl}/zh/comics/${comic.slug}`,
    };

    return {
      title: seoTitle,
      description: seoDescription,
      keywords: keywords,
      authors: creators.map((name) => ({ name })),
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
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: canonicalUrl,
        siteName: "BookQubit",
        images: [
          {
            url:
              comic.image ||
              comic.coverImage ||
              `${baseUrl}/default-comic-og.jpg`,
            width: 1200,
            height: 630,
            alt: `${comic.title} cover by ${comic.artist || comic.author || "BookQubit"}`,
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
        type: "book",
        publishedTime:
          comic.publishedDate || comic.releaseDate || comic.createdAt,
        modifiedTime: comic.updatedAt || comic.publishedDate,
      },
      twitter: {
        card: "summary_large_image",
        title: seoTitle,
        description: seoDescription.substring(0, 200),
        images: [
          comic.image || comic.coverImage || `${baseUrl}/default-comic-og.jpg`,
        ],
        creator: `@${comic.twitterHandle || "BookQubit"}`,
        site: "@BookQubit",
      },
      alternates: {
        canonical: canonicalUrl,
        languages: alternateLanguages,
      },
      other: {
        rating: comic.rating || "General Audiences",
        "comic:series": comic.series,
        "comic:issue": comic.issueNumber,
        "comic:volume": comic.volume,
        "comic:genre": comic.genre,
        "comic:age_rating": comic.ageRating,
        "comic:pages": comic.pageCount,
        "comic:isbn": comic.isbn,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Comic | BookQubit",
      description: "Read comics at BookQubit",
    };
  }
}

// Generate static paths for all comics across all languages
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
  const allParams = [];

  for (const lang of languages) {
    try {
      const comics = getComicsByLanguage(lang);
      if (comics && Array.isArray(comics) && comics.length > 0) {
        for (const comic of comics) {
          if (comic && comic.slug) {
            // Add the default slug
            allParams.push({
              lang: lang,
              slug: comic.slug,
            });

            // For Hindi, also add the hindiSlug if it exists and is different
            if (
              lang === "hi" &&
              comic.hindiSlug &&
              comic.hindiSlug !== comic.slug
            ) {
              allParams.push({
                lang: lang,
                slug: comic.hindiSlug,
              });
            }

            // For Urdu, add urduSlug
            if (
              lang === "ur" &&
              comic.urduSlug &&
              comic.urduSlug !== comic.slug
            ) {
              allParams.push({
                lang: lang,
                slug: comic.urduSlug,
              });
            }

            // For Arabic, add arabicSlug
            if (
              lang === "ar" &&
              comic.arabicSlug &&
              comic.arabicSlug !== comic.slug
            ) {
              allParams.push({
                lang: lang,
                slug: comic.arabicSlug,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error generating params for language ${lang}:`, error);
    }
  }

  return allParams;
}

// Server Component
export default async function ComicDetailPage({ params }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;
    const currentLanguage = resolvedParams?.lang || "en";

    if (!slug) {
      return (
        <ComicsDetailsPage
          initialLanguage={currentLanguage}
          comicNotFound={true}
        />
      );
    }

    const comics = getComicsByLanguage(currentLanguage);

    if (!comics || !Array.isArray(comics)) {
      return (
        <ComicsDetailsPage
          initialLanguage={currentLanguage}
          comicNotFound={true}
        />
      );
    }

    const slugField = getSlugFieldName(currentLanguage);

    const comic = comics?.find((c) => {
      if (!c) return false;
      // Check regular slug
      if (c.slug === slug) return true;
      // Check language-specific slug (e.g., hindiSlug for Hindi)
      if (c[slugField] === slug) return true;
      // Check decoded URI component (for special characters like Devanagari)
      const decodedSlug = decodeURIComponent(slug);
      if (c[slugField] === decodedSlug) return true;
      if (c.slug === decodedSlug) return true;
      return false;
    });

    if (!comic) {
      console.log(
        `Comic not found. Slug: "${slug}", Language: "${currentLanguage}", Looking for field: "${slugField}"`,
      );
      return (
        <ComicsDetailsPage
          initialLanguage={currentLanguage}
          comicNotFound={true}
        />
      );
    }

    // Prepare author data
    const authorData = comic.author
      ? {
          "@type": "Person",
          name: comic.author,
          ...(comic.authorUrl && { url: comic.authorUrl }),
          ...(comic.authorSocial && { sameAs: comic.authorSocial }),
        }
      : undefined;

    const artistData = comic.artist
      ? {
          "@type": "Person",
          name: comic.artist,
          ...(comic.artistBio && { description: comic.artistBio }),
        }
      : undefined;

    const publisherData = {
      "@type": "Organization",
      name: comic.publisher || "BookQubit",
      ...(comic.publisherUrl && comic.publisher && { url: comic.publisherUrl }),
    };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bookqubit.com";

    // Build structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ComicSeries",
      name: comic.series || comic.title,
      description: comic.description?.substring(0, 300),
      url: `${baseUrl}/${currentLanguage}/comics/${comic.slug}`,
      image: comic.image || comic.coverImage,
      genre: comic.genre,
      inLanguage: currentLanguage,
      author: authorData,
      artist: artistData,
      publisher: publisherData,
      datePublished:
        comic.publishedDate || comic.releaseDate || comic.createdAt,
      dateModified: comic.updatedAt || comic.publishedDate,
      numberOfPages: comic.pageCount,
    };

    // Remove undefined values
    Object.keys(structuredData).forEach((key) => {
      if (structuredData[key] === undefined) {
        delete structuredData[key];
      }
    });

    // ComicStory schema
    const comicStorySchema = {
      "@context": "https://schema.org",
      "@type": "ComicStory",
      name: comic.title,
      description: comic.description?.substring(0, 300),
      image: comic.image,
      author: authorData,
      artist: artistData,
      genre: comic.genre,
      datePublished: comic.publishedDate,
      isPartOf: {
        "@type": "ComicSeries",
        name: comic.series || comic.title,
      },
    };

    // Remove undefined from comicStorySchema
    Object.keys(comicStorySchema).forEach((key) => {
      if (comicStorySchema[key] === undefined) {
        delete comicStorySchema[key];
      }
    });

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {comicStorySchema.author && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(comicStorySchema),
            }}
          />
        )}
        <ComicsDetailsPage
          initialLanguage={currentLanguage}
          initialSlug={slug}
          comicData={comic}
        />
      </>
    );
  } catch (error) {
    console.error("Error in ComicDetailPage:", error);
    return <ComicsDetailsPage initialLanguage="en" comicNotFound={true} />;
  }
}

export const revalidate = 3600;
