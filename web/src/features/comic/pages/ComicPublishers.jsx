"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";
import { FaSearch, FaStar, FaBuilding, FaGlobe, FaCalendar, FaBook, FaTrophy, FaTwitter, FaFacebook } from "react-icons/fa";

// Sample JSON data for Comic Publishers
const comicPublishersData = [
  {
    id: 1,
    name: "Marvel Comics",
    slug: "marvel-comics",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Marvel_Logo.svg/800px-Marvel_Logo.svg.png",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Marvel_Logo.svg/800px-Marvel_Logo.svg.png",
    founded: 1939,
    founder: "Martin Goodman",
    headquarters: "New York City, New York, USA",
    parentCompany: "The Walt Disney Company",
    keyPeople: ["Kevin Feige", "C.B. Cebulski", "Joe Quesada"],
    notableSeries: ["Spider-Man", "X-Men", "Avengers", "Fantastic Four", "Hulk", "Thor", "Iron Man", "Captain America"],
    iconicCharacters: ["Spider-Man", "Iron Man", "Captain America", "Thor", "Hulk", "Wolverine", "Black Panther", "Doctor Strange"],
    totalIssues: 35000,
    rating: 9.8,
    description: "Marvel Comics is an American comic book publisher and a subsidiary of The Walt Disney Company. Marvel is known for creating some of the most iconic superheroes in pop culture history.",
    website: "https://www.marvel.com",
    socialLinks: {
      twitter: "@Marvel",
      facebook: "Marvel"
    },
    awards: ["Eisner Award for Best Publisher", "Harvey Award for Best Publisher"],
    funFact: "Marvel's first comic was Marvel Comics #1 (1939), which featured the Human Torch and Namor the Sub-Mariner."
  },
  {
    id: 2,
    name: "DC Comics",
    slug: "dc-comics",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/DC_Comics_logo.svg/800px-DC_Comics_logo.svg.png",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/DC_Comics_logo.svg/800px-DC_Comics_logo.svg.png",
    founded: 1934,
    founder: "Malcolm Wheeler-Nicholson",
    headquarters: "Burbank, California, USA",
    parentCompany: "Warner Bros. Discovery",
    keyPeople: ["Jim Lee", "Marie Javins", "Dan DiDio"],
    notableSeries: ["Batman", "Superman", "Wonder Woman", "Justice League", "Flash", "Green Lantern", "Aquaman", "Watchmen"],
    iconicCharacters: ["Batman", "Superman", "Wonder Woman", "Flash", "Green Lantern", "Aquaman", "Joker", "Harley Quinn"],
    totalIssues: 32000,
    rating: 9.7,
    description: "DC Comics is one of the largest and oldest American comic book publishers, home to iconic superheroes like Superman, Batman, and Wonder Woman.",
    website: "https://www.dc.com",
    socialLinks: {
      twitter: "@DCComics",
      facebook: "DCComics"
    },
    awards: ["Eisner Award for Best Publisher", "Inkpot Award"],
    funFact: "DC stands for Detective Comics, named after the series that introduced Batman in issue #27 (1939)."
  },
  {
    id: 3,
    name: "Image Comics",
    slug: "image-comics",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Image_Comics_logo.svg/800px-Image_Comics_logo.svg.png",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Image_Comics_logo.svg/800px-Image_Comics_logo.svg.png",
    founded: 1992,
    founder: "Todd McFarlane, Jim Lee, Rob Liefeld, Erik Larsen, Marc Silvestri, Jim Valentino, Whilce Portacio",
    headquarters: "Portland, Oregon, USA",
    parentCompany: "Independent",
    keyPeople: ["Todd McFarlane", "Jim Lee", "Robert Kirkman"],
    notableSeries: ["Spawn", "The Walking Dead", "Invincible", "Saga", "Paper Girls", "Kick-Ass", "Wicked + Divine"],
    iconicCharacters: ["Spawn", "Invincible", "Rick Grimes", "Mark Grayson", "Alana", "Hazel"],
    totalIssues: 15000,
    rating: 9.5,
    description: "Image Comics is an American comic book publisher founded in 1992 by several high-profile illustrators as a venue for creator-owned properties.",
    website: "https://imagecomics.com",
    socialLinks: {
      twitter: "@ImageComics",
      facebook: "ImageComics"
    },
    awards: ["Eisner Award for Best Publisher", "Harvey Award for Best Publisher"],
    funFact: "Image Comics was founded by artists who wanted to retain ownership of their characters, leading to the creator-owned revolution in comics."
  },
  {
    id: 4,
    name: "Dark Horse Comics",
    slug: "dark-horse-comics",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Dark_Horse_Comics_logo.svg/800px-Dark_Horse_Comics_logo.svg.png",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Dark_Horse_Comics_logo.svg/800px-Dark_Horse_Comics_logo.svg.png",
    founded: 1986,
    founder: "Mike Richardson",
    headquarters: "Milwaukie, Oregon, USA",
    parentCompany: "Independent",
    keyPeople: ["Mike Richardson", "Neil Hankerson"],
    notableSeries: ["Hellboy", "Sin City", "300", "The Umbrella Academy", "Aliens", "Predator", "Star Wars (formerly)"],
    iconicCharacters: ["Hellboy", "Marv", "Dwight McCarthy", "Benito Mussolini (in 300)", "Klaus Hargreeves"],
    totalIssues: 10000,
    rating: 9.4,
    description: "Dark Horse Comics is the largest independent American comic book publisher, known for licensed properties and creator-owned series.",
    website: "https://www.darkhorse.com",
    socialLinks: {
      twitter: "@DarkHorseComics",
      facebook: "DarkHorseComics"
    },
    awards: ["Eisner Award for Best Publisher"],
    funFact: "Dark Horse published the first issue of Mike Mignola's Hellboy in 1993, which became one of their most successful original series."
  },
  {
    id: 5,
    name: "IDW Publishing",
    slug: "idw-publishing",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/IDW_Publishing_logo.svg/800px-IDW_Publishing_logo.svg.png",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/IDW_Publishing_logo.svg/800px-IDW_Publishing_logo.svg.png",
    founded: 1999,
    founder: "Ted Adams, Robbie Robbins, Alex Garner, Kris Oprisko",
    headquarters: "San Diego, California, USA",
    parentCompany: "IDW Media Holdings",
    keyPeople: ["Davidi Jonas", "John Barber"],
    notableSeries: ["Teenage Mutant Ninja Turtles", "Transformers", "My Little Pony", "Star Trek", "Ghostbusters", "Locke & Key"],
    iconicCharacters: ["Teenage Mutant Ninja Turtles", "Optimus Prime", "Megatron", "Locke family"],
    totalIssues: 8000,
    rating: 9.2,
    description: "IDW Publishing is an American comic book and graphic novel publisher, known for licensed properties and original series.",
    website: "https://www.idwpublishing.com",
    socialLinks: {
      twitter: "@IDWPublishing",
      facebook: "IDWPublishing"
    },
    awards: ["Eisner Award for Best Limited Series", "Harvey Award"],
    funFact: "IDW's Teenage Mutant Ninja Turtles series has been one of their most successful and long-running titles."
  },
  {
    id: 6,
    name: "Boom! Studios",
    slug: "boom-studios",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Boom%21_Studios_logo.svg/800px-Boom%21_Studios_logo.svg.png",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Boom%21_Studios_logo.svg/800px-Boom%21_Studios_logo.svg.png",
    founded: 2005,
    founder: "Ross Richie, Andrew Cosby",
    headquarters: "Los Angeles, California, USA",
    parentCompany: "Independent",
    keyPeople: ["Ross Richie", "Matt Gagnon"],
    notableSeries: ["Something is Killing the Children", "Once & Future", "Mighty Morphin Power Rangers", "Lumberjanes", "Irredeemable"],
    iconicCharacters: ["Erica Slaughter", "Bridgette McGuire", "Duncan", "Power Rangers"],
    totalIssues: 5000,
    rating: 9.3,
    description: "Boom! Studios is an American comic book and graphic novel publisher founded in 2005, known for original series and licensed properties.",
    website: "https://www.boom-studios.com",
    socialLinks: {
      twitter: "@boomstudios",
      facebook: "BOOMStudios"
    },
    awards: ["Eisner Award for Best Continuing Series", "GLAAD Award"],
    funFact: "Something is Killing the Children has become one of Boom!'s most successful original series, spawning multiple spin-offs."
  }
];

const ComicPublishers = () => {
  const { theme, themeName } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPublisher, setSelectedPublisher] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  // Filter publishers based on search
  const filteredPublishers = comicPublishersData.filter((publisher) => {
    const matchesSearch = 
      publisher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      publisher.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      publisher.notableSeries.some(series => series.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Sort publishers
  const sortedPublishers = [...filteredPublishers].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "founded") return a.founded - b.founded;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "totalIssues") return b.totalIssues - a.totalIssues;
    return 0;
  });

  // Modal for publisher details
  const PublisherModal = ({ publisher, onClose }) => {
    if (!publisher) return null;

    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-white')}`} onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <img src={publisher.logo} alt={publisher.name} className="w-full h-48 object-contain bg-gray-100 dark:bg-gray-800 p-6 rounded-t-2xl" />
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition">
              ✕
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className={`text-3xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  {publisher.name}
                </h2>
                <p className={`text-lg ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                  Founded {publisher.founded} | {publisher.headquarters}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`${i < Math.floor(publisher.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                ))}
                <span className={`ml-2 font-bold ${theme.textColors?.highlight || 'text-sky-600'}`}>{publisher.rating}</span>
              </div>
            </div>

            <p className={`text-lg leading-relaxed mb-6 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
              {publisher.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  <FaBuilding /> Company Info
                </h3>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Founder: {publisher.founder}</p>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Parent: {publisher.parentCompany}</p>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Total Issues: {publisher.totalIssues.toLocaleString()}+</p>
                {publisher.website && (
                  <a href={publisher.website} target="_blank" rel="noopener noreferrer" className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'} hover:underline inline-flex items-center gap-1 mt-1`}>
                    <FaGlobe /> Visit Website
                  </a>
                )}
              </div>
              <div>
                <h3 className={`font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>🏆 Key People</h3>
                <ul className="space-y-1">
                  {publisher.keyPeople.map((person, i) => (
                    <li key={i} className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>• {person}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h3 className={`font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>📚 Notable Series</h3>
              <div className="flex flex-wrap gap-2">
                {publisher.notableSeries.slice(0, 8).map((series, i) => (
                  <span key={i} className={`px-3 py-1 text-sm rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                    {series}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className={`font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>🦸 Iconic Characters</h3>
              <div className="flex flex-wrap gap-2">
                {publisher.iconicCharacters.slice(0, 8).map((character, i) => (
                  <span key={i} className={`px-3 py-1 text-sm rounded-full ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                    {character}
                  </span>
                ))}
              </div>
            </div>

            {publisher.funFact && (
              <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <p className={`text-sm ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                  <span className="font-bold">💡 Fun Fact:</span> {publisher.funFact}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {publisher.socialLinks?.twitter && (
                <a href={`https://twitter.com/${publisher.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sky-500 hover:text-sky-600">
                  <FaTwitter /> Twitter
                </a>
              )}
              {publisher.socialLinks?.facebook && (
                <a href={`https://facebook.com/${publisher.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                  <FaFacebook /> Facebook
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
            Comic Publishers
          </h1>
          <p className={`text-xl ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')} max-w-3xl mx-auto`}>
            Explore the publishing houses behind the world's greatest comics
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full sm:w-96">
            <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search publishers by name, series, or description..."
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
              <option value="founded">Sort by Founded Year</option>
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
          Found {sortedPublishers.length} publisher{sortedPublishers.length !== 1 ? 's' : ''}
        </div>

        {/* Publishers Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPublishers.map((publisher) => (
              <div
                key={publisher.id}
                onClick={() => setSelectedPublisher(publisher)}
                className={`cursor-pointer ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.container || 'shadow-lg'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <div className="h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-4">
                  <img src={publisher.logo} alt={publisher.name} className="h-full w-full object-contain" />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-lg font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{publisher.name}</h3>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-3 h-3 ${i < Math.floor(publisher.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className={`text-xs mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Founded {publisher.founded}</p>
                  <p className={`text-sm line-clamp-2 mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{publisher.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {publisher.notableSeries.slice(0, 2).map((series, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-full">{series}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPublishers.map((publisher) => (
              <div
                key={publisher.id}
                onClick={() => setSelectedPublisher(publisher)}
                className={`cursor-pointer flex gap-6 p-4 ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} ${theme.shadow?.container || 'shadow-md'} ${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl transition-all duration-300 hover:shadow-xl`}
              >
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center p-2">
                  <img src={publisher.logo} alt={publisher.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>{publisher.name}</h3>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`w-4 h-4 ${i < Math.floor(publisher.rating) ? 'text-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className={`text-sm mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>Founded {publisher.founded} | {publisher.totalIssues.toLocaleString()}+ issues</p>
                  <p className={`text-sm line-clamp-2 mb-2 ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{publisher.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {publisher.notableSeries.slice(0, 3).map((series, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                        {series}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <PublisherModal publisher={selectedPublisher} onClose={() => setSelectedPublisher(null)} />
      </div>
    </div>
  );
};

export default ComicPublishers;