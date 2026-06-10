"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const BookCard = ({ book, theme, themeName, t }) => {
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';
  
  return (
    <div
      className={`
        ${theme?.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} 
        ${theme?.border?.default || 'border border-gray-200 dark:border-gray-700'} 
        ${theme?.shadow?.book || 'shadow-lg'} 
        overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
      `}
    >
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-shrink-0">
            <div className="relative w-24 h-36">
              <Image
                src={book.imageUrl || "/placeholder-book.jpg"}
                alt={book.title}
                fill
                className="object-cover rounded-lg shadow-md"
                onError={(e) => {
                  // Remove TypeScript syntax - use plain JavaScript
                  const target = e.target;
                  target.src = "/placeholder-book.jpg";
                }}
              />
            </div>
          </div>
          <div className="flex-1">
            <h3
              className={`
                text-lg font-bold 
                ${theme?.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} 
                mb-1 line-clamp-2
              `}
            >
              {book.title}
            </h3>
            <p
              className={`
                text-sm 
                ${theme?.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} 
                mb-2
              `}
            >
              {t("book.by") || "by"} {book.author}
            </p>
            
            <div className="flex items-center mb-3">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`
                    w-4 h-4 
                    ${i < Math.floor(book.rating || 0) 
                      ? (theme?.iconColors?.starFilled || 'text-amber-400') 
                      : (theme?.iconColors?.starEmpty || 'text-gray-300')
                    }
                  `}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className={`ml-2 text-sm ${theme?.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                ({book.rating || 0})
              </span>
            </div>
            
            <p
              className={`
                text-sm 
                ${theme?.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} 
                line-clamp-2 mb-3
              `}
            >
              {book.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {book.tags?.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className={`
                    text-xs 
                    ${theme?.textColors?.badge || 'text-sky-800 dark:text-sky-400'} 
                    ${isDarkMode ? "bg-sky-900/30" : "bg-sky-50"} 
                    px-2 py-1 rounded-full
                  `}
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <Link
              href={`/books/${book.slug || book.id}`}
              className={`
                inline-block w-full text-center px-4 py-2 text-sm font-medium 
                ${theme?.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-sky-600 to-sky-500'} 
                text-white rounded-lg transition-all hover:shadow-lg hover:opacity-90
              `}
            >
              {t("book.view_details") || "View Details"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;