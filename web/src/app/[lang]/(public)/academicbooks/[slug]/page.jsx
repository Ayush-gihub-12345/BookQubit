"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaBook,
  FaDownload,
  FaEye,
  FaShare,
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaArrowLeft,
  FaCheck,
  FaPlus,
  FaCalendarAlt,
  FaUser,
  FaBuilding,
  FaLanguage,
  FaTag,
  FaLayerGroup,
  FaFileAlt,
  FaShoppingCart,
} from "react-icons/fa";
import { getAcademicBooksByLanguage } from "@/data/academic_books_data";

// Level colors
const levelColors = {
  Beginner:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Intermediate:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const AcademicBookDetails = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const { theme, themeName } = useTheme();
  const { t, language } = useLanguage();
  const [book, setBook] = useState(null);
  const [academicBooks, setAcademicBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (!theme) return null;

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // Load academic books based on language
  useEffect(() => {
    const booksData = getAcademicBooksByLanguage(language);
    setAcademicBooks(booksData);
  }, [language]);

  useEffect(() => {
    if (slug && academicBooks.length > 0) {
      // Find book by slug
      const foundBook = academicBooks.find(
        (book) => book.slug === slug || book.id.toString() === slug,
      );
      setBook(foundBook);
      setIsLoading(false);
    }
  }, [slug, academicBooks]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (!book) return;
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `${t("hero.check_out") || "Check out"} "${book.title}" ${t("book.by") || "by"} ${book.author}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t("hero.link_copied") || "Link copied to clipboard!");
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="text-amber-400 w-5 h-5" />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="text-amber-400 w-5 h-5" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar
            key={`empty-${i}`}
            className="text-gray-300 dark:text-gray-600 w-5 h-5"
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div
        className={`${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} min-h-screen flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600 mx-auto"></div>
          <p
            className={`mt-4 ${theme.textColors?.secondary || "text-gray-600"}`}
          >
            {t("academic.message.loading") || "Loading book details..."}
          </p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div
        className={`${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} min-h-screen flex items-center justify-center`}
      >
        <div className="text-center max-w-md mx-auto px-4">
          <FaBook
            className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || "text-gray-400"}`}
          />
          <h1
            className={`text-2xl font-bold ${theme.textColors?.primary || "text-gray-900"} mb-2`}
          >
            {t("book.not_found") || "Book Not Found"}
          </h1>
          <p
            className={`${theme.textColors?.secondary || "text-gray-600"} mb-6`}
          >
            {t("academic.message.not_found") ||
              "The academic book you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            href="/academicbooks"
            className={`inline-block px-6 py-3 ${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white rounded-lg hover:opacity-90 transition`}
          >
            {t("academic.button.browse_all") || "Browse Academic Books"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} min-h-screen py-12`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 mb-6 ${theme.textColors?.highlight || "text-sky-600"} hover:underline transition`}
        >
          <FaArrowLeft size={16} />
          {t("academic.button.back") || "Back to Academic Books"}
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Cover Image */}
          <div className="lg:col-span-1">
            <div
              className={`sticky top-24 ${theme.background?.bookCoverSide || (isDarkMode ? "bg-gray-800" : "bg-gray-100")} rounded-2xl p-6 shadow-xl`}
            >
              <div className="aspect-[3/4] flex items-center justify-center">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <FaBook
                    className={`text-6xl ${theme.textColors?.highlight || "text-sky-600"}`}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleWishlist}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${isWishlisted ? "bg-rose-600 text-white" : `${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-600"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600"}`}`}
                >
                  {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                  {isWishlisted
                    ? t("book.wishlisted") || "Added to Wishlist"
                    : t("book.wishlist") || "Add to Wishlist"}
                </button>
                <button
                  onClick={handleBookmark}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${isBookmarked ? "bg-emerald-600 text-white" : `${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-600"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600"}`}`}
                >
                  {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                  {isBookmarked
                    ? t("book.in_library") || "Saved to Library"
                    : t("book.save") || "Save to Library"}
                </button>
                <button
                  onClick={handleShare}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg ${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-600"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600"} rounded-lg transition-all`}
                >
                  <FaShare /> {t("book.share") || "Share"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <h1
                  className={`text-3xl md:text-4xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
                >
                  {book.title}
                </h1>
                <div className="flex gap-2">
                  {book.popular && (
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
                      🔥 {t("sort.popular") || "Popular"}
                    </span>
                  )}
                  {book.new && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                      🆕 {t("sort.date_newest") || "New"}
                    </span>
                  )}
                </div>
              </div>
              <p
                className={`text-xl mb-2 ${theme.textColors?.highlight || "text-sky-600"}`}
              >
                {t("book.by") || "by"} {book.author}
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {renderStars(book.rating)}
                <span
                  className={`text-sm ${theme.textColors?.secondary || "text-gray-500"}`}
                >
                  {book.rating} {t("book.out_of_5") || "out of 5 stars"}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${levelColors[book.level]}`}
                >
                  {t(`academic.level.${book.level?.toLowerCase()}`) ||
                    book.level}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-800"} ${theme.textColors?.secondary || "text-gray-600"}`}
                >
                  {t(
                    `academic.category.${book.category?.toLowerCase().replace(/ /g, "_")}`,
                  ) || book.category}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-800"} ${theme.textColors?.secondary || "text-gray-600"}`}
                >
                  {book.year}
                </span>
              </div>
            </div>

            {/* Price and Buy Section */}
            <div
              className={`p-4 rounded-xl mb-6 ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span
                    className={`text-3xl font-bold ${theme.textColors?.highlight || "text-sky-600"}`}
                  >
                    {book.price}
                  </span>
                  <p
                    className={`text-sm ${theme.textColors?.secondary || "text-gray-500"}`}
                  >
                    {t("academic.book.in_stock") || "In stock - Ready to ship"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    className={`px-6 py-3 ${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white rounded-lg hover:opacity-90 transition flex items-center gap-2`}
                  >
                    <FaShoppingCart /> {t("book.buy_now") || "Buy Now"}
                  </button>
                  <Link
                    href={book.previewUrl || "#"}
                    className={`px-6 py-3 ${theme.buttonColors?.secondaryButton?.background || "border-2 border-sky-600"} ${theme.buttonColors?.secondaryButton?.textColor || "text-sky-600"} rounded-lg transition flex items-center gap-2`}
                  >
                    <FaEye /> {t("book.preview") || "Preview"}
                  </Link>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div
                className={`flex flex-wrap gap-2 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
              >
                {[
                  {
                    id: "overview",
                    label: t("academic.tab.overview") || "Overview",
                  },
                  {
                    id: "features",
                    label: t("academic.tab.features") || "Features",
                  },
                  {
                    id: "details",
                    label: t("academic.tab.details") || "Details",
                  },
                  {
                    id: "reviews",
                    label: t("academic.tab.reviews") || "Reviews",
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 font-medium capitalize transition-all ${activeTab === tab.id ? `${theme.textColors?.highlight || "text-sky-600"} border-b-2 border-sky-600` : `${theme.textColors?.secondary || "text-gray-500"} hover:text-gray-700`}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === "overview" && (
                  <div>
                    <p
                      className={`text-lg leading-relaxed mb-6 ${theme.textColors?.secondary || (isDarkMode ? "text-gray-300" : "text-gray-700")}`}
                    >
                      {book.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`p-4 rounded-lg ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}`}
                      >
                        <h3
                          className={`font-semibold mb-2 flex items-center gap-2 ${theme.textColors?.primary || "text-gray-900"}`}
                        >
                          <FaUser />{" "}
                          {t("academic.book.author_info") ||
                            "Author Information"}
                        </h3>
                        <p
                          className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                        >
                          {book.author}{" "}
                          {t("academic.book.author_desc") ||
                            `is a renowned expert in ${book.category} with extensive teaching and research experience.`}
                        </p>
                      </div>
                      <div
                        className={`p-4 rounded-lg ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}`}
                      >
                        <h3
                          className={`font-semibold mb-2 flex items-center gap-2 ${theme.textColors?.primary || "text-gray-900"}`}
                        >
                          <FaBuilding />{" "}
                          {t("academic.book.publisher_info") || "Publisher"}
                        </h3>
                        <p
                          className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                        >
                          {t("academic.book.published_by") || "Published by"}{" "}
                          {book.publisher} {t("academic.book.in") || "in"}{" "}
                          {book.year}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "features" && (
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-4 ${theme.textColors?.primary || "text-gray-900"}`}
                    >
                      {t("academic.book.key_features") || "Key Features"}
                    </h3>
                    <ul className="space-y-3">
                      {book.features?.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <FaCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span
                            className={
                              theme.textColors?.secondary || "text-gray-700"
                            }
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <h3
                        className={`text-xl font-semibold mb-4 ${theme.textColors?.primary || "text-gray-900"}`}
                      >
                        {t("academic.book.topics_covered") || "Topics Covered"}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {book.tags?.map((tag, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 text-sm rounded-full ${theme.background?.navigationDots || "bg-gray-100 dark:bg-gray-800"} ${theme.textColors?.secondary || "text-gray-600"}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-lg ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}`}
                    >
                      <h3
                        className={`font-semibold mb-3 ${theme.textColors?.primary || "text-gray-900"}`}
                      >
                        {t("academic.book.details") || "Book Details"}
                      </h3>
                      <div className="space-y-2">
                        <p
                          className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                        >
                          <strong>{t("book.publisher") || "Publisher"}:</strong>{" "}
                          {book.publisher}
                        </p>
                        <p
                          className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                        >
                          <strong>
                            {t("book.published") || "Publication Date"}:
                          </strong>{" "}
                          {book.year}
                        </p>
                        <p
                          className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                        >
                          <strong>{t("book.language") || "Language"}:</strong>{" "}
                          {t("book.english") || "English"}
                        </p>
                        <p
                          className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                        >
                          <strong>{t("book.pages") || "Pages"}:</strong>{" "}
                          {book.pages}
                        </p>
                        <p
                          className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                        >
                          <strong>{t("book.isbn") || "ISBN"}:</strong>{" "}
                          {book.isbn}
                        </p>
                        <p
                          className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                        >
                          <strong>{t("book.format") || "Format"}:</strong>{" "}
                          {book.format}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`p-4 rounded-lg ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}`}
                    >
                      <h3
                        className={`font-semibold mb-3 ${theme.textColors?.primary || "text-gray-900"}`}
                      >
                        {t("academic.book.edition_info") ||
                          "Edition Information"}
                      </h3>
                      <div className="space-y-2">
                        <p
                          className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                        >
                          <strong>{t("book.edition") || "Edition"}:</strong>{" "}
                          {book.year} {t("academic.book.edition") || "Edition"}
                        </p>
                        <p
                          className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                        >
                          <strong>
                            {t("academic.book.subject") || "Subject"}:
                          </strong>{" "}
                          {book.subject}
                        </p>
                        <p
                          className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                        >
                          <strong>{t("book.category") || "Category"}:</strong>{" "}
                          {book.category}
                        </p>
                        <p
                          className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                        >
                          <strong>
                            {t("academic.book.level") || "Level"}:
                          </strong>{" "}
                          {book.level}
                        </p>
                        <p
                          className={`text-sm ${theme.textColors?.secondary || "text-gray-600"}`}
                        >
                          <strong>
                            {t("academic.book.includes") || "Includes"}:
                          </strong>{" "}
                          {book.features?.slice(0, 3).join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="text-center py-8">
                    <FaStar className="text-6xl text-amber-400 mx-auto mb-4" />
                    <h3
                      className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || "text-gray-900"}`}
                    >
                      {t("book.no_reviews_yet") || "No Reviews Yet"}
                    </h3>
                    <p
                      className={theme.textColors?.secondary || "text-gray-600"}
                    >
                      {t("book.be_first_to_review") ||
                        "Be the first to review this book"}
                    </p>
                    <button
                      className={`mt-4 px-6 py-2 ${theme.buttonColors?.primaryButton?.background || "bg-sky-600"} text-white rounded-lg hover:opacity-90 transition`}
                    >
                      {t("book.write_review") || "Write a Review"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Books Section */}
        {academicBooks.filter(
          (b) => b.id !== book.id && b.category === book.category,
        ).length > 0 && (
          <div
            className={`pt-8 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <h2
              className={`text-2xl font-bold mb-6 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
            >
              {t("academic.related_books") || "Related Academic Books"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {academicBooks
                .filter((b) => b.id !== book.id && b.category === book.category)
                .slice(0, 4)
                .map((relatedBook) => (
                  <Link
                    key={relatedBook.id}
                    href={`/academicbooks/${relatedBook.slug}`}
                    className={`group ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")} ${theme.border?.default || "border border-gray-200 dark:border-gray-700"} rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-xl`}
                  >
                    <div
                      className={`p-3 ${theme.background?.bookCoverSide || (isDarkMode ? "bg-gray-700" : "bg-gray-100")} flex justify-center items-center h-40`}
                    >
                      {relatedBook.coverImage ? (
                        <img
                          src={relatedBook.coverImage}
                          alt={relatedBook.title}
                          className="h-full object-contain"
                        />
                      ) : (
                        <FaBook
                          className={`text-3xl ${theme.textColors?.highlight || "text-sky-600"}`}
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <h4
                        className={`font-semibold text-sm line-clamp-2 mb-1 ${theme.textColors?.primary || "text-gray-900"}`}
                      >
                        {relatedBook.title}
                      </h4>
                      <p
                        className={`text-xs ${theme.textColors?.secondary || "text-gray-500"}`}
                      >
                        {relatedBook.author}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(relatedBook.rating || 0) ? "text-amber-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicBookDetails;
