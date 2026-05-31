"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { FaSearch, FaStar, FaPaintBrush, FaPalette, FaTrophy, FaTwitter, FaInstagram, FaGlobe } from "react-icons/fa";

// Sample JSON data for Comic Artists
const comicArtistsData = [
  {
    id: 1,
    name: "Jack Kirby",
    slug: "jack-kirby",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Jack_Kirby_1992.jpg/800px-Jack_Kirby_1992.jpg",
    bio: "Jack Kirby was an American comic book artist, writer, and editor, widely regarded as one of the most influential creators in the medium. He co-created many of Marvel's most iconic characters including Captain America, the Fantastic Four, the X-Men, and the Hulk.",
    birthYear: 1917,
    deathYear: 1994,
    nationality: "American",
    notableWorks: ["Captain America", "Fantastic Four", "X-Men", "Hulk", "Thor", "Iron Man", "New Gods", "Kamandi"],
    charactersCreated: ["Captain America", "Fantastic Four", "X-Men", "Hulk", "Thor", "Galactus", "Silver Surfer", "Darkseid"],
    awards: ["Eisner Award Hall of Fame", "Inkpot Award", "Harvey Award Hall of Fame", "Will Eisner Comic Book Hall of Fame"],
    publisher: "Marvel Comics, DC Comics",
    activeYears: "1936-1994",
    totalIssues: 2500,
    rating: 9.9,
    style: "Dynamic, High Energy, Cosmic Scale",
    funFact: "Kirby created over 1,000 characters during his career, earning him the nickname 'The King of Comics'.",
    socialLinks: {
      wikipedia: "Jack_Kirby"
    }
  },
  {
    id: 2,
    name: "Steve Ditko",
    slug: "steve-ditko",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Steve_Ditko_%282011%29.jpg/800px-Steve_Ditko_%282011%29.jpg",
    bio: "Steve Ditko was an American comic book artist and writer, best known for co-creating Marvel's Spider-Man and Doctor Strange. His art style is characterized by its unique surrealism and abstract expressionism.",
    birthYear: 1927,
    deathYear: 2018,
    nationality: "American",
    notableWorks: ["Spider-Man", "Doctor Strange", "The Question", "Mr. A", "Blue Beetle (Ted Kord)"],
    charactersCreated: ["Spider-Man", "Doctor Strange", "The Question", "Mr. A", "Speedball", "Squirrel Girl"],
    awards: ["Eisner Award Hall of Fame", "Will Eisner Comic Book Hall of Fame", "Inkpot Award"],
    publisher: "Marvel Comics, DC Comics, Charlton Comics",
    activeYears: "1953-2018",
    totalIssues: 1800,
    rating: 9.8,
    style: "Surreal, Abstract, Psychological",
    funFact: "Ditko was known for being intensely private, rarely giving interviews or making public appearances throughout his career.",
    socialLinks: {
      wikipedia: "Steve_Ditko"
    }
  },
  {
    id: 3,
    name: "Todd McFarlane",
    slug: "todd-mcfarlane",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Todd_McFarlane_by_Gage_Skidmore.jpg/800px-Todd_McFarlane_by_Gage_Skidmore.jpg",
    bio: "Todd McFarlane is a Canadian comic book writer, artist, and entrepreneur, best known for his work on Spider-Man and for creating the character Spawn. His detailed, hyper-dynamic art style revolutionized comic art in the 1990s.",
    birthYear: 1961,
    deathYear: null,
    nationality: "Canadian",
    notableWorks: ["Spider-Man", "Spawn", "Batman: Year Two", "The Incredible Hulk"],
    charactersCreated: ["Spawn", "Venom (co-creator)", "Cletus Kasady/Carnage (co-creator)", "Angela", "Violator"],
    awards: ["Eisner Award", "Harvey Award", "Inkpot Award", "Kirby Award"],
    publisher: "Marvel Comics, Image Comics",
    activeYears: "1984-present",
    totalIssues: 1200,
    rating: 9.6,
    style: "Detail-oriented, Dark, Dynamic, High Contrast",
    funFact: "McFarlane's Spider-Man #1, published in 1990, sold over 2.5 million copies, making it the best-selling comic book of all time.",
    socialLinks: {
      twitter: "@Todd_McFarlane",
      instagram: "@toddfirm",
      wikipedia: "Todd_McFarlane"
    }
  },
  {
    id: 4,
    name: "Alex Ross",
    slug: "alex-ross",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Alex_Ross_%28cropped%29.jpg/800px-Alex_Ross_%28cropped%29.jpg",
    bio: "Alex Ross is an American comic book writer and artist known for his photorealistic painted art. He has worked on major projects for both Marvel and DC, including 'Kingdom Come' and 'Marvels'.",
    birthYear: 1970,
    deathYear: null,
    nationality: "American",
    notableWorks: ["Kingdom Come", "Marvels", "Earth X", "Justice", "Batman: War on Crime"],
    charactersCreated: ["Gog", "Magog", "Starman (Thom Kallor revamp)"],
    awards: ["Eisner Award", "Harvey Award", "National Cartoonists Society Award", "Spectrum Award"],
    publisher: "DC Comics, Marvel Comics",
    activeYears: "1993-present",
    totalIssues: 500,
    rating: 9.7,
    style: "Photorealistic, Painterly, Classical",
    funFact: "Ross often uses live models and paints his artwork using gouache, a water-based medium, for its vibrant, matte finish.",
    socialLinks: {
      twitter: "@thealexrossart",
      instagram: "@thealexrossart",
      wikipedia: "Alex_Ross"
    }
  },
  {
    id: 5,
    name: "Jim Lee",
    slug: "jim-lee",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Jim_Lee_by_Gage_Skidmore.jpg/800px-Jim_Lee_by_Gage_Skidmore.jpg",
    bio: "Jim Lee is a Korean-American comic book artist, writer, and publisher. He is known for his detailed, kinetic art style and his work on titles like X-Men, Batman, and Superman.",
    birthYear: 1964,
    deathYear: null,
    nationality: "Korean-American",
    notableWorks: ["X-Men", "Batman: Hush", "Superman: Unchained", "Justice League", "WildC.A.T.s"],
    charactersCreated: ["Gambit", "Omega Red", "Cable (co-creator)", "WildC.A.T.s", "Gen13"],
    awards: ["Eisner Award", "Harvey Award", "Inkpot Award", "Wizard Fan Award"],
    publisher: "Marvel Comics, DC Comics, Image Comics",
    activeYears: "1987-present",
    totalIssues: 1500,
    rating: 9.5,
    style: "Detailed, Kinetic, High Energy, Manga-influenced",
    funFact: "Lee is currently the Publisher and Chief Creative Officer of DC Comics.",
    socialLinks: {
      twitter: "@JimLee",
      instagram: "@jimlee",
      wikipedia: "Jim_Lee"
    }
  },
  {
    id: 6,
    name: "Frank Quitely",
    slug: "frank-quitely",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Frank-Quitely.jpg/800px-Frank-Quitely.jpg",
    bio: "Frank Quitely is a Scottish comic book artist known for his distinctive, organic art style. He has collaborated frequently with writer Grant Morrison on acclaimed series like 'All-Star Superman' and 'We3'.",
    birthYear: 1968,
    deathYear: null,
    nationality: "Scottish",
    notableWorks: ["All-Star Superman", "We3", "Flex Mentallo", "Batman and Robin", "Jupiter's Legacy"],
    charactersCreated: ["Promethea (artist co-creator)", "Flex Mentallo"],
    awards: ["Eisner Award", "Harvey Award", "Eagle Award"],
    publisher: "DC Comics, Marvel Comics, Image Comics",
    activeYears: "1990-present",
    totalIssues: 400,
    rating: 9.4,
    style: "Organic, Detailed, Expressive Lines",
    funFact: "Quitely's art is often noted for its unusual panel layouts and distinctive character expressions.",
    socialLinks: {
      wikipedia: "Frank_Quitely"
    }
  }
];

const ComicArtists = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Filter artists based on search
  const filteredArtists = comicArtistsData.filter((artist) => {
    const matchesSearch = 
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.notableWorks.some(work => work.toLowerCase().includes(searchTerm.toLowerCase())) ||
      artist.charactersCreated.some(char => char.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Sort artists
  const sortedArtists = [...filteredArtists].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "totalIssues") return b.totalIssues - a.totalIssues;
    if (sortBy === "activeYears") return b.activeYears - a.activeYears;
    return 0;
  });

  // Modal for artist details
  const ArtistModal = ({ artist, onClose }) => {
    if (!artist) return null;

    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-white')}`} onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <img src={artist.image} alt={artist.name} className="w-full h-64 object-cover rounded-t-2xl" />
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition">
              ✕
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className={`text-3xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  {artist.name}
                </h2>
                <p className={`text-lg ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                  {artist.birthYear}{artist.deathYear ? ` - ${artist.deathYear}` : " - Present"} | {artist.nationality}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`${i < Math.floor(artist.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                ))}
                <span className={`ml-2 font-bold ${theme.textColors?.highlight || 'text-sky-600'}`}>{artist.rating}</span>
              </div>
            </div>

            <p className={`text-lg leading-relaxed mb-6 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
              {artist.bio}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  <FaPaintBrush /> Style
                </h3>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{artist.style}</p>
                
                <h3 className={`font-bold mt-4 mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>📊 Career Info</h3>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Active: {artist.activeYears}</p>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Issues: {artist.totalIssues}+</p>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Publisher: {artist.publisher}</p>
              </div>
              <div>
                <h3 className={`font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>🏆 Notable Works</h3>
                <ul className="space-y-1">
                  {artist.notableWorks.slice(0, 5).map((work, i) => (
                    <li key={i} className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>• {work}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                🦸 Characters Created
              </h3>
              <div className="flex flex-wrap gap-2">
                {artist.charactersCreated.map((character, i) => (
                  <span key={i} className={`px-3 py-1 text-sm rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                    {character}
                  </span>
                ))}
              </div>
            </div>

            {artist.awards && artist.awards.length > 0 && (
              <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  <FaTrophy className="text-yellow-500" /> Awards
                </h3>
                {artist.awards.map((award, i) => (
                  <p key={i} className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>🏆 {award}</p>
                ))}
              </div>
            )}

            {artist.funFact && (
              <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                  <span className="font-bold">💡 Fun Fact:</span> {artist.funFact}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {artist.socialLinks?.twitter && (
                <a href={`https://twitter.com/${artist.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sky-500 hover:text-sky-600">
                  <FaTwitter /> Twitter
                </a>
              )}
              {artist.socialLinks?.instagram && (
                <a href={`https://instagram.com/${artist.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-pink-500 hover:text-pink-600">
                  <FaInstagram /> Instagram
                </a>
              )}
              {artist.socialLinks?.wikipedia && (
                <a href={`https://en.wikipedia.org/wiki/${artist.socialLinks.wikipedia}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400">
                  <FaGlobe /> Wikipedia
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
            Comic Artists
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Discover the legendary artists who brought our favorite heroes to life with their incredible artwork
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full sm:w-96">
            <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search artists by name, style, or characters..."
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
              <option value="activeYears">Sort by Active Years</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => setViewMode("grid")} className={`px-4 py-2 rounded-lg transition ${viewMode === "grid" ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}`}>Grid</button>
              <button onClick={() => setViewMode("list")} className={`px-4 py-2 rounded-lg transition ${viewMode === "list" ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}`}>List</button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className={`text-center mb-6 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
          Found {sortedArtists.length} artist{sortedArtists.length !== 1 ? 's' : ''}
        </div>

        {/* Artists Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedArtists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => setSelectedArtist(artist)}
                className={`cursor-pointer ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.container || 'shadow-lg'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <img src={artist.image} alt={artist.name} className="w-full h-64 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{artist.name}</h3>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-3 h-3 ${i < Math.floor(artist.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{artist.birthYear}{artist.deathYear ? ` - ${artist.deathYear}` : " - Present"} | {artist.nationality}</p>
                  <p className={`text-sm line-clamp-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{artist.bio}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="text-xs px-2 py-0.5 bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-full">{artist.totalIssues}+ issues</span>
                    <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full truncate max-w-[150px]">{artist.style.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedArtists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => setSelectedArtist(artist)}
                className={`cursor-pointer flex gap-6 p-4 ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.container || 'shadow-md'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl transition-all duration-300 hover:shadow-xl`}
              >
                <img src={artist.image} alt={artist.name} className="w-24 h-24 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{artist.name}</h3>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-4 h-4 ${i < Math.floor(artist.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{artist.birthYear}{artist.deathYear ? ` - ${artist.deathYear}` : " - Present"} | {artist.nationality} | {artist.totalIssues}+ issues</p>
                  <p className={`text-sm line-clamp-2 mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{artist.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {artist.notableWorks.slice(0, 2).map((work, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                        {work}
                      </span>
                    ))}
                    {artist.notableWorks.length > 2 && (
                      <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                        +{artist.notableWorks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <ArtistModal artist={selectedArtist} onClose={() => setSelectedArtist(null)} />
      </div>
    </div>
  );
};

export default ComicArtists;