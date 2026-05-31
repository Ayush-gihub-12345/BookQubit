"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import { getBooksByLanguage } from "@/data/books";

// Import components
import BookNotFound from "@/features/book/bookdeatils/components/BookNotFound";
import BookCover from "@/features/book/bookdeatils/components/BookCover";
import BookInfo from "@/features/book/bookdeatils/components/BookInfo";
import BookActions from "@/features/book/bookdeatils/components/BookActions";
import BookKeyPoints from "@/features/book/bookdeatils/components/BookKeyPoints";
import BookSubjects from "@/features/book/bookdeatils/components/BookSubjects";
import BookPublicationDetails from "@/features/book/bookdeatils/components/BookPublicationDetails";
import BookAbout from "@/features/book/bookdeatils/components/BookAbout";
import BookSummary from "@/features/book/bookdeatils/components/BookSummary";
import RelatedBooks from "@/features/book/bookdeatils/components/RelatedBooks";
import BookNavigation from "@/features/book/bookdeatils/components/BookNavigation";
import BookSEO from "@/features/book/bookdeatils/components/BookSEO";

// Import dynamic tags components
import {
  extractDynamicTagsFromBook,
  getRelatedTagsForBook,
  getCategorizedBookTags,
  RelatedTagsSection,
} from "@/features/tags/dynamic_book_tags";

const BookDetailsPage = ({ initialBook, initialSlug, initialLanguage }) => {
  const params = useParams();
  const router = useRouter();
  const slug = initialSlug || params?.slug;
  const { theme, themeName } = useTheme();
  const { language: contextLanguage } = useLanguage();
  const { currentFont } = useFont();

  // Use initialLanguage if provided, otherwise use context
  const language = initialLanguage || contextLanguage;

  // Create ref for summary section
  const summaryRef = useRef(null);

  // State for book status and user interactions
  const [bookStatus, setBookStatus] = useState("unread");
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCollection, setIsInCollection] = useState(false);
  const [book, setBook] = useState(initialBook || null);
  const [booksData, setBooksData] = useState([]);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // State for dynamic tags
  const [dynamicTags, setDynamicTags] = useState([]);
  const [relatedTags, setRelatedTags] = useState([]);
  const [categorizedTags, setCategorizedTags] = useState({});

  // Load books based on language (only if initialBook not provided)
  useEffect(() => {
    if (!initialBook) {
      const books = getBooksByLanguage(language);
      setBooksData(books);
    }
  }, [language, initialBook]);

  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Find book when slug or booksData changes (only if no initialBook)
  useEffect(() => {
    if (!initialBook && slug && booksData.length > 0 && !isRedirecting) {
      const foundBook = booksData.find((book) => {
        const bookSlug = book.slug?.toLowerCase().trim();
        const urlSlug = slug?.toLowerCase().trim();

        if (bookSlug === urlSlug) return true;
        if (!isNaN(slug) && book.id === parseInt(slug)) return true;

        const generatedSlug = book.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        return generatedSlug === urlSlug;
      });

      setBook(foundBook);
    }
  }, [slug, booksData, isRedirecting, initialBook]);

  // Extract dynamic tags when book is found
  useEffect(() => {
    if (book && (booksData.length > 0 || initialBook)) {
      // Extract tags from current book
      const tags = extractDynamicTagsFromBook(book);
      setDynamicTags(tags);

      // Get categorized tags
      const categorized = getCategorizedBookTags(book);
      setCategorizedTags(categorized);

      // Get related tags from other books
      const related = getRelatedTagsForBook(book, booksData, 15);
      setRelatedTags(related);
    }
  }, [book, booksData, initialBook]);

  // Redirect from ID to slug URL
  useEffect(() => {
    if (!initialBook && book && book.slug && !isNaN(slug) && !isRedirecting) {
      setIsRedirecting(true);
      router.replace(`/book/${book.slug}`);
    }
  }, [book, slug, router, isRedirecting, initialBook]);

  // Function to scroll to summary
  const scrollToSummary = () => {
    if (summaryRef.current) {
      summaryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else if (book?.buttons?.readSummary) {
      window.open(book.buttons.readSummary, "_blank");
    }
  };

  // Handle tag click - Navigate to tag page
  const handleTagClick = (tag) => {
    // Generate slug from tag name
    const tagSlug = tag
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    router.push(`/tags/${tagSlug}`);
  };

  // Find related books with proper null checks and deduplication
  const relatedByAuthor =
    book && booksData.length > 0
      ? booksData
          .filter(
            (b) =>
              b.author === book.author &&
              b.id !== book.id &&
              b.slug !== book.slug,
          )
          .slice(0, 4)
      : [];

  const relatedByCategory =
    book && booksData.length > 0
      ? booksData
          .filter(
            (b) =>
              b.category === book.category &&
              b.id !== book.id &&
              b.slug !== book.slug,
          )
          .slice(0, 4)
      : [];

  // Remove duplicates from related books
  const getUniqueRelatedBooks = () => {
    const allRelated = [...relatedByAuthor, ...relatedByCategory];
    const uniqueBooks = new Map();

    allRelated.forEach((book) => {
      if (!uniqueBooks.has(book.id)) {
        uniqueBooks.set(book.id, book);
      }
    });

    return Array.from(uniqueBooks.values()).slice(0, 4);
  };

  const uniqueRelatedBooks = getUniqueRelatedBooks();

  // Handler functions with null checks
  const handleWishlist = () => {
    if (!book) return;
    setIsInWishlist(!isInWishlist);
    console.log(
      `${isInWishlist ? "Removed from" : "Added to"} wishlist:`,
      book?.title,
    );
  };

  const handleShare = () => {
    if (!book) return;
    if (navigator.share) {
      navigator
        .share({
          title: book.title,
          text: `Check out "${book.title}" by ${book.author}`,
          url: window.location.href,
        })
        .catch((err) => {
          console.log("Error sharing:", err);
        });
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          alert("Link copied to clipboard!");
        })
        .catch((err) => {
          console.log("Error copying to clipboard:", err);
        });
    }
  };

  const handleReadStatus = (status) => {
    if (!book) return;
    setBookStatus(status);
    console.log(`Marked as ${status}:`, book?.title);
  };

  const handleAddToLibrary = () => {
    if (!book) return;
    setIsInCollection(!isInCollection);
    console.log(
      `${isInCollection ? "Removed from" : "Added to"} library:`,
      book?.title,
    );
  };

  const handleGetBook = () => {
    if (book?.buttons?.getBook) {
      window.open(book.buttons.getBook, "_blank");
    }
  };

  const handleListenAudiobook = () => {
    if (book?.buttons?.listenAudiobook) {
      window.open(book.buttons.listenAudiobook, "_blank");
    }
  };

  // Show loading state while redirecting
  if (isRedirecting) {
    return (
      <div
        className={`${theme.background?.section || "bg-gray-50 dark:bg-gray-900"} min-h-screen flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p
            className={`mt-4 ${theme.textColors?.secondary || "text-gray-600 dark:text-gray-400"}`}
          >
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  if (!book) {
    return <BookNotFound slug={slug} />;
  }

  // Apply font style
  const fontStyle = currentFont ? { fontFamily: currentFont.family } : {};

  return (
    <>
      <BookSEO book={book} />

      <div
        className={`${theme.background?.section || "bg-gray-50 dark:bg-gray-900"} min-h-screen`}
        style={fontStyle}
      >
        <div
          className={`
            ${theme.layout?.containerWidth || "max-w-7xl"} 
            mx-auto 
            ${theme.layout?.sectionPadding || "py-12 px-4 sm:px-6 lg:px-8"}
          `}
        >
          {/* Main Book Details */}
          <div
            className={`
              flex flex-col lg:flex-row gap-8 mb-16 
              ${theme.shadow?.container || "shadow-lg"} 
              ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} 
              p-6 
              ${theme.background?.section || "bg-white dark:bg-gray-800"} 
              rounded-2xl
            `}
          >
            <BookCover book={book} />

            <div className="lg:w-2/3 space-y-6">
              <BookInfo book={book} />

              <BookActions
                book={book}
                bookStatus={bookStatus}
                isInWishlist={isInWishlist}
                isInCollection={isInCollection}
                onGetBook={handleGetBook}
                onScrollToSummary={scrollToSummary}
                onWishlist={handleWishlist}
                onShare={handleShare}
                onAddToLibrary={handleAddToLibrary}
                onReadStatus={handleReadStatus}
                onListenAudiobook={handleListenAudiobook}
              />
            </div>
          </div>

          {/* Detailed Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <BookKeyPoints book={book} />
            <BookSubjects book={book} />
            <BookPublicationDetails book={book} />
          </div>

          {/* About Section */}
          <BookAbout book={book} />

          {/* Summary - with ref attached */}
          <div ref={summaryRef}>
            <BookSummary book={book} />
          </div>

          {/* Dynamic Tags Section - BEFORE RELATED BOOKS */}
          {(dynamicTags.length > 0 || relatedTags.length > 0) && (
            <div className="my-12">
              <RelatedTagsSection
                currentTags={dynamicTags}
                relatedTags={relatedTags}
                categorizedTags={categorizedTags}
                onTagClick={handleTagClick}
              />
            </div>
          )}

          {/* Related Books */}
          {uniqueRelatedBooks.length > 0 && (
            <RelatedBooks
              relatedByAuthor={relatedByAuthor}
              relatedByCategory={relatedByCategory}
              book={book}
              relatedBooks={uniqueRelatedBooks}
            />
          )}

          {/* Bottom Navigation */}
          <BookNavigation />
        </div>
      </div>
    </>
  );
};

export default BookDetailsPage;
