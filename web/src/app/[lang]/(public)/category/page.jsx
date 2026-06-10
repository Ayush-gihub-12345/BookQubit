import React, { Suspense } from "react";
import CategoryList from "@/features/category/category-list";
import { getBooksByLanguage } from "@/data/books";

// Generate metadata for SEO (Server Component)
export async function generateMetadata({ params, searchParams }) {
  // You can fetch data here for dynamic metadata
  const books = getBooksByLanguage("en"); // Default language
  const totalBooks = books.length;
  const categories = [...new Set(books.map(book => book.category).filter(Boolean))];
  
  return {
    title: "Browse Books by Category | BookQubit",
    description: `Explore ${totalBooks}+ books across ${categories.length}+ categories including Fiction, Non-Fiction, Mystery, Romance, Science Fiction, and more. Find your next favorite read on BookQubit.`,
    keywords: [
      "book categories",
      "book genres",
      "browse books",
      "reading categories",
      "fiction books",
      "non-fiction books",
      "mystery novels",
      "romance books",
      "science fiction",
      "book discovery",
      "online bookstore",
      "digital library"
    ].join(", "),
    
    // Open Graph / Facebook
    openGraph: {
      title: "Browse Books by Category | BookQubit",
      description: `Discover ${totalBooks}+ books organized by category. Find the perfect book for your reading taste.`,
      type: "website",
      url: "https://bookqubit.com/category",
      siteName: "BookQubit",
      images: [
        {
          url: "/og-category.jpg", // Add this image to your public folder
          width: 1200,
          height: 630,
          alt: "Browse Book Categories - BookQubit",
        },
      ],
      locale: "en_US",
    },
    
    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: "Browse Books by Category | BookQubit",
      description: `Explore ${totalBooks}+ books across ${categories.length}+ categories. Start your reading journey today!`,
      images: ["/twitter-card-category.jpg"], // Add this image to your public folder
      creator: "@bookqubit",
      site: "@bookqubit",
    },
    
    // Additional SEO
    alternates: {
      canonical: "https://bookqubit.com/category",
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
    
    // Verification (if needed)
    verification: {
      google: "your-google-verification-code",
      // bing: "your-bing-verification-code",
    },
    
    // Other metadata
    category: "books",
    authors: [{ name: "BookQubit", url: "https://bookqubit.com" }],
    publisher: "BookQubit",
    
    // Viewport and theme (optional, usually in root layout)
    viewport: "width=device-width, initial-scale=1",
    themeColor: "#0284c7",
  };
}

// Generate static params for static site generation (optional)
export async function generateStaticParams() {
  // If you have dynamic categories, you can pre-render them
  // This is optional and depends on your needs
  return [];
}

// Loading component for Suspense
function CategoryLoading() {
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
        
        {/* Books grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-36 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main page component
export default function CategoryPage() {
  // Structured data for SEO (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Book Categories",
    "description": "Browse and discover books by category",
    "url": "https://bookqubit.com/category",
    "isPartOf": {
      "@type": "WebSite",
      "name": "BookQubit",
      "url": "https://bookqubit.com"
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Fiction",
          "url": "https://bookqubit.com/category/fiction"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Non-Fiction",
          "url": "https://bookqubit.com/category/non-fiction"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Mystery",
          "url": "https://bookqubit.com/category/mystery"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Romance",
          "url": "https://bookqubit.com/category/romance"
        },
        {
          "@type": "ListItem",
          "position": 5,
          "name": "Science Fiction",
          "url": "https://bookqubit.com/category/science-fiction"
        }
      ]
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://bookqubit.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main className="min-h-screen">
        <Suspense fallback={<CategoryLoading />}>
          <CategoryList />
        </Suspense>
      </main>
    </>
  );
}