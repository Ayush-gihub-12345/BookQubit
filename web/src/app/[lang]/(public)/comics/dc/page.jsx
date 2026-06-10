"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/themes/useTheme";

import {
  FaSearch,
  FaFilter,
  FaStar,
  FaCalendarAlt,
  FaTag,
  FaFire,
  FaBookOpen,
} from "react-icons/fa";

import { GiBatMask } from "react-icons/gi";

// Sample DC Comics data
const dcComicsData = [
  {
    id: 1,
    title: "Action Comics #1",
    slug: "action-comics-1",
    image:
      "https://upload.wikimedia.org/wikipedia/en/thumb/c/c6/Action_Comics_1.jpg/220px-Action_Comics_1.jpg",
    description:
      "The first appearance of Superman! This comic launched the superhero genre.",
    publisher: "DC Comics",
    publicationDate: "April 1938",
    coverPrice: "10 cents",
    format: "68 pages, full color",
    charactersIntroduced: ["Superman (Clark Kent)", "Lois Lane"],
    creators: {
      editor: "Vincent Sullivan",
      writersArtists: ["Jerry Siegel", "Joe Shuster"],
    },
    rating: 9.9,
    category: "Golden Age",
    era: "Golden Age",
    isClassic: true,
    isPopular: true,
    valueToday: "$3.25 million",
  },

  {
    id: 2,
    title: "Detective Comics #27",
    slug: "detective-comics-27",
    image:
      "https://upload.wikimedia.org/wikipedia/en/thumb/1/17/Detective_Comics_27.jpg/220px-Detective_Comics_27.jpg",
    description: "First appearance of Batman! The Dark Knight makes his debut.",
    publisher: "DC Comics",
    publicationDate: "May 1939",
    coverPrice: "10 cents",
    format: "68 pages, full color",
    charactersIntroduced: ["Batman (Bruce Wayne)", "Commissioner Gordon"],
    creators: {
      editor: "Vincent Sullivan",
      writersArtists: ["Bob Kane", "Bill Finger"],
    },
    rating: 9.9,
    category: "Golden Age",
    era: "Golden Age",
    isClassic: true,
    isPopular: true,
    valueToday: "$1.5 million",
  },

  {
    id: 3,
    title: "Batman #1",
    slug: "batman-1",
    image:
      "https://upload.wikimedia.org/wikipedia/en/thumb/3/33/Batman_1.jpg/220px-Batman_1.jpg",
    description: "First solo Batman comic, introducing the Joker and Catwoman.",
    publisher: "DC Comics",
    publicationDate: "Spring 1940",
    coverPrice: "10 cents",
    format: "68 pages, full color",
    charactersIntroduced: ["Joker", "Catwoman"],
    creators: {
      editor: "Whitney Ellsworth",
      writersArtists: ["Bill Finger", "Bob Kane"],
    },
    rating: 9.8,
    category: "Golden Age",
    era: "Golden Age",
    isClassic: true,
    isPopular: true,
    valueToday: "$850,000",
  },
];

const categories = [
  "All",
  "Golden Age",
  "Silver Age",
  "Bronze Age",
  "Modern Age",
];

const sortOptions = [
  { value: "rating", label: "Highest Rated" },
  { value: "date", label: "Publication Date" },
  { value: "price", label: "Lowest Price" },
  { value: "title", label: "Title A-Z" },
];

const DCComicsPage = () => {
  const { theme, themeName } = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEra, setSelectedEra] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("rating");

  if (!theme) return null;

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  const eras = ["All", ...new Set(dcComicsData.map((comic) => comic.era))];

  // Filter
  const filteredComics = dcComicsData.filter((comic) => {
    const matchesSearch =
      searchTerm === "" ||
      comic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comic.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || comic.category === selectedCategory;

    const matchesEra = selectedEra === "All" || comic.era === selectedEra;

    return matchesSearch && matchesCategory && matchesEra;
  });

  // Price parser
  const getPriceValue = (price) => {
    if (price.includes("cents")) {
      return parseFloat(price) / 100;
    }

    return parseFloat(price.replace("$", ""));
  };

  // Sort
  const sortedComics = [...filteredComics].sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }

    if (sortBy === "price") {
      return getPriceValue(a.coverPrice) - getPriceValue(b.coverPrice);
    }

    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }

    return 0;
  });

  return (
    <div
      className={`${
        theme.background?.section || (isDarkMode ? "bg-gray-900" : "bg-gray-50")
      } min-h-screen py-12`}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div
              className={`p-4 rounded-full ${
                theme.background?.navigationDots || "bg-gray-800"
              }`}
            >
              <GiBatMask
                className={`text-5xl ${
                  theme.textColors?.highlight || "text-blue-500"
                }`}
              />
            </div>
          </div>

          <h1
            className={`text-5xl font-bold mb-4 ${
              theme.textColors?.primary ||
              (isDarkMode ? "text-white" : "text-gray-900")
            }`}
          >
            DC Comics
          </h1>

          <p
            className={`max-w-2xl mx-auto text-lg ${
              theme.textColors?.secondary ||
              (isDarkMode ? "text-gray-400" : "text-gray-600")
            }`}
          >
            Explore legendary DC comics including Batman, Superman, Flash,
            Wonder Woman, and more.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Search comics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  theme.background?.section || "bg-white"
                } ${theme.textColors?.primary || "text-black"}`}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-5 py-3 rounded-xl flex items-center gap-2 ${
                theme.buttonColors?.primaryButton?.background || "bg-blue-600"
              } text-white`}
            >
              <FaFilter />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div
              className={`mt-4 p-4 rounded-xl ${
                theme.background?.bookCoverSide || "bg-gray-100"
              }`}
            >
              <div className="grid md:grid-cols-3 gap-4">
                {/* Category */}
                <div>
                  <label className="block mb-2 font-semibold">Category</label>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 rounded-lg"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Era */}
                <div>
                  <label className="block mb-2 font-semibold">Era</label>

                  <select
                    value={selectedEra}
                    onChange={(e) => setSelectedEra(e.target.value)}
                    className="w-full p-2 rounded-lg"
                  >
                    {eras.map((era) => (
                      <option key={era} value={era}>
                        {era}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block mb-2 font-semibold">Sort By</label>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 rounded-lg"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedComics.map((comic) => (
            <div
              key={comic.id}
              className={`rounded-2xl overflow-hidden border transition hover:shadow-2xl hover:scale-[1.02] ${
                theme.background?.section || "bg-white"
              }`}
            >
              <div className="h-72 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <img
                  src={comic.image}
                  alt={comic.title}
                  className="h-full object-contain"
                />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                    Classic
                  </span>

                  <div className="flex items-center gap-1 text-sm">
                    <FaStar className="text-yellow-400" />
                    {comic.rating}
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-2">{comic.title}</h2>

                <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                  {comic.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">
                    <FaCalendarAlt className="inline mr-1" />
                    {comic.publicationDate}
                  </span>

                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">
                    <FaTag className="inline mr-1" />
                    {comic.era}
                  </span>
                </div>

                {comic.isPopular && (
                  <div className="flex items-center gap-1 text-sm text-orange-500 mb-4">
                    <FaFire />
                    Popular Comic
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600">
                    {comic.coverPrice}
                  </span>

                  <Link
                    href={`/comicdetails/${comic.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty */}
        {sortedComics.length === 0 && (
          <div className="text-center py-16">
            <FaBookOpen className="text-6xl mx-auto text-gray-400 mb-4" />

            <h3 className="text-2xl font-bold mb-2">No Comics Found</h3>

            <p className="text-gray-500">Try different search keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DCComicsPage;
