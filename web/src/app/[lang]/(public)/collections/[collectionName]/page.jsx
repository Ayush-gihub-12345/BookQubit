// src/app/[lang]/(public)/collections/[collectionName]/page.jsx
import CollectionsDetails from "@/features/collections/collections_deatils/CollectionsDetails";
import { locales } from "@/config/languages";
import { getBooksByLanguage } from "@/data/books";

// Generate static params for all languages and collections
export async function generateStaticParams() {
  const params = [];
  const collectionsSet = new Set();

  // Fetch all collections from all languages
  for (const locale of locales) {
    const books = getBooksByLanguage(locale.code);

    books.forEach((book) => {
      if (book.collection) {
        if (Array.isArray(book.collection)) {
          book.collection.forEach((col) => collectionsSet.add(col));
        } else {
          collectionsSet.add(book.collection);
        }
      }
    });
  }

  const allCollections = Array.from(collectionsSet);

  for (const locale of locales) {
    for (const collectionName of allCollections) {
      params.push({
        lang: locale.code,
        collectionName: encodeURIComponent(collectionName),
      });
    }
  }

  return params;
}

// Generate metadata dynamically based on language and collection name
export async function generateMetadata({ params }) {
  const { lang, collectionName } = await params;
  const currentLang = lang || "en";
  const decodedCollectionName = decodeURIComponent(collectionName);

  // Fetch books to get collection details
  const books = getBooksByLanguage(currentLang);
  let bookCount = 0;
  let collectionImage = null;

  books.forEach((book) => {
    if (book.collection) {
      const matches = Array.isArray(book.collection)
        ? book.collection.some(
            (c) =>
              c === decodedCollectionName ||
              c.toLowerCase() === decodedCollectionName.toLowerCase(),
          )
        : book.collection === decodedCollectionName ||
          book.collection.toLowerCase() === decodedCollectionName.toLowerCase();

      if (matches) {
        bookCount++;
        if (!collectionImage && book.imageUrl) {
          collectionImage = book.imageUrl;
        }
      }
    }
  });

  // Translations
  const titles = {
    en: `${decodedCollectionName} Collection | ${bookCount} Books`,
    es: `Colección ${decodedCollectionName} | ${bookCount} Libros`,
    fr: `Collection ${decodedCollectionName} | ${bookCount} Livres`,
    hi: `${decodedCollectionName} संग्रह | ${bookCount} पुस्तकें`,
    ar: `مجموعة ${decodedCollectionName} | ${bookCount} كتب`,
  };

  const descriptions = {
    en: `Explore the ${decodedCollectionName} collection featuring ${bookCount} curated books. Discover hand-picked titles, unique themes, and reading recommendations.`,
    hi: `${decodedCollectionName} संग्रह देखें जिसमें ${bookCount} पुस्तकें शामिल हैं। हाथ से चुनी गई पुस्तकें, अद्वितीय थीम और पढ़ने की सिफारिशें खोजें।`,
    ar: `استكشف مجموعة ${decodedCollectionName} التي تضم ${bookCount} كتابًا منسقًا. اكتشف العناوين المختارة يدويًا والموضوعات الفريدة وتوصيات القراءة.`,
  };

  const baseUrl = "https://www.bookqubit.com";
  const currentUrl = `${baseUrl}/${currentLang}/collections/${encodeURIComponent(decodedCollectionName)}`;

  // Generate alternate language URLs
  const alternateLanguages = {};
  for (const locale of locales) {
    alternateLanguages[locale.code] =
      `${baseUrl}/${locale.code}/collections/${encodeURIComponent(decodedCollectionName)}`;
  }

  const ogImage =
    collectionImage ||
    `https://bookqubit.com/images/collections/default-og.jpg`;

  return {
    title: titles[currentLang] || titles.en,
    description: descriptions[currentLang] || descriptions.en,
    keywords: `${decodedCollectionName}, book collection, ${bookCount} books, curated reading, ${decodedCollectionName} books, reading list`,

    openGraph: {
      title: titles[currentLang] || titles.en,
      description: descriptions[currentLang] || descriptions.en,
      url: currentUrl,
      siteName: "BookQubit",
      locale: currentLang,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${decodedCollectionName} Collection - ${bookCount} books`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: titles[currentLang] || titles.en,
      description: descriptions[currentLang] || descriptions.en,
      images: [ogImage],
      site: "@bookqubit",
    },

    alternates: {
      canonical: currentUrl,
      languages: alternateLanguages,
    },

    // Structured data for SEO (JSON-LD)
    other: {
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${decodedCollectionName} Collection`,
        description: descriptions[currentLang] || descriptions.en,
        url: currentUrl,
        numberOfItems: bookCount,
        publisher: {
          "@type": "Organization",
          name: "BookQubit",
          url: baseUrl,
          logo: "https://bookqubit.com/logo.png",
        },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: bookCount,
          itemListElement: [], // You can add top books here if needed
        },
      }),
    },
  };
}

export default function CollectionDetailsPage() {
  return <CollectionsDetails />;
}
