import { ComicsDetailsPage } from "@/features/comic/comicdeatils";
import { getComicsByLanguage } from "@/data/comics/index";
import { cookies } from "next/headers";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = params;

  const cookieStore = cookies();
  const language = cookieStore.get("language")?.value || "en";

  const comics = getComicsByLanguage(language);
  const comic = comics?.find((c) => c.slug === slug);

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
    language === "en"
      ? "read comics online"
      : language === "es"
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
  const canonicalUrl = `${baseUrl}/${language === "en" ? "" : language + "/"}comic/${comic.slug}`;

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
        language === "es" ? "es_ES" : language === "fr" ? "fr_FR" : "en_US",
      type: "book", // Fixed: changed from 'books.book' to 'book'
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
      languages: {
        en: `${baseUrl}/en/comic/${comic.slug}`,
        es: `${baseUrl}/es/comic/${comic.slug}`,
        fr: `${baseUrl}/fr/comic/${comic.slug}`,
      },
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
}

// Generate static paths for all comics across languages
export async function generateStaticParams() {
  const languages = ["en", "es", "fr"];
  const allParams = [];

  for (const lang of languages) {
    const comics = getComicsByLanguage(lang);
    if (comics && comics.length > 0) {
      const params = comics.map((comic) => ({
        slug: comic.slug,
        lang: lang,
      }));
      allParams.push(...params);
    }
  }

  // Remove duplicates by slug
  const uniqueParams = Array.from(
    new Map(allParams.map((item) => [item.slug, item])).values(),
  );

  return uniqueParams;
}

// Server Component with comprehensive structured data
export default async function ComicDetailPage({ params }) {
  const cookieStore = cookies();
  const language = cookieStore.get("language")?.value || "en";
  const { slug } = params;

  const comics = getComicsByLanguage(language);
  const comic = comics?.find((c) => c.slug === slug);

  if (!comic) {
    return (
      <ComicsDetailsPage initialLanguage={language} comicNotFound={true} />
    );
  }

  // Prepare author data (simplified to avoid undefined issues)
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

  // Build structured data without undefined values
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ComicSeries",
    name: comic.series || comic.title,
    description: comic.description?.substring(0, 300),
    url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://bookqubit.com"}/comic/${comic.slug}`,
    image: comic.image || comic.coverImage,
    genre: comic.genre,
    inLanguage: language === "es" ? "es" : language === "fr" ? "fr" : "en",
    author: authorData,
    artist: artistData,
    publisher: publisherData,
    datePublished: comic.publishedDate || comic.releaseDate || comic.createdAt,
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(comicStorySchema) }}
        />
      )}
      <ComicsDetailsPage
        initialLanguage={language}
        initialSlug={slug}
        comicData={comic}
      />
    </>
  );
}

export const revalidate = 3600;
