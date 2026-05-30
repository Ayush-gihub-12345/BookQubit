"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import {
  FaStar,
  FaTrophy,
  FaCrown,
  FaMedal,
  FaSearch,
  FaFilter,
  FaTimes,
  FaBook,
  FaUser,
  FaAward,
  FaFire,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
} from "react-icons/fa";

// Sample Top Authors data
const topAuthorsData = [
  {
    id: 1,
    name: "Stephen King",
    slug: "stephen-king",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    bio: "Master of horror and supernatural fiction. Author of over 60 novels including The Shining, It, and The Stand.",
    country: "United States",
    birthYear: 1947,
    totalBooks: 64,
    totalSales: "350M+",
    rating: 4.9,
    awards: ["Bram Stoker Award", "World Fantasy Award", "National Medal of Arts"],
    genres: ["Horror", "Suspense", "Science Fiction", "Fantasy"],
    rank: 1,
    change: "up",
    followers: "2.5M",
    isPopular: true,
  },
  {
    id: 2,
    name: "J.K. Rowling",
    slug: "jk-rowling",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    bio: "Creator of the Harry Potter series, one of the best-selling book series in history.",
    country: "United Kingdom",
    birthYear: 1965,
    totalBooks: 30,
    totalSales: "500M+",
    rating: 4.8,
    awards: ["Hugo Award", "British Book Awards", "Locus Award"],
    genres: ["Fantasy", "Young Adult", "Mystery"],
    rank: 2,
    change: "up",
    followers: "3.1M",
    isPopular: true,
  },
  {
    id: 3,
    name: "James Clear",
    slug: "james-clear",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    bio: "Author of Atomic Habits, expert on habits and decision-making.",
    country: "United States",
    birthYear: 1986,
    totalBooks: 2,
    totalSales: "15M+",
    rating: 4.9,
    awards: ["Goodreads Choice Award", "Audie Award"],
    genres: ["Self-Help", "Productivity", "Psychology"],
    rank: 3,
    change: "same",
    followers: "1.8M",
    isPopular: true,
  },
  {
    id: 4,
    name: "Colleen Hoover",
    slug: "colleen-hoover",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    bio: "New York Times bestselling author of romance and young adult fiction.",
    country: "United States",
    birthYear: 1979,
    totalBooks: 25,
    totalSales: "20M+",
    rating: 4.7,
    awards: ["Goodreads Choice Award", "BookTube Prize"],
    genres: ["Romance", "Young Adult", "Contemporary"],
    rank: 4,
    change: "up",
    followers: "2.2M",
    isPopular: true,
  },
  {
    id: 5,
    name: "Brandon Sanderson",
    slug: "brandon-sanderson",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
    bio: "Epic fantasy author of the Cosmere universe, including Mistborn and The Stormlight Archive.",
    country: "United States",
    birthYear: 1975,
    totalBooks: 45,
    totalSales: "40M+",
    rating: 4.8,
    awards: ["Hugo Award", "Dragon Award", "David Gemmell Award"],
    genres: ["Fantasy", "Science Fiction", "Young Adult"],
    rank: 5,
    change: "down",
    followers: "1.5M",
    isPopular: true,
  },
  {
    id: 6,
    name: "Michelle Obama",
    slug: "michelle-obama",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    bio: "Former First Lady of the United States, author of the bestselling memoir Becoming.",
    country: "United States",
    birthYear: 1964,
    totalBooks: 3,
    totalSales: "17M+",
    rating: 4.9,
    awards: ["Grammy Award", "NAACP Image Award"],
    genres: ["Memoir", "Biography", "Inspirational"],
    rank: 6,
    change: "same",
    followers: "4.5M",
    isPopular: true,
  },
  {
    id: 7,
    name: "Yuval Noah Harari",
    slug: "yuval-noah-harari",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    bio: "Author of Sapiens: A Brief History of Humankind, historian and philosopher.",
    country: "Israel",
    birthYear: 1976,
    totalBooks: 5,
    totalSales: "30M+",
    rating: 4.7,
    awards: ["National Library of China Award", "Polish Society of Authors Award"],
    genres: ["History", "Philosophy", "Science"],
    rank: 7,
    change: "up",
    followers: "1.2M",
    isPopular: true,
  },
  {
    id: 8,
    name: "Taylor Jenkins Reid",
    slug: "taylor-jenkins-reid",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
    bio: "Author of Daisy Jones & The Six and The Seven Husbands of Evelyn Hugo.",
    country: "United States",
    birthYear: 1983,
    totalBooks: 8,
    totalSales: "12M+",
    rating: 4.6,
    awards: ["Goodreads Choice Award", "Audie Award"],
    genres: ["Historical Fiction", "Contemporary", "Romance"],
    rank: 8,
    change: "down",
    followers: "980K",
    isPopular: false,
  },
  {
    id: 9,
    name: "Robert Greene",
    slug: "robert-greene",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    bio: "Author of The 48 Laws of Power, focusing on strategy, power, and human behavior.",
    country: "United States",
    birthYear: 1959,
    totalBooks: 6,
    totalSales: "10M+",
    rating: 4.7,
    awards: ["Bestselling Author Award"],
    genres: ["Business", "Self-Help", "Strategy"],
    rank: 9,
    change: "same",
    followers: "1.1M",
    isPopular: false,
  },
  {
    id: 10,
    name: "Chimamanda Ngozi Adichie",
    slug: "chimamanda-ngozi-adichie",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    bio: "Nigerian author of Americanah and We Should All Be Feminists.",
    country: "Nigeria",
    birthYear: 1977,
    totalBooks: 6,
    totalSales: "8M+",
    rating: 4.8,
    awards: ["National Book Critics Circle Award", "PEN Pinter Prize"],
    genres: ["Literary Fiction", "Feminism", "Cultural"],
    rank: 10,
    change: "up",
    followers: "890K",
    isPopular: false,
  },
];

const genres = ["All", "Horror", "Fantasy", "Self-Help", "Romance", "Young Adult", "Memoir", "History", "Philosophy", "Business", "Literary Fiction"];
const countries = ["All", "United States", "United Kingdom", "Israel", "Nigeria"];
const sortOptions = [
  { value: "rank", label: "Rank" },
  { value: "rating", label: "Highest Rated" },
  { value: "books", label: "Most Books" },
  { value: "followers", label: "Most Followers" },
];

const TopAuthorsPage = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("rank");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Filter authors
  const filteredAuthors = topAuthorsData.filter((author) => {
    const matchesSearch = searchTerm === "" ||
      author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      author.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      author.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGenre = selectedGenre === "All" || author.genres.includes(selectedGenre);
    const matchesCountry = selectedCountry === "All" || author.country === selectedCountry;
    return matchesSearch && matchesGenre && matchesCountry;
  });

  // Sort authors
  const sortedAuthors = [...filteredAuthors].sort((a, b) => {
    if (sortBy === "rank") return a.rank - b.rank;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "books") return b.totalBooks - a.totalBooks;
    if (sortBy === "followers") return parseInt(b.followers) - parseInt(a.followers);
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAuthors = sortedAuthors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedAuthors.length / itemsPerPage);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGenre("All");
    setSelectedCountry("All");
    setSortBy("rank");
  };

  const hasActiveFilters = searchTerm !== "" || selectedGenre !== "All" || selectedCountry !== "All";

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown className="text-yellow-500 text-xl" />;
    if (rank === 2) return <FaMedal className="text-gray-400 text-xl" />;
    if (rank === 3) return <FaMedal className="text-amber-600 text-xl" />;
    return <span className="text-lg font-bold text-gray-500">{rank}</span>;
  };

  const getChangeIcon = (change) => {
    if (change === "up") return <FaArrowUp className="text-green-500 text-xs" />;
    if (change === "down") return <FaArrowDown className="text-red-500 text-xs" />;
    return <FaMinus className="text-gray-500 text-xs" />;
  };

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}>
              <FaTrophy className={`text-4xl ${theme.textColors?.highlight || 'text-yellow-500'}`} />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}>
            Top Authors
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Discover the most influential and beloved authors of our time
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search authors..."
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
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Genre</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
                  >
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
                  >
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
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
          Showing {sortedAuthors.length} top authors
        </div>

        {/* Authors Display */}
        {currentAuthors.length === 0 ? (
          <div className="text-center py-16">
            <FaUser className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>No authors found</h3>
            <p className={`${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Try adjusting your search or filter criteria</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentAuthors.map((author) => (
              <div
                key={author.id}
                className={`group ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <div className="relative">
                  <img src={author.image} alt={author.name} className="w-full h-48 object-cover" />
                  <div className="absolute top-2 left-2">
                    <div className="flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                      {getRankIcon(author.rank)}
                      <span>#{author.rank}</span>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      {getChangeIcon(author.change)}
                      {author.change === "up" && " Up"}
                      {author.change === "down" && " Down"}
                      {author.change === "same" && " Same"}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className={`font-bold text-lg mb-1 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                    {author.name}
                  </h3>
                  <p className={`text-xs mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                    {author.country} • Born {author.birthYear}
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={`w-3 h-3 ${i < Math.floor(author.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                    ))}
                    <span className={`text-xs ml-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>{author.rating}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {author.genres.slice(0, 2).map((genre, idx) => (
                      <span key={idx} className={`text-xs px-2 py-0.5 rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'}`}>
                        {genre}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2 text-xs">
                      <span className={`${theme.textColors?.secondary || 'text-gray-500'}`}>📚 {author.totalBooks} books</span>
                      <span className={`${theme.textColors?.secondary || 'text-gray-500'}`}>👥 {author.followers}</span>
                    </div>
                    <Link
                      href={`/authors/${author.slug}`}
                      className={`px-3 py-1.5 text-xs ${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white rounded-lg hover:opacity-90 transition`}
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {currentAuthors.map((author) => (
              <div
                key={author.id}
                className={`flex gap-4 p-4 ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl transition-all hover:shadow-lg`}
              >
                <div className="flex-shrink-0">
                  <img src={author.image} alt={author.name} className="w-20 h-20 rounded-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {getRankIcon(author.rank)}
                        <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                          {author.name}
                        </h3>
                        {author.isPopular && <FaFire className="text-orange-500 text-sm" />}
                      </div>
                      <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                        {author.country} • Born {author.birthYear} • {author.totalBooks} books
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={`w-4 h-4 ${i < Math.floor(author.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                        ))}
                        <span className={`text-sm ${theme.textColors?.secondary || 'text-gray-500'}`}>{author.rating}</span>
                      </div>
                    </div>
                  </div>
                  <p className={`text-sm line-clamp-2 my-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                    {author.bio}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {author.genres.slice(0, 4).map((genre, idx) => (
                      <span key={idx} className={`text-xs px-2 py-1 rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || 'text-gray-600'}`}>
                        {genre}
                      </span>
                    ))}
                  </div>
                  {author.awards && author.awards.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {author.awards.slice(0, 2).map((award, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full flex items-center gap-1">
                          <FaAward size={10} /> {award}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-4 text-sm">
                      <span className={`flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        <FaBook size={12} /> {author.totalBooks} books
                      </span>
                      <span className={`flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        <FaChartLine size={12} /> {author.totalSales} sales
                      </span>
                      <span className={`flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        👥 {author.followers} followers
                      </span>
                    </div>
                    <Link
                      href={`/authors/${author.slug}`}
                      className={`px-4 py-2 text-sm ${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white rounded-lg hover:opacity-90 transition`}
                    >
                      View Profile
                    </Link>
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

export default TopAuthorsPage;