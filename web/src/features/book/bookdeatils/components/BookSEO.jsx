"use client";

import React, { useEffect } from "react";
import Head from "next/head";
import { useTheme } from "@/themes/useTheme";

const BookSEO = ({ book }) => {
  const { theme, themeName } = useTheme();
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bookqubit.shop";
  const bookUrl = `${siteUrl}/books/${book.slug || book.id}`;
  const imageUrl = book.imageUrl || `${siteUrl}/images/default-book-cover.jpg`;
  const description = book.description
    ? book.description.substring(0, 160)
    : `Read ${book.title} by ${book.author}. Available in ${book.format || "multiple formats"}.`;

  const keywords = [
    book.title,
    book.author,
    book.category,
    ...(book.genres || []),
    "book",
    "reading",
    "literature",
    "book summary",
    "book review",
  ]
    .filter(Boolean)
    .join(", ");

  // Format price safely
  const formatPrice = (price) => {
    if (!price) return "0";
    return price
      .toString()
      .replace("$", "")
      .replace(/[^\d.]/g, "");
  };

  // Ensure rating is a number
  const rating = book.rating ? parseFloat(book.rating) : null;

  // Helper to add/update JSON-LD script
  const setJsonLd = (data, id) => {
    if (!data) return;

    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data, null, 2);
  };

  useEffect(() => {
    // Book Schema
    const bookSchema = {
      "@context": "https://schema.org",
      "@type": "Book",
      name: book.title,
      author: {
        "@type": "Person",
        name: book.author,
        url:
          book.authorUrl ||
          `${siteUrl}/authors/${book.authorSlug || book.author.toLowerCase().replace(/\s+/g, "-")}`,
      },
      url: bookUrl,
      image: imageUrl,
      description: book.description,
      isbn: book.isbn,
      numberOfPages: book.pageCount,
      datePublished: book.published,
      publisher: {
        "@type": "Organization",
        name: book.publisher || "BookQubit",
      },
      genre: book.genres || [book.category].filter(Boolean),
      inLanguage: book.language || "en",
      bookFormat: book.format || "Paperback",
      keywords: [book.category, ...(book.genres || [])].join(", "),
      ...(rating && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating,
          ratingCount: book.reviewCount || 2458,
          bestRating: "5",
          worstRating: "1",
        },
      }),
      offers: {
        "@type": "Offer",
        price: formatPrice(book.price),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: book.buttons?.getBook || bookUrl,
        priceValidUntil: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        )
          .toISOString()
          .split("T")[0],
      },
      workExample: {
        "@type": "Book",
        isbn: book.isbn,
        bookEdition: book.edition || "First Edition",
      },
    };

    // Breadcrumb Schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Books",
          item: `${siteUrl}/bookslist`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: book.title,
          item: bookUrl,
        },
      ],
    };

    setJsonLd(bookSchema, "book-schema");
    setJsonLd(breadcrumbSchema, "breadcrumb-schema");

    // Cleanup
    return () => {
      const bookScript = document.getElementById("book-schema");
      const breadcrumbScript = document.getElementById("breadcrumb-schema");
      if (bookScript) bookScript.remove();
      if (breadcrumbScript) breadcrumbScript.remove();
    };
  }, [book, bookUrl, imageUrl, rating, siteUrl]);

  return (
    <Head>
      {/* Basic Metadata */}
      <title>{`${book.title} by ${book.author} | BookQubit`}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={book.author} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="book" />
      <meta property="og:url" content={bookUrl} />
      <meta property="og:title" content={`${book.title} by ${book.author}`} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="BookQubit" />
      
      {/* Book-specific Open Graph tags */}
      <meta property="book:author" content={book.author} />
      <meta property="book:isbn" content={book.isbn} />
      {book.genres?.map((genre, index) => (
        <meta key={index} property="book:genre" content={genre} />
      ))}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={bookUrl} />
      <meta property="twitter:title" content={`${book.title} by ${book.author}`} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={imageUrl} />

      {/* Additional SEO */}
      <link rel="canonical" href={bookUrl} />
      <meta name="robots" content="index, follow" />
      
      {/* Book-specific meta tags */}
      {book.rating && (
        <>
          <meta name="rating" content={book.rating.toString()} />
          <meta name="reviewCount" content={book.reviewCount?.toString() || "2458"} />
        </>
      )}
    </Head>
  );
};

export default BookSEO;