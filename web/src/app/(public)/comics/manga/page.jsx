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
  FaYenSign,
  FaGlobeAsia,
} from "react-icons/fa";

// Sample Manga data
const mangaData = [
  {
    id: 1,
    title: "Naruto",
    slug: "naruto",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/9/94/NarutoCoverTankobon1.jpg/220px-NarutoCoverTankobon1.jpg",
    description: "A young ninja dreams of becoming the Hokage, the leader of his village.",
    author: "Masashi Kishimoto",
    publisher: "Shueisha",
    englishPublisher: "Viz Media",
    publicationDate: "1999-2014",
    volumes: 72,
    chapters: 700,
    genre: ["Action", "Adventure", "Fantasy", "Martial Arts"],
    rating: 8.8,
    popularity: 9.5,
    isComplete: true,
    isPopular: true,
    demographics: "Shonen",
    magazine: "Weekly Shonen Jump",
  },
  {
    id: 2,
    title: "One Piece",
    slug: "one-piece",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/5/51/One_Piece_Vol._1.jpg/220px-One_Piece_Vol._1.jpg",
    description: "Monkey D. Luffy sets off on a journey to become the Pirate King.",
    author: "Eiichiro Oda",
    publisher: "Shueisha",
    englishPublisher: "Viz Media",
    publicationDate: "1997-Present",
    volumes: 106,
    chapters: 1100,
    genre: ["Action", "Adventure", "Fantasy", "Comedy"],
    rating: 9.2,
    popularity: 9.8,
    isComplete: false,
    isPopular: true,
    demographics: "Shonen",
    magazine: "Weekly Shonen Jump",
  },
  {
    id: 3,
    title: "Dragon Ball",
    slug: "dragon-ball",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/9/91/Dragon_Ball_1.jpg/220px-Dragon_Ball_1.jpg",
    description: "The adventures of Son Goku from childhood to adulthood as he trains in martial arts.",
    author: "Akira Toriyama",
    publisher: "Shueisha",
    englishPublisher: "Viz Media",
    publicationDate: "1984-1995",
    volumes: 42,
    chapters: 519,
    genre: ["Action", "Adventure", "Comedy", "Martial Arts"],
    rating: 8.9,
    popularity: 9.7,
    isComplete: true,
    isPopular: true,
    demographics: "Shonen",
    magazine: "Weekly Shonen Jump",
  },
  {
    id: 4,
    title: "Attack on Titan",
    slug: "attack-on-titan",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d6/Shingeki_no_Kyojin_manga_cover_1.jpg/220px-Shingeki_no_Kyojin_manga_cover_1.jpg",
    description: "Humanity fights for survival against human-eating giants.",
    author: "Hajime Isayama",
    publisher: "Kodansha",
    englishPublisher: "Kodansha USA",
    publicationDate: "2009-2021",
    volumes: 34,
    chapters: 139,
    genre: ["Action", "Dark Fantasy", "Drama", "Horror"],
    rating: 9.1,
    popularity: 9.4,
    isComplete: true,
    isPopular: true,
    demographics: "Shonen",
    magazine: "Bessatsu Shonen Magazine",
  },
  {
    id: 5,
    title: "Demon Slayer",
    slug: "demon-slayer",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/6/61/Demon_Slayer_vol_1.jpg/220px-Demon_Slayer_vol_1.jpg",
    description: "A boy becomes a demon slayer to avenge his family and cure his demon sister.",
    author: "Koyoharu Gotouge",
    publisher: "Shueisha",
    englishPublisher: "Viz Media",
    publicationDate: "2016-2020",
    volumes: 23,
    chapters: 205,
    genre: ["Action", "Dark Fantasy", "Martial Arts"],
    rating: 9.0,
    popularity: 9.6,
    isComplete: true,
    isPopular: true,
    demographics: "Shonen",
    magazine: "Weekly Shonen Jump",
  },
  {
    id: 6,
    title: "My Hero Academia",
    slug: "my-hero-academia",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/7/79/My_Hero_Academia_volume_1_cover.jpg/220px-My_Hero_Academia_volume_1_cover.jpg",
    description: "In a world where most people have superpowers, a powerless boy enrolls in a hero academy.",
    author: "Kohei Horikoshi",
    publisher: "Shueisha",
    englishPublisher: "Viz Media",
    publicationDate: "2014-Present",
    volumes: 37,
    chapters: 390,
    genre: ["Action", "Comedy", "Superhero"],
    rating: 8.7,
    popularity: 9.3,
    isComplete: false,
    isPopular: true,
    demographics: "Shonen",
    magazine: "Weekly Shonen Jump",
  },
  {
    id: 7,
    title: "Death Note",
    slug: "death-note",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/Death_Note_Vol_1.jpg/220px-Death_Note_Vol_1.jpg",
    description: "A genius student gains the power to kill anyone by writing their name in a supernatural notebook.",
    author: "Tsugumi Ohba, Takeshi Obata",
    publisher: "Shueisha",
    englishPublisher: "Viz Media",
    publicationDate: "2003-2006",
    volumes: 12,
    chapters: 108,
    genre: ["Mystery", "Psychological", "Supernatural", "Thriller"],
    rating: 9.2,
    popularity: 9.5,
    isComplete: true,
    isPopular: true,
    demographics: "Shonen",
    magazine: "Weekly Shonen Jump",
  },
  {
    id: 8,
    title: "Jujutsu Kaisen",
    slug: "jujutsu-kaisen",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/6/62/Jujutsu_Kaisen_1.png/220px-Jujutsu_Kaisen_1.png",
    description: "A boy swallows a cursed talisman and becomes a sorcerer fighting curses.",
    author: "Gege Akutami",
    publisher: "Shueisha",
    englishPublisher: "Viz Media",
    publicationDate: "2018-Present",
    volumes: 23,
    chapters: 240,
    genre: ["Action", "Dark Fantasy", "Supernatural"],
    rating: 8.9,
    popularity: 9.4,
    isComplete: false,
    isPopular: true,
    demographics: "Shonen",
    magazine: "Weekly Shonen Jump",
  },
  {
    id: 9,
    title: "Fullmetal Alchemist",
    slug: "fullmetal-alchemist",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/8/88/Fullmetal_Alchemist_Volume_1_Cover.jpg/220px-Fullmetal_Alchemist_Volume_1_Cover.jpg",
    description: "Two brothers use alchemy to try to revive their dead mother, with disastrous consequences.",
    author: "Hiromu Arakawa",
    publisher: "Square Enix",
    englishPublisher: "Viz Media",
    publicationDate: "2001-2010",
    volumes: 27,
    chapters: 108,
    genre: ["Action", "Adventure", "Dark Fantasy", "Steampunk"],
    rating: 9.3,
    popularity: 9.6,
    isComplete: true,
    isPopular: true,
    demographics: "Shonen",
    magazine: "Monthly Shonen Gangan",
  },
  {
    id: 10,
    title: "Hunter x Hunter",
    slug: "hunter-x-hunter",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Hunter_x_Hunter_cover_-_vol1.jpg/220px-Hunter_x_Hunter_cover_-_vol1.jpg",
    description: "A boy embarks on a journey to become a Hunter and find his missing father.",
    author: "Yoshihiro Togashi",
    publisher: "Shueisha",
    englishPublisher: "Viz Media",
    publicationDate: "1998-Present",
    volumes: 37,
    chapters: 400,
    genre: ["Action", "Adventure", "Fantasy"],
    rating: 9.1,
    popularity: 9.3,
    isComplete: false,
    isPopular: true,
    demographics: "Shonen",
    magazine: "Weekly Shonen Jump",
  },
];

const genres = ["All", "Action", "Adventure", "Fantasy", "Comedy", "Martial Arts", "Dark Fantasy", "Drama", "Horror", "Mystery", "Psychological", "Supernatural", "Thriller", "Superhero", "Steampunk"];
const demographics = ["All", "Shonen", "Seinen", "Shojo", "Josei", "Kodomo"];
const statuses = ["All", "Complete", "Ongoing"];

const MangaPage = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedDemographic, setSelectedDemographic] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Filter manga
  const filteredManga = mangaData.filter((manga) => {
    const matchesSearch = searchTerm === "" ||
      manga.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manga.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manga.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "All" || manga.genre.includes(selectedGenre);
    const matchesDemographic = selectedDemographic === "All" || manga.demographics === selectedDemographic;
    const matchesStatus = selectedStatus === "All" || (selectedStatus === "Complete" ? manga.isComplete : !manga.isComplete);
    return matchesSearch && matchesGenre && matchesDemographic && matchesStatus;
  });

  // Sort manga
  const sortedManga = [...filteredManga].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "popularity") return b.popularity - a.popularity;
    if (sortBy === "volumes") return b.volumes - a.volumes;
    if (sortBy === "title") return a.title.localeCompare(b.title);
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentManga = sortedManga.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedManga.length / itemsPerPage);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGenre("All");
    setSelectedDemographic("All");
    setSelectedStatus("All");
    setSortBy("popularity");
  };

  const hasActiveFilters = searchTerm !== "" || selectedGenre !== "All" || selectedDemographic !== "All" || selectedStatus !== "All";

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${theme.background?.navigationDots || (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}>
              <FaGlobeAsia className={`text-4xl ${theme.textColors?.highlight || 'text-red-600'}`} />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}>
            Manga Collection
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Explore the best manga from Japan - From classics to modern hits
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search manga..."
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Demographic</label>
                  <select
                    value={selectedDemographic}
                    onChange={(e) => setSelectedDemographic(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
                  >
                    {demographics.map(demo => (
                      <option key={demo} value={demo}>{demo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Status</label>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-all ${selectedStatus === status ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}`}
                      >
                        {status}
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
                    <option value="popularity">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="volumes">Most Volumes</option>
                    <option value="title">Title A-Z</option>
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
          Showing {sortedManga.length} manga series
        </div>

        {/* Manga Display */}
        {currentManga.length === 0 ? (
          <div className="text-center py-16">
            <FaBookOpen className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>No manga found</h3>
            <p className={`${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Try adjusting your search or filter criteria</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentManga.map((manga) => (
              <div
                key={manga.id}
                className={`group ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <div className="relative">
                  <div className={`p-4 ${theme.background?.bookCoverSide || (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')} flex justify-center items-center h-56`}>
                    <img src={manga.image} alt={manga.title} className="h-full object-contain" />
                  </div>
                  <div className="absolute top-2 left-2">
                    {manga.isComplete ? (
                      <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full">Complete</span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-orange-500 text-white rounded-full">Ongoing</span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                      <FaStar className="text-amber-400" /> {manga.rating}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className={`font-bold text-lg mb-1 line-clamp-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                    {manga.title}
                  </h3>
                  <p className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                    by {manga.author}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'}`}>
                      {manga.volumes} vols
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'}`}>
                      {manga.demographics}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className={`text-sm font-bold ${theme.textColors?.highlight || 'text-sky-600'}`}>
                      {manga.isComplete ? "Complete" : "Ongoing"}
                    </span>
                    <Link
                      href={`/comicdeatils/${manga.id}`}
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
            {currentManga.map((manga) => (
              <div
                key={manga.id}
                className={`flex flex-col sm:flex-row gap-4 p-4 ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} rounded-xl transition-all hover:shadow-lg`}
              >
                <div className="flex-shrink-0 w-32 h-40 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <img src={manga.image} alt={manga.title} className="h-32 object-contain" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {manga.isComplete ? (
                          <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded-full">Complete</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-orange-500 text-white rounded-full">Ongoing</span>
                        )}
                        {manga.isPopular && (
                          <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-full flex items-center gap-1">
                            <FaFire size={10} /> Popular
                          </span>
                        )}
                      </div>
                      <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{manga.title}</h3>
                      <p className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                        by {manga.author} | {manga.demographics}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaStar className="text-amber-400" />
                      <span className={`font-semibold ${theme.textColors?.primary || 'text-gray-900'}`}>{manga.rating}</span>
                    </div>
                  </div>
                  <p className={`text-sm line-clamp-2 mb-3 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{manga.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {manga.genre.slice(0, 3).map((genre, idx) => (
                      <span key={idx} className={`text-xs px-2 py-1 rounded-full ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'} ${theme.textColors?.secondary || 'text-gray-600'}`}>
                        {genre}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-4 text-sm">
                      <span className={`flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        <FaBookOpen size={12} /> {manga.volumes} volumes
                      </span>
                      <span className={`flex items-center gap-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                        <FaCalendarAlt size={12} /> {manga.publicationDate}
                      </span>
                    </div>
                    <Link
                      href={`/comicdeatils/${manga.id}`}
                      className={`px-4 py-2 text-sm ${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white rounded-lg hover:opacity-90 transition`}
                    >
                      View Details
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

export default MangaPage;