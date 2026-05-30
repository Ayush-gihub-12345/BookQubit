"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { FaSearch, FaStar, FaClock, FaBook, FaCalendar, FaTrophy, FaUsers } from "react-icons/fa";

// Sample JSON data for Comic Eras
const comicErasData = [
  {
    id: 1,
    name: "Golden Age",
    slug: "golden-age",
    startYear: 1938,
    endYear: 1956,
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c6/Action_Comics_1.jpg/220px-Action_Comics_1.jpg",
    description: "The Golden Age of Comic Books was the first major period of comic book history, beginning with the debut of Superman in Action Comics #1 in 1938.",
    keyEvents: ["First appearance of Superman (1938)", "First appearance of Batman (1939)", "First appearance of Wonder Woman (1941)", "World War II era superheroes", "Comic book censorship hearings (1954)"],
    iconicCharacters: ["Superman", "Batman", "Wonder Woman", "Captain America", "Flash (Jay Garrick)", "Green Lantern (Alan Scott)"],
    iconicCreators: ["Jerry Siegel", "Joe Shuster", "Bob Kane", "Bill Finger", "William Moulton Marston", "Jack Kirby", "Joe Simon"],
    majorPublishers: ["DC Comics (formerly National Publications)", "Timely Comics (later Marvel)", "Fawcett Comics", "Quality Comics"],
    notableComics: ["Action Comics #1", "Detective Comics #27", "All-Star Comics #8", "Captain America Comics #1", "Whiz Comics #2"],
    characteristics: ["Birth of superhero genre", "Patriotic heroes fighting Nazis", "Simple moral dichotomies", "Bright, primary colors", "Nostalgic, optimistic tone"],
    rating: 9.5,
    funFact: "The term 'Golden Age' was first coined by historian Richard Kyle in the 1960s, referring to the period of comic book creativity that began in the late 1930s.",
    totalIssues: 25000,
    impact: "Established the superhero archetype and laid the foundation for the entire comic book industry"
  },
  {
    id: 2,
    name: "Silver Age",
    slug: "silver-age",
    startYear: 1956,
    endYear: 1970,
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Showcase_4.jpg/220px-Showcase_4.jpg",
    description: "The Silver Age of Comic Books was a period of artistic advancement and commercial success in mainstream American comic books, led by the revival of superheroes at DC Comics and the rise of Marvel Comics.",
    keyEvents: ["First appearance of Barry Allen/The Flash (1956)", "First appearance of the Fantastic Four (1961)", "First appearance of Spider-Man (1962)", "First appearance of the X-Men (1963)", "Comics Code Authority regulations loosened"],
    iconicCharacters: ["Flash (Barry Allen)", "Spider-Man", "Fantastic Four", "X-Men", "Iron Man", "Thor", "Hulk", "Green Lantern (Hal Jordan)"],
    iconicCreators: ["Stan Lee", "Jack Kirby", "Steve Ditko", "John Broome", "Carmine Infantino", "Julius Schwartz", "Gardner Fox"],
    majorPublishers: ["DC Comics", "Marvel Comics", "Charlton Comics", "Dell Comics", "Gold Key Comics"],
    notableComics: ["Showcase #4", "Fantastic Four #1", "Amazing Fantasy #15", "The Incredible Hulk #1", "The Amazing Spider-Man #1"],
    characteristics: ["Complex characters with personal problems", "Scientific explanations for powers", "More sophisticated storytelling", "Vibrant art and dynamic action", "Social commentary"],
    rating: 9.8,
    funFact: "The Silver Age began with the revival of the Flash in Showcase #4 (1956), which led to a resurgence of superhero comics after the decline of the Golden Age.",
    totalIssues: 35000,
    impact: "Created the Marvel Universe, revolutionized superhero characterization, and established the foundation for modern superhero storytelling"
  },
  {
    id: 3,
    name: "Bronze Age",
    slug: "bronze-age",
    startYear: 1970,
    endYear: 1985,
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/Green_Lantern_Green_Arrow_85.jpg/220px-Green_Lantern_Green_Arrow_85.jpg",
    description: "The Bronze Age of Comic Books saw a return to darker, more socially conscious themes and more mature storytelling, with comics addressing real-world issues like drug abuse, racism, and environmentalism.",
    keyEvents: ["Green Lantern/Green Arrow #85 (1971) - Drug issue", "Death of Gwen Stacy (1973)", "First black superhero - Black Panther (1966) / Luke Cage (1972)", "X-Men relaunch with Giant-Size X-Men #1 (1975)", "First graphic novel - A Contract with God (1978)"],
    iconicCharacters: ["Wolverine", "Punisher", "Luke Cage", "John Stewart (Green Lantern)", "Storm", "Kitty Pryde", "Swamp Thing"],
    iconicCreators: ["Denny O'Neil", "Neal Adams", "Chris Claremont", "John Byrne", "Frank Miller", "Walt Simonson", "Jim Starlin"],
    majorPublishers: ["Marvel Comics", "DC Comics", "Warren Publishing", "Heavy Metal", "First Comics"],
    notableComics: ["Green Lantern/Green Arrow #76", "The Amazing Spider-Man #121-122 (Death of Gwen Stacy)", "Giant-Size X-Men #1", "The Dark Knight Returns (1986, late Bronze)", "Watchmen (1986-87, transition)"],
    characteristics: ["Socially conscious themes", "Darker, more complex storytelling", "Anti-heroes emerge", "Horror and fantasy genres flourish", "More realistic art styles"],
    rating: 9.6,
    funFact: "The Bronze Age is often considered a transition period between the simpler Silver Age and the darker, more mature Modern Age of comics.",
    totalIssues: 40000,
    impact: "Introduced mature themes, complex character development, and set the stage for the deconstructionist comics of the Modern Age"
  },
  {
    id: 4,
    name: "Modern Age",
    slug: "modern-age",
    startYear: 1985,
    endYear: "Present",
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b1/Watchmen_cover.jpg/220px-Watchmen_cover.jpg",
    description: "The Modern Age (also called the Dark Age or the Iron Age) is characterized by darker, more gritty storytelling, deconstruction of superhero tropes, and the rise of creator-owned comics.",
    keyEvents: ["Crisis on Infinite Earths (1985-86)", "Watchmen (1986-87)", "The Dark Knight Returns (1986)", "Vertigo imprint launch (1993)", "Marvel Knights/Ultimate Marvel launch (2000s)", "Digital comics and webcomics rise (2010s)"],
    iconicCharacters: ["Spider-Man (Miles Morales)", "Kamala Khan (Ms. Marvel)", "Harley Quinn", "Deadpool", "Invincible", "The Boys", "Spawn"],
    iconicCreators: ["Alan Moore", "Frank Miller", "Neil Gaiman", "Grant Morrison", "Todd McFarlane", "Robert Kirkman", "Scott Snyder", "Brian K. Vaughan"],
    majorPublishers: ["Marvel Comics", "DC Comics", "Image Comics", "Dark Horse Comics", "IDW Publishing", "BOOM! Studios"],
    notableComics: ["Watchmen", "The Dark Knight Returns", "Sandman", "Preacher", "The Walking Dead", "Saga", "Invincible", "Kingdom Come"],
    characteristics: ["Deconstruction of superheroes", "Gritty, realistic art styles", "Complex, morally ambiguous characters", "Creator-owned properties", "Graphic novels as mainstream", "Digital distribution"],
    rating: 9.4,
    funFact: "The Modern Age has been the longest era of comic books, spanning over 35 years and counting, with significant evolution in storytelling and art styles.",
    totalIssues: 80000,
    impact: "Revolutionized comic book storytelling, legitimized graphic novels as literature, and expanded comics into mainstream media through film and television"
  },
  {
    id: 5,
    name: "Platinum Age",
    slug: "platinum-age",
    startYear: 1897,
    endYear: 1938,
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/7/73/The_Yellow_Kid_%281898%29.jpg/220px-The_Yellow_Kid_%281898%29.jpg",
    description: "The Platinum Age refers to the earliest period of comic books, beginning with the first proto-comics and newspaper comic strips, leading up to the dawn of the superhero genre.",
    keyEvents: ["First comic strips appear in newspapers (1890s)", "The Yellow Kid appears in New York World (1895)", "First comic book - The Yellow Kid in McFadden's Flats (1897)", "Famous Funnies #1 - First true comic book (1933)", "New Fun #1 - First comic with all-new material (1935)"],
    iconicCharacters: ["The Yellow Kid", "The Katzenjammer Kids", "Mutt and Jeff", "Krazy Kat", "Popeye", "Buck Rogers", "Flash Gordon", "Tarzan"],
    iconicCreators: ["Richard F. Outcault", "George Herriman", "Winsor McCay", "E.C. Segar", "Alex Raymond", "Hal Foster"],
    majorPublishers: ["Eastern Color Printing", "Dell Publishing", "National Periodical Publications (pre-DC)", "Harvey Comics"],
    notableComics: ["The Yellow Kid in McFadden's Flats (1897)", "Famous Funnies #1 (1933)", "New Fun #1 (1935)", "Detective Comics #1 (1937)", "Action Comics #1 (1938)"],
    characteristics: ["Newspaper comic strips", "Reprint collections", "Humor and adventure genres", "Simple panel layouts", "Black and white interiors"],
    rating: 9.0,
    funFact: "The Platinum Age is named for the period of comic strip experimentation that laid the groundwork for the comic book industry we know today.",
    totalIssues: 5000,
    impact: "Established the comic strip format and created the distribution system that would later bring superhero comics to the masses"
  }
];

const ComicEras = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEra, setSelectedEra] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Filter eras based on search
  const filteredEras = comicErasData.filter((era) => {
    const matchesSearch = 
      era.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      era.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      era.iconicCharacters.some(char => char.toLowerCase().includes(searchTerm.toLowerCase())) ||
      era.keyEvents.some(event => event.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Sort eras
  const sortedEras = [...filteredEras].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "startYear") return a.startYear - b.startYear;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "totalIssues") return b.totalIssues - a.totalIssues;
    return 0;
  });

  // Modal for era details
  const EraModal = ({ era, onClose }) => {
    if (!era) return null;

    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-white')}`} onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <img src={era.image} alt={era.name} className="w-full h-64 object-cover rounded-t-2xl" />
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition">
              ✕
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className={`text-3xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  {era.name}
                </h2>
                <p className={`text-lg ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                  {era.startYear} - {era.endYear}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`${i < Math.floor(era.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                ))}
                <span className={`ml-2 font-bold ${theme.textColors?.highlight || 'text-sky-600'}`}>{era.rating}</span>
              </div>
            </div>

            <p className={`text-lg leading-relaxed mb-6 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
              {era.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  <FaCalendar /> Key Events
                </h3>
                <ul className="space-y-1">
                  {era.keyEvents.map((event, i) => (
                    <li key={i} className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>• {event}</li>
                  ))}
                </ul>
                
                <h3 className={`font-bold mt-4 mb-2 flex items-center gap-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  <FaUsers /> Iconic Creators
                </h3>
                <div className="flex flex-wrap gap-2">
                  {era.iconicCreators.map((creator, i) => (
                    <span key={i} className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                      {creator}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className={`font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>🦸 Iconic Characters</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {era.iconicCharacters.map((character, i) => (
                    <span key={i} className={`px-3 py-1 text-sm rounded-full ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                      {character}
                    </span>
                  ))}
                </div>

                <h3 className={`font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>📚 Major Publishers</h3>
                <div className="flex flex-wrap gap-2">
                  {era.majorPublishers.map((publisher, i) => (
                    <span key={i} className={`px-3 py-1 text-sm rounded-full ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                      {publisher}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className={`font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>✨ Characteristics</h3>
              <div className="flex flex-wrap gap-2">
                {era.characteristics.map((char, i) => (
                  <span key={i} className={`px-3 py-1 text-sm rounded-full ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                    {char}
                  </span>
                ))}
              </div>
            </div>

            {era.funFact && (
              <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                  <span className="font-bold">💡 Fun Fact:</span> {era.funFact}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{era.totalIssues.toLocaleString()}+</p>
                <p className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Comic Issues Published</p>
              </div>
              <div className="text-center">
                <p className={`text-sm ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{era.impact}</p>
                <p className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} mt-1`}>Impact on Industry</p>
              </div>
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
            Comic Eras
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Journey through the rich history of comic books from the Platinum Age to the Modern Era
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full sm:w-96">
            <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search eras by name, characters, or key events..."
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
              <option value="startYear">Sort by Start Year</option>
              <option value="rating">Sort by Rating</option>
              <option value="totalIssues">Sort by Total Issues</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => setViewMode("grid")} className={`px-4 py-2 rounded-lg transition ${viewMode === "grid" ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}`}>Grid</button>
              <button onClick={() => setViewMode("list")} className={`px-4 py-2 rounded-lg transition ${viewMode === "list" ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}`}>List</button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className={`text-center mb-6 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
          Found {sortedEras.length} era{sortedEras.length !== 1 ? 's' : ''}
        </div>

        {/* Eras Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEras.map((era) => (
              <div
                key={era.id}
                onClick={() => setSelectedEra(era)}
                className={`cursor-pointer ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.container || 'shadow-lg'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <img src={era.image} alt={era.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{era.name}</h3>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-3 h-3 ${i < Math.floor(era.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{era.startYear} - {era.endYear}</p>
                  <p className={`text-sm line-clamp-3 mb-3 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{era.description}</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs px-2 py-0.5 bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-full">{era.rating} Rating</span>
                    <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full">{era.totalIssues.toLocaleString()} issues</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEras.map((era) => (
              <div
                key={era.id}
                onClick={() => setSelectedEra(era)}
                className={`cursor-pointer flex gap-6 p-4 ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.container || 'shadow-md'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl transition-all duration-300 hover:shadow-xl`}
              >
                <img src={era.image} alt={era.name} className="w-32 h-40 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{era.name}</h3>
                      <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{era.startYear} - {era.endYear}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-4 h-4 ${i < Math.floor(era.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className={`text-sm line-clamp-2 mb-3 mt-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{era.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {era.iconicCharacters.slice(0, 3).map((char, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <EraModal era={selectedEra} onClose={() => setSelectedEra(null)} />
      </div>
    </div>
  );
};

export default ComicEras;