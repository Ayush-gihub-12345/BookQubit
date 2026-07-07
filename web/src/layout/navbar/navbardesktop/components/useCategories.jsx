// src/hooks/useCategories.js
import { useMemo } from "react";
// Adjust the import path to match your actual data file location.
// If you use the @ alias pointing to src/, this works:
import booksData from "@/data/books/BooksData";

/**
 * Extracts unique country names from booksData.
 */
const getUniqueCountries = () => {
  const countries = new Set();
  booksData.forEach((book) => {
    if (book.geography?.country) {
      countries.add(book.geography.country);
    }
  });
  return Array.from(countries).sort();
};

/**
 * Converts a country name to a URL slug.
 */
const toSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

/**
 * Static categories (can be gradually replaced with dynamic versions)
 */
const staticCategories = [
  {
    id: "bestsellers",
    title: "Best Sellers",
    items: [
      { name: "NYT Best Sellers", path: "/books/bestsellers/nyt" },
      { name: "Amazon Best Sellers", path: "/books/bestsellers/amazon" },
      { name: "Global Best Sellers", path: "/books/bestsellers/global" },
      { name: "Top 100 Fiction", path: "/books/fiction/top100" },
      { name: "Top 100 Non-Fiction", path: "/books/nonfiction/top100" },
      { name: "Editors' Choice", path: "/books/editors-choice" },
      { name: "Reader's Choice", path: "/books/readers-choice" },
      { name: "Critics' Picks", path: "/books/critics-picks" },
      { name: "Bestsellers of the Year", path: "/books/bestsellers/year" },
      { name: "Most Popular", path: "/books/most-popular" },
      { name: "Weekly Top 10", path: "/books/top10/weekly" },
      { name: "Monthly Top 20", path: "/books/top20/monthly" },
      { name: "Yearly Top 50", path: "/books/top50/yearly" },
      { name: "All-Time Bestsellers", path: "/books/bestsellers/all-time" },
      { name: "New York Times Fiction", path: "/books/nyt/fiction" },
      { name: "New York Times Non-Fiction", path: "/books/nyt/non-fiction" },
      { name: "Amazon Charts", path: "/books/amazon/charts" },
      { name: "Apple Books Bestsellers", path: "/books/apple/bestsellers" },
      { name: "Google Play Bestsellers", path: "/books/google/bestsellers" },
      { name: "Barnes & Noble Bestsellers", path: "/books/bn/bestsellers" },
    ],
    viewAllPath: "/books/bestsellers",
  },
  {
    id: "genres",
    title: "Literature Types",
    items: [
      { name: "Classics", path: "/books/classics" },
      { name: "Historical", path: "/books/history" },
      { name: "Religious", path: "/books/religion" },
      { name: "Educational", path: "/books/education" },
      { name: "Kids Books", path: "/books/kids" },
      { name: "Young Adult", path: "/books/young-adult" },
      { name: "Science Fiction", path: "/books/sci-fi" },
      { name: "Fantasy", path: "/books/fantasy" },
      { name: "Mystery & Thriller", path: "/books/mystery" },
      { name: "Romance", path: "/books/romance" },
      { name: "Biography", path: "/books/biography" },
      { name: "Poetry", path: "/books/poetry" },
      { name: "Drama", path: "/books/drama" },
      { name: "Horror", path: "/books/horror" },
      { name: "Comics & Graphic Novels", path: "/books/comics" },
      { name: "Self-Help", path: "/books/self-help" },
      { name: "Business", path: "/books/business" },
      { name: "Science & Technology", path: "/books/science-tech" },
      { name: "Art & Photography", path: "/books/art-photography" },
      { name: "Travel", path: "/books/travel" },
      { name: "Cookbooks", path: "/books/cookbooks" },
      { name: "Health & Fitness", path: "/books/health-fitness" },
      { name: "Parenting", path: "/books/parenting" },
      { name: "True Crime", path: "/books/true-crime" },
      { name: "Humor", path: "/books/humor" },
      { name: "Sports", path: "/books/sports" },
      { name: "Music", path: "/books/music" },
      { name: "Philosophy", path: "/books/philosophy" },
      { name: "Psychology", path: "/books/psychology" },
      { name: "Sociology", path: "/books/sociology" },
    ],
    viewAllPath: "/books/genres",
  },
  {
    id: "regions",
    title: "Regional Literature",
    items: [
      { name: "Asian Literature", path: "/books/asia" },
      { name: "European Literature", path: "/books/europe" },
      { name: "African Literature", path: "/books/africa" },
      { name: "Middle-East Literature", path: "/books/middle-east" },
      { name: "Latin American", path: "/books/latin-america" },
      { name: "Caribbean", path: "/books/caribbean" },
      { name: "South Asian", path: "/books/south-asia" },
      { name: "Scandinavian", path: "/books/scandinavia" },
      { name: "Nordic", path: "/books/nordic" },
      { name: "Baltic", path: "/books/baltic" },
      { name: "Balkan", path: "/books/balkan" },
      { name: "Mediterranean", path: "/books/mediterranean" },
      { name: "East Asian", path: "/books/east-asia" },
      { name: "Southeast Asian", path: "/books/southeast-asia" },
      { name: "Central Asian", path: "/books/central-asia" },
      { name: "North American", path: "/books/north-america" },
      { name: "South American", path: "/books/south-america" },
      { name: "Central American", path: "/books/central-america" },
      { name: "Oceanian", path: "/books/oceania" },
      { name: "Pacific Island", path: "/books/pacific-island" },
      { name: "Arctic", path: "/books/arctic" },
      { name: "Antarctic", path: "/books/antarctic" },
    ],
    viewAllPath: "/books/regions",
  },
  {
    id: "collections",
    title: "Special Collections",
    items: [
      { name: "Award Winners", path: "/books/awards" },
      { name: "Book Club Picks", path: "/books/book-club" },
      { name: "New Releases", path: "/books/new" },
      { name: "Upcoming Books", path: "/books/upcoming" },
      { name: "Limited Editions", path: "/books/limited" },
      { name: "Signed Copies", path: "/books/signed" },
      { name: "Rare Books", path: "/books/rare" },
      { name: "Collector's Editions", path: "/books/collectors" },
      { name: "First Editions", path: "/books/first-editions" },
      { name: "Autographed Books", path: "/books/autographed" },
      { name: "Vintage Books", path: "/books/vintage" },
      { name: "Antique Books", path: "/books/antique" },
      { name: "Special Bindings", path: "/books/special-bindings" },
      { name: "Illustrated Editions", path: "/books/illustrated-editions" },
      { name: "Annotated Editions", path: "/books/annotated-editions" },
      { name: "Scholar's Editions", path: "/books/scholars-editions" },
      { name: "Library Editions", path: "/books/library-editions" },
      { name: "Gift Editions", path: "/books/gift-editions" },
      { name: "Holiday Editions", path: "/books/holiday-editions" },
      { name: "Anniversary Editions", path: "/books/anniversary-editions" },
    ],
    viewAllPath: "/books/collections",
  },
  {
    id: "languages",
    title: "By Language",
    items: [
      { name: "English", path: "/books/language/english" },
      { name: "Spanish", path: "/books/language/spanish" },
      { name: "French", path: "/books/language/french" },
      { name: "German", path: "/books/language/german" },
      { name: "Hindi", path: "/books/language/hindi" },
      { name: "Arabic", path: "/books/language/arabic" },
      { name: "Chinese", path: "/books/language/chinese" },
      { name: "Japanese", path: "/books/language/japanese" },
      { name: "Portuguese", path: "/books/language/portuguese" },
      { name: "Russian", path: "/books/language/russian" },
      { name: "Italian", path: "/books/language/italian" },
      { name: "Korean", path: "/books/language/korean" },
      { name: "Dutch", path: "/books/language/dutch" },
      { name: "Swedish", path: "/books/language/swedish" },
      { name: "Polish", path: "/books/language/polish" },
      { name: "Turkish", path: "/books/language/turkish" },
      { name: "Vietnamese", path: "/books/language/vietnamese" },
      { name: "Thai", path: "/books/language/thai" },
      { name: "Greek", path: "/books/language/greek" },
      { name: "Hebrew", path: "/books/language/hebrew" },
      { name: "Persian", path: "/books/language/persian" },
      { name: "Urdu", path: "/books/language/urdu" },
      { name: "Bengali", path: "/books/language/bengali" },
      { name: "Tamil", path: "/books/language/tamil" },
      { name: "Telugu", path: "/books/language/telugu" },
      { name: "Marathi", path: "/books/language/marathi" },
      { name: "Gujarati", path: "/books/language/gujarati" },
      { name: "Punjabi", path: "/books/language/punjabi" },
      { name: "Malayalam", path: "/books/language/malayalam" },
      { name: "Kannada", path: "/books/language/kannada" },
    ],
    viewAllPath: "/books/languages",
  },
  {
    id: "time-periods",
    title: "By Time Period",
    items: [
      { name: "Ancient", path: "/books/period/ancient" },
      { name: "Medieval", path: "/books/period/medieval" },
      { name: "Renaissance", path: "/books/period/renaissance" },
      { name: "18th Century", path: "/books/period/18th-century" },
      { name: "19th Century", path: "/books/period/19th-century" },
      { name: "Modern", path: "/books/period/modern" },
      { name: "Contemporary", path: "/books/period/contemporary" },
      { name: "Postmodern", path: "/books/period/postmodern" },
      { name: "Victorian", path: "/books/period/victorian" },
      { name: "Edwardian", path: "/books/period/edwardian" },
      { name: "Georgian", path: "/books/period/georgian" },
      { name: "Elizabethan", path: "/books/period/elizabethan" },
      { name: "Prehistoric", path: "/books/period/prehistoric" },
      { name: "Classical", path: "/books/period/classical" },
      { name: "Byzantine", path: "/books/period/byzantine" },
      { name: "Enlightenment", path: "/books/period/enlightenment" },
      { name: "Romantic", path: "/books/period/romantic" },
      { name: "Realism", path: "/books/period/realism" },
      { name: "Naturalism", path: "/books/period/naturalism" },
      { name: "Modernism", path: "/books/period/modernism" },
    ],
    viewAllPath: "/books/time-periods",
  },
  {
    id: "formats",
    title: "By Format",
    items: [
      { name: "Hardcover", path: "/books/format/hardcover" },
      { name: "Paperback", path: "/books/format/paperback" },
      { name: "E-Books", path: "/books/format/ebook" },
      { name: "Audiobooks", path: "/books/format/audiobook" },
      { name: "Large Print", path: "/books/format/large-print" },
      { name: "Illustrated", path: "/books/format/illustrated" },
      { name: "Box Sets", path: "/books/format/box-sets" },
      { name: "Special Bindings", path: "/books/format/special-bindings" },
      { name: "Pocket Edition", path: "/books/format/pocket" },
      { name: "Mass Market Paperback", path: "/books/format/mass-market" },
      { name: "Trade Paperback", path: "/books/format/trade-paperback" },
      { name: "Library Binding", path: "/books/format/library-binding" },
      { name: "Board Books", path: "/books/format/board-books" },
      { name: "Pop-up Books", path: "/books/format/pop-up" },
      { name: "Interactive Books", path: "/books/format/interactive" },
      { name: "Digital Only", path: "/books/format/digital-only" },
      { name: "Print Only", path: "/books/format/print-only" },
      { name: "Audio Only", path: "/books/format/audio-only" },
      { name: "Combo Packs", path: "/books/format/combo-packs" },
      { name: "Collector's Box", path: "/books/format/collectors-box" },
    ],
    viewAllPath: "/books/formats",
  },
  {
    id: "authors",
    title: "By Author Type",
    items: [
      { name: "Bestselling Authors", path: "/books/authors/bestselling" },
      { name: "Classic Authors", path: "/books/authors/classic" },
      { name: "Contemporary Authors", path: "/books/authors/contemporary" },
      { name: "Debut Authors", path: "/books/authors/debut" },
      { name: "Award-Winning Authors", path: "/books/authors/award-winning" },
      { name: "Local Authors", path: "/books/authors/local" },
      { name: "International Authors", path: "/books/authors/international" },
      { name: "Indie Authors", path: "/books/authors/indie" },
      { name: "Self-Published Authors", path: "/books/authors/self-published" },
      { name: "Academic Authors", path: "/books/authors/academic" },
    ],
    viewAllPath: "/books/authors",
  },
  {
    id: "age-groups",
    title: "By Age Group",
    items: [
      { name: "0-3 Years", path: "/books/age/0-3" },
      { name: "3-5 Years", path: "/books/age/3-5" },
      { name: "6-8 Years", path: "/books/age/6-8" },
      { name: "9-12 Years", path: "/books/age/9-12" },
      { name: "Young Adult (13-17)", path: "/books/age/13-17" },
      { name: "New Adult (18-25)", path: "/books/age/18-25" },
      { name: "Adult (26+)", path: "/books/age/26-plus" },
      { name: "Senior Readers", path: "/books/age/senior" },
      { name: "All Ages", path: "/books/age/all" },
    ],
    viewAllPath: "/books/age-groups",
  },
];

export const useCategories = () => {
  const countryCategory = useMemo(() => {
    const countries = getUniqueCountries();
    return {
      id: "country",
      title: "Books by Country",
      items: countries.map((name) => ({
        name,
        path: `/books/country/${toSlug(name)}`, // adjust pattern if needed
      })),
      viewAllPath: "/books/by-country",
    };
  }, []);

  const categories = useMemo(() => {
    // Place the dynamic country category at the beginning
    return [countryCategory, ...staticCategories];
    // Or at the end: return [...staticCategories, countryCategory];
  }, [countryCategory]);

  return categories;
};