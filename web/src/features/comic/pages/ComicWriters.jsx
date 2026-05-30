"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { FaSearch, FaTwitter, FaWikipediaW, FaBook, FaAward, FaStar } from "react-icons/fa";

// Sample JSON data for Comic Writers
const comicWritersData = [
  {
    id: 1,
    name: "Stan Lee",
    slug: "stan-lee",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Stan_Lee_by_Gage_Skidmore_2.jpg/800px-Stan_Lee_by_Gage_Skidmore_2.jpg",
    bio: "Stan Lee was an American comic book writer, editor, publisher, and producer. He was the primary creative leader of Marvel Comics for two decades, leading its expansion from a small division of a publishing house to a multimedia corporation.",
    birthYear: 1922,
    deathYear: 2018,
    nationality: "American",
    notableWorks: ["Spider-Man", "X-Men", "Fantastic Four", "Iron Man", "Hulk", "Thor", "Daredevil", "Doctor Strange"],
    charactersCreated: ["Spider-Man", "Iron Man", "Thor", "Hulk", "X-Men", "Fantastic Four", "Daredevil", "Doctor Strange"],
    awards: ["National Medal of Arts", "Will Eisner Award Hall of Fame", "Inkpot Award", "Hollywood Walk of Fame"],
    publisher: "Marvel Comics",
    activeYears: "1941-2018",
    totalIssues: 2500,
    rating: 9.9,
    funFact: "Stan Lee made cameo appearances in nearly every Marvel film released after 2000.",
    socialLinks: {
      twitter: "@TheRealStanLee",
      wikipedia: "Stan_Lee"
    }
  },
  {
    id: 2,
    name: "Bob Kane",
    slug: "bob-kane",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Bob_Kane_1975.jpg/800px-Bob_Kane_1975.jpg",
    bio: "Bob Kane was an American comic book writer, animator and artist who co-created the DC Comics character Batman.",
    birthYear: 1915,
    deathYear: 1998,
    nationality: "American",
    notableWorks: ["Batman", "Robin", "Batmobile"],
    charactersCreated: ["Batman", "Robin", "Batmobile", "Joker", "Catwoman", "Penguin", "Riddler", "Two-Face"],
    awards: ["Inkpot Award", "Eisner Award Hall of Fame", "Jack Kirby Hall of Fame"],
    publisher: "DC Comics",
    activeYears: "1936-1998",
    totalIssues: 800,
    rating: 9.5,
    funFact: "Kane's original Batman design was inspired by Leonardo da Vinci's ornithopter and the 1926 film 'The Bat'.",
    socialLinks: {
      wikipedia: "Bob_Kane"
    }
  },
  {
    id: 3,
    name: "Alan Moore",
    slug: "alan-moore",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Alan_Moore_%282008%29.jpg/800px-Alan_Moore_%282008%29.jpg",
    bio: "Alan Moore is an English author known primarily for his work in comic books, often regarded as one of the best comic book writers in history.",
    birthYear: 1953,
    deathYear: null,
    nationality: "British",
    notableWorks: ["Watchmen", "V for Vendetta", "From Hell", "The League of Extraordinary Gentlemen", "Swamp Thing"],
    charactersCreated: ["V", "Marjorie Finlay", "John Constantine"],
    awards: ["Eisner Award", "Harvey Award", "Bram Stoker Award", "Hugo Award"],
    publisher: "DC Comics, Image Comics",
    activeYears: "1979-present",
    totalIssues: 1200,
    rating: 9.8,
    funFact: "Moore has refused royalties from film adaptations of his work, including Watchmen and V for Vendetta.",
    socialLinks: {
      wikipedia: "Alan_Moore"
    }
  },
  {
    id: 4,
    name: "Frank Miller",
    slug: "frank-miller",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Frank_Miller_%282017%29.jpg/800px-Frank_Miller_%282017%29.jpg",
    bio: "Frank Miller is an American comic book writer, artist, and film director known for his dark, film noir-style stories.",
    birthYear: 1957,
    deathYear: null,
    nationality: "American",
    notableWorks: ["The Dark Knight Returns", "Batman: Year One", "Sin City", "300", "Daredevil: Born Again"],
    charactersCreated: ["Marv", "Elektra", "Dwight McCarthy"],
    awards: ["Eisner Award", "Inkpot Award", "Kirby Award"],
    publisher: "DC Comics, Marvel Comics, Dark Horse Comics",
    activeYears: "1978-present",
    totalIssues: 900,
    rating: 9.4,
    funFact: "Miller's 'The Dark Knight Returns' redefined Batman and paved the way for darker superhero stories.",
    socialLinks: {
      wikipedia: "Frank_Miller"
    }
  },
  {
    id: 5,
    name: "Grant Morrison",
    slug: "grant-morrison",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Grant_Morrison_by_Gage_Skidmore.jpg/800px-Grant_Morrison_by_Gage_Skidmore.jpg",
    bio: "Grant Morrison is a Scottish comic book writer and playwright, known for their nonlinear narratives and metaphysical themes.",
    birthYear: 1960,
    deathYear: null,
    nationality: "Scottish",
    notableWorks: ["All-Star Superman", "Batman: Arkham Asylum", "The Invisibles", "JLA", "Doom Patrol"],
    charactersCreated: ["Flex Mentallo", "Crazy Jane", "Jesse Custer (co-creator)"],
    awards: ["Eisner Award", "Harvey Award", "Eagle Award"],
    publisher: "DC Comics, Marvel Comics",
    activeYears: "1978-present",
    totalIssues: 1500,
    rating: 9.3,
    funFact: "Morrison is a practicing chaos magician and often incorporates magical themes into their work.",
    socialLinks: {
      twitter: "@GrantMorrison",
      wikipedia: "Grant_Morrison"
    }
  }
];

const ComicWriters = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWriter, setSelectedWriter] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Filter writers based on search
  const filteredWriters = comicWritersData.filter((writer) => {
    const matchesSearch = 
      writer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      writer.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      writer.notableWorks.some(work => work.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Sort writers
  const sortedWriters = [...filteredWriters].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "totalIssues") return b.totalIssues - a.totalIssues;
    return 0;
  });

  // Modal for writer details
  const WriterModal = ({ writer, onClose }) => {
    if (!writer) return null;

    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-white')}`} onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="relative">
            <img src={writer.image} alt={writer.name} className="w-full h-64 object-cover rounded-t-2xl" />
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition">
              ✕
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className={`text-3xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  {writer.name}
                </h2>
                <p className={`text-lg ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                  {writer.birthYear}{writer.deathYear ? ` - ${writer.deathYear}` : " - Present"} | {writer.nationality}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`${i < Math.floor(writer.rating / 2) ? 'text-amber-400' : 'text-gray-300'}`} />
                ))}
                <span className={`ml-2 font-bold ${theme.textColors?.highlight || 'text-sky-600'}`}>{writer.rating}</span>
              </div>
            </div>

            <p className={`text-lg leading-relaxed mb-6 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
              {writer.bio}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className={`font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Notable Works</h3>
                <ul className="space-y-1">
                  {writer.notableWorks.map((work, i) => (
                    <li key={i} className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>• {work}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className={`font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Characters Created</h3>
                <ul className="space-y-1">
                  {writer.charactersCreated.slice(0, 5).map((character, i) => (
                    <li key={i} className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>• {character}</li>
                  ))}
                  {writer.charactersCreated.length > 5 && (
                    <li className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>• +{writer.charactersCreated.length - 5} more</li>
                  )}
                </ul>
              </div>
            </div>

            {writer.funFact && (
              <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                  <span className="font-bold">💡 Fun Fact:</span> {writer.funFact}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {writer.socialLinks?.twitter && (
                <a href={`https://twitter.com/${writer.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sky-500 hover:text-sky-600">
                  <FaTwitter /> Twitter
                </a>
              )}
              {writer.socialLinks?.wikipedia && (
                <a href={`https://en.wikipedia.org/wiki/${writer.socialLinks.wikipedia}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400">
                  <FaWikipediaW /> Wikipedia
                </a>
              )}
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
            Comic Writers
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Discover the legendary writers who brought our favorite superheroes and stories to life
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full sm:w-96">
            <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search writers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
            />
          </div>
          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
            >
              <option value="name">Sort by Name</option>
              <option value="rating">Sort by Rating</option>
              <option value="totalIssues">Sort by Total Issues</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => setViewMode("grid")} className={`px-4 py-2 rounded-lg transition ${viewMode === "grid" ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'}`}`}>Grid</button>
              <button onClick={() => setViewMode("list")} className={`px-4 py-2 rounded-lg transition ${viewMode === "list" ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'}`}`}>List</button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className={`text-center mb-6 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
          Found {sortedWriters.length} writer{sortedWriters.length !== 1 ? 's' : ''}
        </div>

        {/* Writers Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedWriters.map((writer) => (
              <div
                key={writer.id}
                onClick={() => setSelectedWriter(writer)}
                className={`cursor-pointer ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.container || 'shadow-lg'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <img src={writer.image} alt={writer.name} className="w-full h-56 object-cover" />
                <div className="p-4">
                  <h3 className={`text-xl font-bold mb-1 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{writer.name}</h3>
                  <p className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{writer.birthYear}{writer.deathYear ? ` - ${writer.deathYear}` : " - Present"} | {writer.publisher}</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={`w-4 h-4 ${i < Math.floor(writer.rating / 2) ? 'text-amber-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedWriters.map((writer) => (
              <div
                key={writer.id}
                onClick={() => setSelectedWriter(writer)}
                className={`cursor-pointer flex gap-6 p-4 ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.container || 'shadow-md'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl transition-all duration-300 hover:shadow-xl`}
              >
                <img src={writer.image} alt={writer.name} className="w-24 h-24 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{writer.name}</h3>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-4 h-4 ${i < Math.floor(writer.rating / 2) ? 'text-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{writer.birthYear}{writer.deathYear ? ` - ${writer.deathYear}` : " - Present"} | {writer.publisher} | {writer.totalIssues}+ issues</p>
                  <p className={`text-sm line-clamp-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{writer.bio}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <WriterModal writer={selectedWriter} onClose={() => setSelectedWriter(null)} />
      </div>
    </div>
  );
};

export default ComicWriters;