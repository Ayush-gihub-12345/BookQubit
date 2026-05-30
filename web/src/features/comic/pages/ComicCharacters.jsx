"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { FaSearch, FaStar, FaMask, FaTrophy, FaUsers, FaBook, FaHeart } from "react-icons/fa";

// Sample JSON data for Comic Characters
const comicCharactersData = [
  {
    id: 1,
    name: "Spider-Man",
    slug: "spider-man",
    image: "https://i.pinimg.com/1200x/9c/c5/43/9cc543e2c41bd54e25ac85993acd322a.jpg",
    realName: "Peter Parker",
    firstAppearance: "Amazing Fantasy #15 (1962)",
    publisher: "Marvel Comics",
    creators: ["Stan Lee", "Steve Ditko"],
    abilities: ["Superhuman strength", "Wall-crawling", "Spider-sense", "Genius-level intellect"],
    teams: ["Avengers", "Fantastic Four", "Web Warriors"],
    allies: ["Mary Jane Watson", "Aunt May", "Miles Morales", "Gwen Stacy"],
    enemies: ["Green Goblin", "Doctor Octopus", "Venom", "Carnage", "Sandman"],
    rating: 9.9,
    description: "Spider-Man is a superhero created by writer-editor Stan Lee and writer-artist Steve Ditko. He is one of the most iconic and popular superheroes in comic book history.",
    funFact: "Spider-Man was originally going to be called 'Spider-Man' but Stan Lee changed it because he thought it sounded like a villain.",
    comicsAppeared: 4500,
    yearCreated: 1962
  },
  {
    id: 2,
    name: "Batman",
    slug: "batman",
    image: "https://i.pinimg.com/736x/64/e7/e3/64e7e392bcfac54ebabd07bfa29c224a.jpg",
    realName: "Bruce Wayne",
    firstAppearance: "Detective Comics #27 (1939)",
    publisher: "DC Comics",
    creators: ["Bob Kane", "Bill Finger"],
    abilities: ["Genius-level intellect", "Peak human physical condition", "Master detective", "Expert martial artist"],
    teams: ["Justice League", "Batman Family", "Outsiders"],
    allies: ["Robin", "Alfred Pennyworth", "Commissioner Gordon", "Catwoman", "Nightwing"],
    enemies: ["Joker", "Two-Face", "Riddler", "Penguin", "Bane", "Catwoman"],
    rating: 9.9,
    description: "Batman is a superhero appearing in American comic books published by DC Comics. The character was created by artist Bob Kane and writer Bill Finger.",
    funFact: "Batman's alter ego Bruce Wayne was named after Scottish patriot Robert the Bruce and American Revolutionary War general 'Mad' Anthony Wayne.",
    comicsAppeared: 5000,
    yearCreated: 1939
  },
  {
    id: 3,
    name: "Wolverine",
    slug: "wolverine",
    image: "https://i.pinimg.com/1200x/70/a6/d3/70a6d3030900b5e209e15e6077bde3e0.jpg",
    realName: "James Howlett / Logan",
    firstAppearance: "The Incredible Hulk #180 (1974)",
    publisher: "Marvel Comics",
    creators: ["Len Wein", "John Romita Sr."],
    abilities: ["Regenerative healing factor", "Adamantium skeleton", "Retractable claws", "Enhanced senses"],
    teams: ["X-Men", "Avengers", "Alpha Flight", "Weapon X"],
    allies: ["Professor X", "Jean Grey", "Storm", "Sabretooth (sometimes)"],
    enemies: ["Sabretooth", "Magneto", "Omega Red", "Lady Deathstrike", "Silver Samurai"],
    rating: 9.8,
    description: "Wolverine is a mutant who possesses animal-keen senses, enhanced physical capabilities, a regenerative healing factor, and three retractable claws in each hand.",
    funFact: "Wolverine's skeleton was bonded with the indestructible metal Adamantium by the Weapon X program.",
    comicsAppeared: 3800,
    yearCreated: 1974
  },
  {
    id: 4,
    name: "Superman",
    slug: "superman",
    image: "https://i.pinimg.com/736x/78/46/f6/7846f66f91040e9749fc59232c13380c.jpg",
    realName: "Kal-El / Clark Kent",
    firstAppearance: "Action Comics #1 (1938)",
    publisher: "DC Comics",
    creators: ["Jerry Siegel", "Joe Shuster"],
    abilities: ["Superhuman strength", "Flight", "Heat vision", "X-ray vision", "Super speed", "Invulnerability"],
    teams: ["Justice League", "Legion of Super-Heroes"],
    allies: ["Lois Lane", "Jimmy Olsen", "Perry White", "Supergirl", "Krypto"],
    enemies: ["Lex Luthor", "General Zod", "Doomsday", "Brainiac", "Darkseid"],
    rating: 9.8,
    description: "Superman is a superhero who first appeared in American comic books published by DC Comics. He is widely considered to be the first superhero.",
    funFact: "Superman originally could not fly; he could only 'leap tall buildings in a single bound'.",
    comicsAppeared: 5500,
    yearCreated: 1938
  },
  {
    id: 5,
    name: "Wonder Woman",
    slug: "wonder-woman",
    image: "https://i.pinimg.com/736x/d0/37/93/d037930472af9f7da5fb7a85ac2770ce.jpg",
    realName: "Diana Prince",
    firstAppearance: "All Star Comics #8 (1941)",
    publisher: "DC Comics",
    creators: ["William Moulton Marston", "H. G. Peter"],
    abilities: ["Superhuman strength", "Flight", "Lasso of Truth", "Bracelets of Submission", "Tiara", "Expert combatant"],
    teams: ["Justice League", "Amazons"],
    allies: ["Steve Trevor", "Donna Troy", "Cassie Sandsmark", "Hippolyta"],
    enemies: ["Ares", "Cheetah", "Circe", "Doctor Psycho", "Giganta"],
    rating: 9.8,
    description: "Wonder Woman is a superheroine appearing in American comic books published by DC Comics. She is a warrior princess of the Amazons.",
    funFact: "Wonder Woman's creator, William Moulton Marston, also invented the systolic blood-pressure test, which contributed to the creation of the polygraph.",
    comicsAppeared: 3200,
    yearCreated: 1941
  },
  {
    id: 6,
    name: "Iron Man",
    slug: "iron-man",
    image: "https://i.pinimg.com/736x/33/31/53/3331530c14a04e47da2659427ad68b56.jpg",
    realName: "Tony Stark",
    firstAppearance: "Tales of Suspense #39 (1963)",
    publisher: "Marvel Comics",
    creators: ["Stan Lee", "Larry Lieber", "Don Heck", "Jack Kirby"],
    abilities: ["Genius-level intellect", "Powered armor suit", "Flight", "Repulsor beams", "Missiles", "Laser weapons"],
    teams: ["Avengers", "Illuminati", "Stark Industries", "S.H.I.E.L.D."],
    allies: ["Pepper Potts", "Happy Hogan", "War Machine", "James Rhodes", "Captain America"],
    enemies: ["Mandarin", "Whiplash", "Iron Monger", "Crimson Dynamo", "Justin Hammer"],
    rating: 9.7,
    description: "Iron Man is a superhero appearing in American comic books published by Marvel Comics. The character was created by writer and editor Stan Lee.",
    funFact: "Iron Man was created as a challenge to make a wealthy industrialist a likeable superhero during the Cold War.",
    comicsAppeared: 2800,
    yearCreated: 1963
  }
];

const ComicCharacters = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPublisher, setSelectedPublisher] = useState("All");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Get unique publishers
  const publishers = ["All", ...new Set(comicCharactersData.map(character => character.publisher))];

  // Filter characters
  const filteredCharacters = comicCharactersData.filter((character) => {
    const matchesSearch = 
      character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.realName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.abilities.some(ability => ability.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPublisher = selectedPublisher === "All" || character.publisher === selectedPublisher;
    return matchesSearch && matchesPublisher;
  });

  // Sort characters
  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "yearCreated") return b.yearCreated - a.yearCreated;
    if (sortBy === "comicsAppeared") return b.comicsAppeared - a.comicsAppeared;
    return 0;
  });

  // Modal for character details
  const CharacterModal = ({ character, onClose }) => {
    if (!character) return null;

    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-white')}`} onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <img src={character.image} alt={character.name} className="w-full h-64 object-cover rounded-t-2xl" />
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition">
              ✕
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className={`text-3xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  {character.name}
                </h2>
                <p className={`text-lg ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                  {character.realName} | {character.publisher}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`${i < Math.floor(character.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                ))}
                <span className={`ml-2 font-bold ${theme.textColors?.highlight || 'text-sky-600'}`}>{character.rating}</span>
              </div>
            </div>

            <p className={`text-lg leading-relaxed mb-6 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
              {character.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  <FaBook /> First Appearance
                </h3>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{character.firstAppearance}</p>
                
                <h3 className={`font-bold mt-4 mb-2 flex items-center gap-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  <FaUsers /> Creators
                </h3>
                {character.creators.map((creator, i) => (
                  <p key={i} className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>• {creator}</p>
                ))}
              </div>
              <div>
                <h3 className={`font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>⚡ Abilities</h3>
                <div className="flex flex-wrap gap-2">
                  {character.abilities.map((ability, i) => (
                    <span key={i} className={`px-3 py-1 text-sm rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                      {ability}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className={`font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>👥 Allies</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {character.allies.slice(0, 5).map((ally, i) => (
                  <span key={i} className={`px-3 py-1 text-sm rounded-full ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'} text-green-700 dark:text-green-400`}>
                    {ally}
                  </span>
                ))}
              </div>

              <h3 className={`font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>💀 Major Enemies</h3>
              <div className="flex flex-wrap gap-2">
                {character.enemies.slice(0, 5).map((enemy, i) => (
                  <span key={i} className={`px-3 py-1 text-sm rounded-full ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'} text-red-700 dark:text-red-400`}>
                    {enemy}
                  </span>
                ))}
              </div>
            </div>

            {character.funFact && (
              <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                  <span className="font-bold">💡 Fun Fact:</span> {character.funFact}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{character.comicsAppeared.toLocaleString()}+</p>
                <p className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Comic Appearances</p>
              </div>
              <div className="text-center">
                <p className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{character.yearCreated}</p>
                <p className={`text-xs ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Year Created</p>
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
            Comic Characters
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Discover the heroes, villains, and iconic characters that shaped comic book history
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full sm:w-96">
            <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search characters by name, abilities, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
            />
          </div>
          <div className="flex gap-4">
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}
            >
              <option value="name">Sort by Name</option>
              <option value="rating">Sort by Rating</option>
              <option value="yearCreated">Sort by Year Created</option>
              <option value="comicsAppeared">Sort by Appearances</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => setViewMode("grid")} className={`px-4 py-2 rounded-lg transition ${viewMode === "grid" ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}`}>Grid</button>
              <button onClick={() => setViewMode("list")} className={`px-4 py-2 rounded-lg transition ${viewMode === "list" ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white` : `${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-800'} ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}`}>List</button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className={`text-center mb-6 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
          Found {sortedCharacters.length} character{sortedCharacters.length !== 1 ? 's' : ''}
        </div>

        {/* Characters Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedCharacters.map((character) => (
              <div
                key={character.id}
                onClick={() => setSelectedCharacter(character)}
                className={`cursor-pointer ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.container || 'shadow-lg'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <img src={character.image} alt={character.name} className="w-full h-56 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-lg font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{character.name}</h3>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-3 h-3 ${i < Math.floor(character.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className={`text-xs mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{character.realName}</p>
                  <p className={`text-sm line-clamp-2 mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{character.description}</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs px-2 py-0.5 bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-full">{character.publisher}</span>
                    <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full">{character.yearCreated}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCharacters.map((character) => (
              <div
                key={character.id}
                onClick={() => setSelectedCharacter(character)}
                className={`cursor-pointer flex gap-6 p-4 ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.container || 'shadow-md'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl transition-all duration-300 hover:shadow-xl`}
              >
                <img src={character.image} alt={character.name} className="w-24 h-24 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{character.name}</h3>
                      <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{character.realName} | {character.publisher}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-4 h-4 ${i < Math.floor(character.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className={`text-sm line-clamp-2 mb-2 mt-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{character.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {character.abilities.slice(0, 3).map((ability, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <CharacterModal character={selectedCharacter} onClose={() => setSelectedCharacter(null)} />
      </div>
    </div>
  );
};

export default ComicCharacters;