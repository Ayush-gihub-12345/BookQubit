// src/app/[lang]/(public)/books/[slug]/page.jsx
import BookDetailsPage from "@/features/book/bookdeatils/bookdeatils";
import { getBooksByLanguage } from "@/data/books";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug, lang } = await params;

  // Get language from URL params (not cookies for URL-based language)
  const currentLanguage = lang || "en";

  const books = getBooksByLanguage(currentLanguage);
  const book = books?.find((b) => b.slug === slug);

  if (!book) {
    return {
      title: "Book Not Found | BookQubit",
      description:
        "The requested book could not be found. Explore our collection of books and audiobooks.",
      robots: { index: false },
    };
  }

  // Build keywords
  const keywords = [
    book.title,
    book.author,
    book.category,
    book.genre,
    ...(book.subjects || []),
    ...(book.tags || []),
    "book summary",
    "book review",
    currentLanguage === "en"
      ? "read books online"
      : currentLanguage === "hi"
        ? "किताबें ऑनलाइन पढ़ें"
        : currentLanguage === "ur"
          ? "کتابیں آن لائن پڑھیں"
          : currentLanguage === "ar"
            ? "قراءة الكتب عبر الإنترنت"
            : "read books online",
  ]
    .filter(Boolean)
    .join(", ");

  const seoTitle = `${book.title}${book.subtitle ? `: ${book.subtitle}` : ""} | ${book.author ? `by ${book.author} | ` : ""}BookQubit`;
  const seoDescription =
    book.description?.substring(0, 160) ||
    book.about?.substring(0, 160) ||
    `Read "${book.title}" ${book.author ? `by ${book.author} ` : ""}${book.category ? `in ${book.category} ` : ""}category. Get summary, key points, and insights at BookQubit.`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bookqubit.com";
  const canonicalUrl = `${baseUrl}/${currentLanguage}/books/${book.slug}`;

  // Generate alternate language URLs
  const alternateLanguages = {
    en: `${baseUrl}/en/books/${book.slug}`,
    hi: `${baseUrl}/hi/books/${book.slug}`,
    ur: `${baseUrl}/ur/books/${book.slug}`,
    ar: `${baseUrl}/ar/books/${book.slug}`,
    bn: `${baseUrl}/bn/books/${book.slug}`,
    es: `${baseUrl}/es/books/${book.slug}`,
    fr: `${baseUrl}/fr/books/${book.slug}`,
    de: `${baseUrl}/de/books/${book.slug}`,
    ja: `${baseUrl}/ja/books/${book.slug}`,
    zh: `${baseUrl}/zh/books/${book.slug}`,
  };

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: keywords,
    authors: book.author
      ? [{ name: book.author }]
      : book.authors?.map((author) => ({ name: author })) || [
          { name: "BookQubit" },
        ],
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
            book.coverImage || book.image || `${baseUrl}/default-book-og.jpg`,
          width: 1200,
          height: 630,
          alt: `${book.title} cover`,
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
      publishedTime: book.publishedDate || book.publishDate,
      modifiedTime: book.updatedAt || book.publishedDate,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription.substring(0, 200),
      images: [
        book.coverImage || book.image || `${baseUrl}/default-book-og.jpg`,
      ],
      creator: `@${book.twitterHandle || "BookQubit"}`,
      site: "@BookQubit",
    },
    alternates: {
      canonical: canonicalUrl,
      languages: alternateLanguages,
    },
    other: {
      rating: book.rating || "General",
      "book:author": book.author,
      "book:isbn": book.isbn,
      "book:category": book.category,
      "book:pages": book.pageCount,
      "book:edition": book.edition,
    },
  };
}

// Generate static params for all languages and books
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
    const books = getBooksByLanguage(lang);
    if (books && books.length > 0) {
      for (const book of books) {
        allParams.push({
          lang: lang,
          slug: book.slug,
        });
      }
    }
  }

  return allParams;
}

// Server Component - passes book data to client component
export default async function BookPage({ params }) {
  const { slug, lang } = await params;

  // Get language from URL params
  const currentLanguage = lang || "en";

  // Fetch book data for structured data
  const books = getBooksByLanguage(currentLanguage);
  const book = books?.find((b) => b.slug === slug);

  // Prepare author data for structured data
  let authorData = undefined;
  if (book?.author) {
    authorData = {
      "@type": "Person",
      name: book.author,
    };
    if (book.authorUrl) authorData.url = book.authorUrl;
    if (book.authorSocial) authorData.sameAs = book.authorSocial;
  } else if (book?.authors && book.authors.length > 0) {
    authorData = book.authors.map((author) => ({
      "@type": "Person",
      name: author,
    }));
  }

  // Prepare publisher data
  const publisherData = book?.publisher
    ? {
        "@type": "Organization",
        name: book.publisher,
      }
    : {
        "@type": "Organization",
        name: "BookQubit",
      };
  if (book?.publisherUrl && book.publisher)
    publisherData.url = book.publisherUrl;

  // Prepare potential actions
  const potentialActions = [];
  if (book?.buttons?.getBook) {
    potentialActions.push({
      "@type": "ReadAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: book.buttons.getBook,
        inLanguage: currentLanguage,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
    });
  }
  if (book?.buttons?.listenAudiobook) {
    potentialActions.push({
      "@type": "ListenAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: book.buttons.listenAudiobook,
        inLanguage: currentLanguage,
      },
    });
  }

  // Prepare aggregate rating
  let aggregateRatingData = undefined;
  if (book?.averageRating) {
    aggregateRatingData = {
      "@type": "AggregateRating",
      ratingValue: book.averageRating,
      ratingCount: book.ratingCount || 0,
      bestRating: "5",
      worstRating: "1",
    };
  }

  // Prepare reviews
  let reviewsData = undefined;
  if (book?.reviews && book.reviews.length > 0) {
    reviewsData = book.reviews.map((review) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: "5",
      },
      author: {
        "@type": "Person",
        name: review.reviewer,
      },
      reviewBody: review.content,
      datePublished: review.date,
    }));
  }

  // Generate JSON-LD structured data for rich snippets
  const structuredData = book
    ? {
        "@context": "https://schema.org",
        "@type": "Book",
        name: book.title,
        alternateName: book.subtitle,
        description: (book.description || book.about)?.substring(0, 300),
        url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://bookqubit.com"}/${currentLanguage}/books/${book.slug}`,
        image: book.coverImage || book.image,
        isbn: book.isbn,
        numberOfPages: book.pageCount,
        bookEdition: book.edition,
        bookFormat: book.format || "https://schema.org/EBook",
        genre: book.category || book.genre,
        keywords: book.tags?.join(", ") || book.subjects?.join(", "),
        inLanguage: currentLanguage,
        author: authorData,
        publisher: publisherData,
        datePublished: book.publishedDate || book.publishDate,
        dateModified: book.updatedAt || book.publishedDate,
        aggregateRating: aggregateRatingData,
        review: reviewsData,
        potentialAction:
          potentialActions.length > 0 ? potentialActions : undefined,
        timeRequired: book.estimatedReadTime
          ? `PT${book.estimatedReadTime}M`
          : undefined,
        award: book.awards,
        educationalUse: book.educationalUse,
        audience: book.audience
          ? {
              "@type": "Audience",
              audienceType: book.audience,
            }
          : undefined,
      }
    : null;

  // Remove undefined values
  if (structuredData) {
    Object.keys(structuredData).forEach((key) => {
      if (structuredData[key] === undefined) {
        delete structuredData[key];
      }
    });
  }

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <BookDetailsPage
        initialBook={book || null}
        initialLanguage={currentLanguage}
        initialSlug={slug}
      />
    </>
  );
}

// Revalidate every hour
export const revalidate = 3600;
