// src/app/tags/[slug]/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import { getBooksByLanguage } from "@/data/books";
import { extractDynamicTagsFromBook } from "@/features/tags/dynamic_book_tags";
import BookSquareCard from "@/features/book/booklist/ui/BookSquareCard";
import { FaTag, FaArrowLeft, FaBookOpen } from "react-icons/fa";

const TagPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const { theme, themeName } = useTheme();
  const { language, t } = useLanguage();
  const { currentFont } = useFont();

  const [tagName, setTagName] = useState("");
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedTags, setRelatedTags] = useState([]);

  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  // Load all books
  useEffect(() => {
    const books = getBooksByLanguage(language);
    setAllBooks(books);
  }, [language]);

  // Decode tag name from slug and find related books
  useEffect(() => {
    if (slug && allBooks.length > 0) {
      // Convert slug back to tag name (e.g., "annihilation-of-caste" -> "Annihilation of Caste")
      const decodedTag = decodeURIComponent(slug).replace(/-/g, ' ');
      setTagName(decodedTag);
      
      // Find books that have this tag
      const booksWithTag = allBooks.filter(book => {
        const bookTags = extractDynamicTagsFromBook(book);
        return bookTags.some(tag => 
          tag.toLowerCase() === decodedTag.toLowerCase() ||
          tag.toLowerCase().includes(decodedTag.toLowerCase()) ||
          decodedTag.toLowerCase().includes(tag.toLowerCase())
        );
      });
      
      setRelatedBooks(booksWithTag);
      
      // Find related tags (other tags that appear in these books)
      const tagFrequency = new Map();
      booksWithTag.forEach(book => {
        const bookTags = extractDynamicTagsFromBook(book);
        bookTags.forEach(tag => {
          if (tag.toLowerCase() !== decodedTag.toLowerCase()) {
            tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
          }
        });
      });
      
      const topRelatedTags = Array.from(tagFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag]) => tag);
      
      setRelatedTags(topRelatedTags);
      setIsLoading(false);
    }
  }, [slug, allBooks]);

  const handleTagClick = (tag) => {
    const tagSlug = tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    router.push(`/tags/${tagSlug}`);
  };

  const fontStyle = currentFont ? { fontFamily: currentFont.family } : {};

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")} flex items-center justify-center`} style={fontStyle}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className={`mt-4 ${theme.textColors?.secondary || "text-gray-600"}`}>
            Loading books...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")}`} style={fontStyle}>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105
            ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}
            ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}
          `}
        >
          <FaArrowLeft size={16} />
          Back
        </button>

        {/* Tag Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-sky-500/10 mb-4">
            <FaTag className="text-sky-500 text-2xl" />
            <h1 className="text-3xl font-bold capitalize text-sky-500">{tagName}</h1>
          </div>
          <p className={`text-lg ${theme.textColors?.secondary || "text-gray-600"}`}>
            {relatedBooks.length} {relatedBooks.length === 1 ? "book" : "books"} found with this tag
          </p>
        </div>

        {/* Related Tags Section */}
        {relatedTags.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-sky-500/10 to-blue-500/10">
            <h2 className={`text-sm font-semibold mb-3 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}>
              Related Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all hover:scale-105
                    ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-white")}
                    ${theme.textColors?.secondary || "text-gray-700 dark:text-gray-300"}
                    border ${theme.border?.default || "border-gray-200 dark:border-gray-700"}
                    hover:border-sky-500 hover:text-sky-500
                  `}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Books Grid */}
        {relatedBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {relatedBooks.map((book) => (
              <BookSquareCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FaBookOpen className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || "text-gray-400"}`} />
            <h2 className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}>
              No books found
            </h2>
            <p className={theme.textColors?.secondary || "text-gray-600"}>
              No books are currently tagged with "{tagName}"
            </p>
            <button
              onClick={() => router.back()}
              className={`mt-6 px-6 py-2 rounded-lg ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"} text-white`}
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagPage;