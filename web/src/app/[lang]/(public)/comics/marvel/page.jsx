"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaStar,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaFire,
  FaTrophy,
  FaCrown,
  FaHeart,
  FaEye,
  FaBookOpen,
} from "react-icons/fa";

// Sample Marvel Comics data
const marvelComicsData = [
  {
    id: 1,
    title: "Marvel Comics #1",
    slug: "marvel-comics-1",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Marvel_Comics_1.jpg/220px-Marvel_Comics_1.jpg",
    description: "The first Marvel comic ever published, introducing the Human Torch and Namor the Sub-Mariner.",
    publisher: "Timely Publications (Now Marvel Comics)",
    publicationDate: "October 1939",
    coverPrice: "10 cents",
    format: "68 pages, full color",
    charactersIntroduced: ["Human Torch (Jim Hammond)", "Namor the Sub-Mariner", "Ka-Zar the Great"],
    creators: { editor: "Martin Goodman", writersArtists: ["Carl Burgos", "Bill Everett", "Ben Thompson"] },
    rating: 9.8,
    category: "Golden Age",
    era: "Golden Age",
    isClassic: true,
    isPopular: false,
    valueToday: "$1.26 million",
  },
  {
    id: 2,
    title: "Amazing Fantasy #15",
    slug: "amazing-fantasy-15",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/2/21/Amazing_Fantasy_15.jpg/220px-Amazing_Fantasy_15.jpg",
    description: "First appearance of Spider-Man! This groundbreaking issue introduced Peter Parker.",
    publisher: "Marvel Comics",
    publicationDate: "August 1962",
    coverPrice: "12 cents",
    format: "36 pages, full color",
    charactersIntroduced: ["Spider-Man (Peter Parker)", "Uncle Ben", "Aunt May"],
    creators: { editor: "Stan Lee", writersArtists: ["Stan Lee", "Steve Ditko"] },
    rating: 9.9,
    category: "Silver Age",
    era: "Silver Age",
    isClassic: true,
    isPopular: true,
    valueToday: "$1.1 million",
  },
  {
    id: 3,
    title: "The Incredible Hulk #1",
    slug: "incredible-hulk-1",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a5/Incredible_Hulk_1.jpg/220px-Incredible_Hulk_1.jpg",
    description: "First appearance of the Hulk! Bruce Banner transforms into the green goliath.",
    publisher: "Marvel Comics",
    publicationDate: "May 1962",
    coverPrice: "12 cents",
    format: "40 pages, full color",
    charactersIntroduced: ["Hulk (Bruce Banner)", "Rick Jones", "General Thunderbolt Ross"],
    creators: { editor: "Stan Lee", writersArtists: ["Stan Lee", "Jack Kirby"] },
    rating: 9.5,
    category: "Silver Age",
    era: "Silver Age",
    isClassic: true,
    isPopular: true,
    valueToday: "$375,000",
  },
  {
    id: 4,
    title: "The Avengers #1",
    slug: "avengers-1",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/Avengers_1.jpg/220px-Avengers_1.jpg",
    description: "Earth's Mightiest Heroes assemble for the first time!",
    publisher: "Marvel Comics",
    publicationDate: "September 1963",
    coverPrice: "12 cents",
    format: "36 pages, full color",
    charactersIntroduced: ["Avengers Team", "Loki (as main villain)"],
    creators: { editor: "Stan Lee", writersArtists: ["Stan Lee", "Jack Kirby"] },
    rating: 9.6,
    category: "Silver Age",
    era: "Silver Age",
    isClassic: true,
    isPopular: true,
    valueToday: "$274,000",
  },
  {
    id: 5,
    title: "The X-Men #1",
    slug: "x-men-1",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/X-Men_1.jpg/220px-X-Men_1.jpg",
    description: "First appearance of the X-Men! Professor X recruits his first team of mutants.",
    publisher: "Marvel Comics",
    publicationDate: "September 1963",
    coverPrice: "12 cents",
    format: "36 pages, full color",
    charactersIntroduced: ["Professor X", "Cyclops", "Marvel Girl", "Beast", "Iceman", "Angel", "Magneto"],
    creators: { editor: "Stan Lee", writersArtists: ["Stan Lee", "Jack Kirby"] },
    rating: 9.7,
    category: "Silver Age",
    era: "Silver Age",
    isClassic: true,
    isPopular: true,
    valueToday: "$492,000",
  },
  {
    id: 6,
    title: "Fantastic Four #1",
    slug: "fantastic-four-1",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Fantastic_Four_1.jpg/220px-Fantastic_Four_1.jpg",
    description: "The comic that launched the Marvel Age! First appearance of the Fantastic Four.",
    publisher: "Marvel Comics",
    publicationDate: "November 1961",
    coverPrice: "10 cents",
    format: "36 pages, full color",
    charactersIntroduced: ["Mr. Fantastic", "Invisible Girl", "Human Torch", "The Thing", "The Mole Man"],
    creators: { editor: "Stan Lee", writersArtists: ["Stan Lee", "Jack Kirby"] },
    rating: 9.8,
    category: "Silver Age",
    era: "Silver Age",
    isClassic: true,
    isPopular: true,
    valueToday: "$300,000",
  },
  {
    id: 7,
    title: "Iron Man #1",
    slug: "iron-man-1",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Iron_Man_1.jpg/220px-Iron_Man_1.jpg",
    description: "First solo series of the Armored Avenger!",
    publisher: "Marvel Comics",
    publicationDate: "May 1968",
    coverPrice: "12 cents",
    format: "36 pages, full color",
    charactersIntroduced: ["Iron Man (Tony Stark)", "Pepper Potts", "Happy Hogan"],
    creators: { editor: "Stan Lee", writersArtists: ["Stan Lee", "Don Heck"] },
    rating: 9.3,
    category: "Silver Age",
    era: "Silver Age",
    isClassic: true,
    isPopular: true,
    valueToday: "$40,000",
  },
  {
    id: 8,
    title: "Captain America Comics #1",
    slug: "captain-america-1",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3f/Captain_America_Comics_1.jpg/220px-Captain_America_Comics_1.jpg",
    description: "First appearance of Captain America! The iconic cover shows Cap punching Hitler.",
    publisher: "Timely Comics",
    publicationDate: "March 1941",
    coverPrice: "10 cents",
    format: "68 pages, full color",
    charactersIntroduced: ["Captain America (Steve Rogers)", "Bucky Barnes"],
    creators: { editor: "Joe Simon", writersArtists: ["Joe Simon", "Jack Kirby"] },
    rating: 9.7,
    category: "Golden Age",
    era: "Golden Age",
    isClassic: true,
    isPopular: true,
    valueToday: "$343,000",
  },
];

const categories = ["All", "Golden Age", "Silver Age", "Bronze Age", "Modern Age"];
const sortOptions = [
  { value: "rating", label: "Highest Rated" },
  { value: "date", label: "Publication Date" },
  { value: "price", label: "Lowest Price" },
  { value: "title", label: "Title A-Z" },
];

const MarvelComicsPage = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEra, setSelectedEra] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("rating");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Get unique eras
  const eras = ["All", ...new Set(marvelComicsData.map(comic => comic.era))];

  // Filter comics
  const filteredComics = marvelComicsData.filter((comic) => {
    const matchesSearch = searchTerm === "" ||
      comic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comic.charactersIntroduced.some(char => char.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || comic.category === selectedCategory;
    const matchesEra = selectedEra === "All" || comic.era === selectedEra;
    return matchesSearch && matchesCategory && matchesEra;
  });

  // Sort comics
  const sortedComics = [...filteredComics].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "date") return new Date(b.publicationDate) - new Date(a.publicationDate);
    if (sortBy === "price") return parseFloat(a.coverPrice) - parseFloat(b.coverPrice);
    if (sortBy === "title") return a.title.localeCompare(b.title);
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentComics = sortedComics.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedComics.length / itemsPerPage);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedEra("All");
    setSortBy("rating");
  };

  const hasActiveFilters = searchTerm !== "" || selectedCategory !== "All" || selectedEra !== "All";

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}>
              <FaCrown className={`text-4xl ${theme.textColors?.highlight || 'text-red-600'}`} />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}>
            Marvel Comics
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Explore the legendary comics of the Marvel Universe
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search Marvel comics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-all ${showFilters ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-600'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600'}`}`}
            >
              <FaFilter /> Filters {hasActiveFilters && <span className="ml-1 px-1.5 py-0.5 text-xs bg-rose-500 text-white rounded-full">!</span>}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-lg transition-all ${viewMode === "grid" ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}`}
              >
                ⊞ Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg transition-all ${viewMode === "list" ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}`}
              >
                ≡ List
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className={`p-4 rounded-lg ${theme.background?.bookCoverSide || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} mb-4`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-all ${selectedCategory === category ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Era</label>
                  <div className="flex flex-wrap gap-2">
                    {eras.map((era) => (
                      <button
                        key={era}
                        onClick={() => setSelectedEra(era)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-all ${selectedEra === era ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}`}
                      >
                        {era}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex justify-end mt-2">
              <button onClick={clearFilters} className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'} hover:underline`}>
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className={`mb-6 text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
          Showing {sortedComics.length} Marvel comics
        </div>

        {/* Comics Display */}
        {currentComics.length === 0 ? (
          <div className="text-center py-16">
            <FaBookOpen className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>No comics found</h3>
            <p className={`${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Try adjusting your search or filter criteria</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentComics.map((comic) => (
              <div
                key={comic.id}
                className={`group ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <div className="relative">
                  <div className={`p-4 ${theme.background?.bookCoverSide || (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')} flex justify-center items-center h-56`}>
                    <img src={comic.image} alt={comic.title} className="h-full object-contain" />
                  </div>
                  <div className="absolute top-2 left-2">
                    {comic.isClassic && (
                      <span className="text-xs px-2 py-1 bg-amber-500 text-white rounded-full">Classic Issue</span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                      <FaStar className="text-amber-400" /> {comic.rating}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className={`font-bold text-lg mb-1 line-clamp-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                    {comic.title}
                  </h3>
                  <p className={`text-sm mb-2 line-clamp-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                    {comic.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'}`}>
                      {comic.publicationDate}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'}`}>
                      {comic.era}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className={`text-sm font-bold ${theme.textColors?.highlight || 'text-sky-600'}`}>{comic.coverPrice}</span>
                    <Link
                      href={`/comicdeatils/${comic.id}`}
                      className={`px-3 py-1.5 text-sm ${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white rounded-lg hover:opacity-90 transition`}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {currentComics.map((comic) => (
              <div
                key={comic.id}
                className={`flex flex-col sm:flex-row gap-4 p-4 ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl transition-all hover:shadow-lg`}
              >
                <div className="flex-shrink-0 w-32 h-40 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <img src={comic.image} alt={comic.title} className="h-32 object-contain" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {comic.isClassic && (
                          <span className="text-xs px-2 py-0.5 bg-amber-500 text-white rounded-full">Classic Issue</span>
                        )}
                        {comic.isPopular && (
                          <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-full flex items-center gap-1">
                            <FaFire size={10} /> Popular
                          </span>
                        )}
                      </div>
                      <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{comic.title}</h3>
                      <p className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                        Published: {comic.publicationDate} | {comic.publisher}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaStar className="text-amber-400" />
                      <span className={`font-semibold ${theme.textColors?.primary || 'text-gray-900'}`}>{comic.rating}</span>
                    </div>
                  </div>
                  <p className={`text-sm line-clamp-2 mb-3 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{comic.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {comic.charactersIntroduced.slice(0, 3).map((character, idx) => (
                      <span key={idx} className={`text-xs px-2 py-1 rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || 'text-gray-600'}`}>
                        {character}
                      </span>
                    ))}
                    {comic.charactersIntroduced.length > 3 && (
                      <span className={`text-xs px-2 py-1 rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || 'text-gray-600'}`}>
                        +{comic.charactersIntroduced.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-4 text-sm">
                      <span className={`flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        <FaCalendarAlt size={12} /> {comic.publicationDate}
                      </span>
                      <span className={`flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        <FaTag size={12} /> {comic.era}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xl font-bold ${theme.textColors?.highlight || 'text-sky-600'}`}>{comic.coverPrice}</span>
                      <Link
                        href={`/comicdeatils/${comic.id}`}
                        className={`px-4 py-2 text-sm ${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white rounded-lg hover:opacity-90 transition`}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg transition-all disabled:opacity-50 ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600'}`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-lg transition-all ${currentPage === i + 1 ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600'}`}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-lg transition-all disabled:opacity-50 ${theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500'} ${theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarvelComicsPage;