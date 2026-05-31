"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { FaSearch, FaStar, FaBook, FaCalendar, FaUsers, FaAward, FaFire } from "react-icons/fa";

// Sample JSON data for Comic Series
const comicSeriesData = [
  {
    id: 1,
    title: "The Amazing Spider-Man",
    slug: "amazing-spider-man",
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/3/35/The_Amazing_Spider-Man_%282014%29.jpg/220px-The_Amazing_Spider-Man_%282014%29.jpg",
    publisher: "Marvel Comics",
    firstIssue: 1963,
    lastIssue: "Ongoing",
    totalIssues: 950,
    creators: ["Stan Lee", "Steve Ditko"],
    mainCharacters: ["Spider-Man", "Green Goblin", "Doctor Octopus", "Venom"],
    genres: ["Superhero", "Action", "Adventure"],
    rating: 9.5,
    description: "The Amazing Spider-Man is an ongoing comic book series featuring the adventures of the superhero Spider-Man. The series debuted in 1963 and has become one of Marvel's flagship titles.",
    awards: ["Eisner Award for Best Continuing Series", "Harvey Award for Best Series"],
    status: "active",
    collectedVolumes: 25,
    popularity: 98,
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/3/35/The_Amazing_Spider-Man_%282014%29.jpg/220px-The_Amazing_Spider-Man_%282014%29.jpg"
  },
  {
    id: 2,
    title: "Batman",
    slug: "batman",
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Batman_Vol_3_1.jpg/220px-Batman_Vol_3_1.jpg",
    publisher: "DC Comics",
    firstIssue: 1940,
    lastIssue: "Ongoing",
    totalIssues: 900,
    creators: ["Bob Kane", "Bill Finger"],
    mainCharacters: ["Batman", "Robin", "Joker", "Catwoman", "Alfred"],
    genres: ["Superhero", "Crime", "Noir"],
    rating: 9.7,
    description: "The Batman series follows the adventures of the Dark Knight as he protects Gotham City from its darkest threats.",
    awards: ["Eisner Award for Best Continuing Series", "Harvey Award for Best Artist"],
    status: "active",
    collectedVolumes: 30,
    popularity: 99,
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Batman_Vol_3_1.jpg/220px-Batman_Vol_3_1.jpg"
  },
  {
    id: 3,
    title: "X-Men",
    slug: "x-men",
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/X-Men_Vol_1_1.jpg/220px-X-Men_Vol_1_1.jpg",
    publisher: "Marvel Comics",
    firstIssue: 1963,
    lastIssue: "Ongoing",
    totalIssues: 850,
    creators: ["Stan Lee", "Jack Kirby"],
    mainCharacters: ["Wolverine", "Cyclops", "Jean Grey", "Storm", "Professor X", "Magneto"],
    genres: ["Superhero", "Science Fiction", "Action"],
    rating: 9.4,
    description: "X-Men tells the story of mutants born with extraordinary powers, fighting for a world that fears and hates them.",
    awards: ["Eisner Award for Best Series", "GLAAD Media Award"],
    status: "active",
    collectedVolumes: 28,
    popularity: 95,
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/X-Men_Vol_1_1.jpg/220px-X-Men_Vol_1_1.jpg"
  },
  {
    id: 4,
    title: "Watchmen",
    slug: "watchmen",
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b1/Watchmen_cover.jpg/220px-Watchmen_cover.jpg",
    publisher: "DC Comics",
    firstIssue: 1986,
    lastIssue: 1987,
    totalIssues: 12,
    creators: ["Alan Moore", "Dave Gibbons"],
    mainCharacters: ["Rorschach", "Doctor Manhattan", "Nite Owl", "Silk Spectre", "Ozymandias"],
    genres: ["Superhero", "Drama", "Mystery"],
    rating: 9.9,
    description: "Watchmen is a groundbreaking limited series that deconstructs the superhero genre and explores complex themes of power, morality, and humanity.",
    awards: ["Eisner Award for Best Limited Series", "Hugo Award for Best Other Form"],
    status: "completed",
    collectedVolumes: 1,
    popularity: 94,
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b1/Watchmen_cover.jpg/220px-Watchmen_cover.jpg"
  },
  {
    id: 5,
    title: "The Walking Dead",
    slug: "walking-dead",
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/The_Walking_Dead_1.jpg/220px-The_Walking_Dead_1.jpg",
    publisher: "Image Comics",
    firstIssue: 2003,
    lastIssue: 2019,
    totalIssues: 193,
    creators: ["Robert Kirkman", "Tony Moore", "Charlie Adlard"],
    mainCharacters: ["Rick Grimes", "Michonne", "Daryl Dixon", "Glenn", "Carl Grimes"],
    genres: ["Horror", "Zombie", "Drama", "Post-Apocalyptic"],
    rating: 9.1,
    description: "The Walking Dead follows a group of survivors navigating a zombie apocalypse, focusing on human drama and survival rather than the zombies themselves.",
    awards: ["Eisner Award for Best Continuing Series", "Harvey Award for Best Writer"],
    status: "completed",
    collectedVolumes: 32,
    popularity: 88,
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/The_Walking_Dead_1.jpg/220px-The_Walking_Dead_1.jpg"
  },
  {
    id: 6,
    title: "Spawn",
    slug: "spawn",
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Spawn_1.jpg/220px-Spawn_1.jpg",
    publisher: "Image Comics",
    firstIssue: 1992,
    lastIssue: "Ongoing",
    totalIssues: 350,
    creators: ["Todd McFarlane"],
    mainCharacters: ["Spawn", "Violator", "Malebolgia", "Angela", "Cogliostro"],
    genres: ["Superhero", "Horror", "Dark Fantasy"],
    rating: 8.9,
    description: "Spawn follows Al Simmons, a soldier who makes a deal with the devil to see his wife again, becoming a Hellspawn in the process.",
    awards: ["Eisner Award for Best Artist"],
    status: "active",
    collectedVolumes: 15,
    popularity: 82,
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Spawn_1.jpg/220px-Spawn_1.jpg"
  },
  {
    id: 7,
    title: "The Sandman",
    slug: "sandman",
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/The_Sandman_1.jpg/220px-The_Sandman_1.jpg",
    publisher: "DC Comics",
    firstIssue: 1989,
    lastIssue: 1996,
    totalIssues: 75,
    creators: ["Neil Gaiman", "Sam Kieth", "Mike Dringenberg"],
    mainCharacters: ["Dream", "Death", "Lucifer", "Desire", "Destiny"],
    genres: ["Fantasy", "Horror", "Mythological", "Dark Fantasy"],
    rating: 9.8,
    description: "The Sandman tells the story of Dream, the anthropomorphic personification of dreams, and his family, The Endless.",
    awards: ["Eisner Award for Best Writer", "World Fantasy Award for Best Short Fiction"],
    status: "completed",
    collectedVolumes: 14,
    popularity: 92,
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/The_Sandman_1.jpg/220px-The_Sandman_1.jpg"
  },
  {
    id: 8,
    title: "Hellboy",
    slug: "hellboy",
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Hellboy_1.jpg/220px-Hellboy_1.jpg",
    publisher: "Dark Horse Comics",
    firstIssue: 1994,
    lastIssue: "Ongoing",
    totalIssues: 120,
    creators: ["Mike Mignola"],
    mainCharacters: ["Hellboy", "Abe Sapien", "Liz Sherman", "Lobster Johnson"],
    genres: ["Superhero", "Horror", "Occult", "Mystery"],
    rating: 9.2,
    description: "Hellboy follows the world's greatest paranormal investigator, a demon summoned as a baby during World War II.",
    awards: ["Eisner Award for Best Writer/Artist", "Harvey Award for Best Artist"],
    status: "active",
    collectedVolumes: 20,
    popularity: 86,
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Hellboy_1.jpg/220px-Hellboy_1.jpg"
  },
  {
    id: 9,
    title: "Wonder Woman",
    slug: "wonder-woman",
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Wonder_Woman_Vol_1_1.jpg/220px-Wonder_Woman_Vol_1_1.jpg",
    publisher: "DC Comics",
    firstIssue: 1942,
    lastIssue: "Ongoing",
    totalIssues: 800,
    creators: ["William Moulton Marston", "H. G. Peter"],
    mainCharacters: ["Wonder Woman", "Steve Trevor", "Ares", "Cheetah", "Donna Troy"],
    genres: ["Superhero", "Fantasy", "Action"],
    rating: 9.3,
    description: "Wonder Woman follows the adventures of Diana, princess of the Amazons, as she protects man's world.",
    awards: ["Eisner Award for Best Continuing Series"],
    status: "active",
    collectedVolumes: 22,
    popularity: 89,
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Wonder_Woman_Vol_1_1.jpg/220px-Wonder_Woman_Vol_1_1.jpg"
  },
  {
    id: 10,
    title: "Invincible",
    slug: "invincible",
    coverImage: "https://upload.wikimedia.org/wikipedia/en/thumb/6/62/Invincible_1.jpg/220px-Invincible_1.jpg",
    publisher: "Image Comics",
    firstIssue: 2003,
    lastIssue: 2018,
    totalIssues: 144,
    creators: ["Robert Kirkman", "Cory Walker", "Ryan Ottley"],
    mainCharacters: ["Invincible", "Omni-Man", "Atom Eve", "Allen the Alien"],
    genres: ["Superhero", "Action", "Sci-Fi"],
    rating: 9.6,
    description: "Invincible follows Mark Grayson, a teenager who inherits superpowers from his father, the world's most powerful superhero.",
    awards: ["Eisner Award for Best Continuing Series"],
    status: "completed",
    collectedVolumes: 25,
    popularity: 91,
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/6/62/Invincible_1.jpg/220px-Invincible_1.jpg"
  }
];

const ComicSeries = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPublisher, setSelectedPublisher] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("rating");

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Get unique publishers and statuses
  const publishers = ["All", ...new Set(comicSeriesData.map(series => series.publisher))];
  const statuses = ["All", ...new Set(comicSeriesData.map(series => series.status))];

  // Filter series
  const filteredSeries = comicSeriesData.filter((series) => {
    const matchesSearch = 
      series.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      series.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      series.creators.some(creator => creator.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPublisher = selectedPublisher === "All" || series.publisher === selectedPublisher;
    const matchesStatus = selectedStatus === "All" || series.status === selectedStatus;
    return matchesSearch && matchesPublisher && matchesStatus;
  });

  // Sort series
  const sortedSeries = [...filteredSeries].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "popularity") return b.popularity - a.popularity;
    if (sortBy === "totalIssues") return b.totalIssues - a.totalIssues;
    if (sortBy === "title") return a.title.localeCompare(b.title);
    return 0;
  });

  // Modal for series details
  const SeriesModal = ({ series, onClose }) => {
    if (!series) return null;

    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-white')}`} onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <img src={series.image} alt={series.title} className="w-full h-64 object-cover rounded-t-2xl" />
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition">
              ✕
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className={`text-3xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  {series.title}
                </h2>
                <p className={`text-lg ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                  {series.publisher} | {series.firstIssue} - {series.lastIssue}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`${i < Math.floor(series.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                ))}
                <span className={`ml-2 font-bold ${theme.textColors?.highlight || 'text-sky-600'}`}>{series.rating}</span>
              </div>
            </div>

            <p className={`text-lg leading-relaxed mb-6 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
              {series.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className={`font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>📊 Publication Info</h3>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Total Issues: {series.totalIssues}</p>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Collected Volumes: {series.collectedVolumes}</p>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Status: <span className={`capitalize font-semibold ${series.status === 'active' ? 'text-green-500' : 'text-gray-500'}`}>{series.status}</span></p>
              </div>
              <div>
                <h3 className={`font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>👥 Creators</h3>
                {series.creators.map((creator, i) => (
                  <p key={i} className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>• {creator}</p>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className={`font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>🎭 Main Characters</h3>
              <div className="flex flex-wrap gap-2">
                {series.mainCharacters.map((character, i) => (
                  <span key={i} className={`px-3 py-1 text-sm rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                    {character}
                  </span>
                ))}
              </div>
            </div>

            {series.awards && series.awards.length > 0 && (
              <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  <FaAward className="text-yellow-500" /> Awards
                </h3>
                {series.awards.map((award, i) => (
                  <p key={i} className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>🏆 {award}</p>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link href={`/comicslist?series=${series.slug}`} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition">
                Browse Issues
              </Link>
              <Link href={`/comicslist?publisher=${series.publisher}`} className={`px-4 py-2 rounded-lg border transition ${theme.border?.default || 'border-gray-300'} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                More from {series.publisher}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-4`}>
            Comic Series
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Explore the greatest comic book series from Marvel, DC, Image, and more
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full lg:w-96">
            <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search series by title, creator, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedPublisher}
              onChange={(e) => setSelectedPublisher(e.target.value)}
              className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
            >
              {publishers.map((publisher) => (
                <option key={publisher} value={publisher}>{publisher}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
            >
              <option value="rating">Sort by Rating</option>
              <option value="popularity">Sort by Popularity</option>
              <option value="totalIssues">Sort by Total Issues</option>
              <option value="title">Sort by Title</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => setViewMode("grid")} className={`px-4 py-2 rounded-lg transition ${viewMode === "grid" ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}`}>Grid</button>
              <button onClick={() => setViewMode("list")} className={`px-4 py-2 rounded-lg transition ${viewMode === "list" ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}`}>List</button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className={`text-center mb-6 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
          Found {sortedSeries.length} series
        </div>

        {/* Series Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedSeries.map((series) => (
              <div
                key={series.id}
                onClick={() => setSelectedSeries(series)}
                className={`cursor-pointer ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.container || 'shadow-lg'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <img src={series.image} alt={series.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-lg font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{series.title}</h3>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-3 h-3 ${i < Math.floor(series.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className={`text-xs mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{series.publisher} | {series.firstIssue}</p>
                  <p className={`text-sm line-clamp-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{series.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {series.status === "active" && <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full">Active</span>}
                    <span className="text-xs px-2 py-0.5 bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-full">{series.totalIssues} issues</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSeries.map((series) => (
              <div
                key={series.id}
                onClick={() => setSelectedSeries(series)}
                className={`cursor-pointer flex gap-6 p-4 ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.container || 'shadow-md'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl transition-all duration-300 hover:shadow-xl`}
              >
                <img src={series.image} alt={series.title} className="w-32 h-40 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{series.title}</h3>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-4 h-4 ${i < Math.floor(series.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{series.publisher} | {series.firstIssue} - {series.lastIssue} | {series.totalIssues} issues</p>
                  <p className={`text-sm line-clamp-2 mb-3 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{series.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {series.creators.slice(0, 2).map((creator, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                        {creator}
                      </span>
                    ))}
                    {series.creators.length > 2 && (
                      <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                        +{series.creators.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <SeriesModal series={selectedSeries} onClose={() => setSelectedSeries(null)} />
      </div>
    </div>
  );
};

export default ComicSeries;