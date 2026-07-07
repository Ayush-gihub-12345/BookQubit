// // src/components/homepages/TagsHome.jsx
// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useTheme } from "@/themes/useTheme";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { useFont } from "@/contexts/FontContext";
// import { getBooksByLanguage } from "@/data/books";
// import {
//   getAllTags,
//   getPopularTags,
//   searchTags,
//   generateTagSlug,
// } from "@/features/tags/TagsData";
// import TagChip from "@/features/tags/TagChip";
// import {
//   FaTag,
//   FaSearch,
//   FaArrowRight,
//   FaChevronLeft,
//   FaChevronRight,
// } from "react-icons/fa";

// const TagsHome = ({
//   title = "Explore Topics",
//   subtitle = "Discover books by your favorite topics and genres",
//   limit = 12,
//   showViewAll = true,
//   showSearch = true,
//   layout = "grid", // "grid", "cloud", "carousel", "featured"
// }) => {
//   const router = useRouter();
//   const { theme, themeName } = useTheme();
//   const { language, t } = useLanguage();
//   const { currentFont } = useFont();

//   const [tags, setTags] = useState([]);
//   const [filteredTags, setFilteredTags] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedLetter, setSelectedLetter] = useState("all");
//   const [visibleCount, setVisibleCount] = useState(limit);
//   const carouselRef = useRef(null);

//   const isDarkMode =
//     themeName === "dark" ||
//     themeName === "midnight" ||
//     themeName === "cyberpunk";
//   const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

//   // Load tags
//   useEffect(() => {
//     const books = getBooksByLanguage(language);
//     const allTags = getAllTags(books);
//     setTags(allTags);
//     setFilteredTags(allTags.slice(0, limit));
//     setIsLoading(false);
//   }, [language, limit]);

//   // Filter tags based on search and letter
//   useEffect(() => {
//     let filtered = [...tags];

//     if (searchTerm) {
//       filtered = filtered.filter((tag) =>
//         tag.name.toLowerCase().includes(searchTerm.toLowerCase()),
//       );
//     }

//     if (selectedLetter !== "all") {
//       filtered = filtered.filter(
//         (tag) =>
//           tag.name.charAt(0).toLowerCase() === selectedLetter.toLowerCase(),
//       );
//     }

//     setFilteredTags(filtered.slice(0, visibleCount));
//   }, [searchTerm, selectedLetter, tags, visibleCount]);

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//     setSelectedLetter("all");
//   };

//   const clearSearch = () => {
//     setSearchTerm("");
//     setSelectedLetter("all");
//   };

//   const handleViewMore = () => {
//     setVisibleCount((prev) => prev + limit);
//   };

//   const handleViewLess = () => {
//     setVisibleCount(limit);
//   };

//   const scrollCarousel = (direction) => {
//     if (carouselRef.current) {
//       const scrollAmount = direction === "left" ? -300 : 300;
//       carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
//     }
//   };

//   const fontStyle = currentFont ? { fontFamily: currentFont.family } : {};

//   // Loading State
//   if (isLoading) {
//     return (
//       <div className="py-12" style={fontStyle}>
//         <div className="text-center mb-8">
//           <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-2 animate-pulse"></div>
//           <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto animate-pulse"></div>
//         </div>
//         <div className="flex flex-wrap justify-center gap-3">
//           {[...Array(12)].map((_, i) => (
//             <div
//               key={i}
//               className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
//             ></div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   // Featured Tags Layout (Large tags with counts)
//   if (layout === "featured") {
//     const featuredTags = tags.slice(0, 8);
//     return (
//       <div className="py-12" style={fontStyle}>
//         <div className="text-center mb-8">
//           <h2
//             className={`text-3xl font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
//           >
//             {title}
//           </h2>
//           {subtitle && (
//             <p
//               className={`text-lg ${theme.textColors?.secondary || "text-gray-600"}`}
//             >
//               {subtitle}
//             </p>
//           )}
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {featuredTags.map((tag) => (
//             <Link
//               key={tag.name}
//               href={`/tags/${tag.slug}`}
//               className={`group p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl text-center
//                 ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}
//                 ${theme.border?.default || "border border-gray-200 dark:border-gray-700"}
//               `}
//             >
//               <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sky-500/10 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
//                 <FaTag className="text-2xl text-sky-500" />
//               </div>
//               <h3
//                 className={`text-lg font-semibold mb-2 capitalize ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
//               >
//                 {tag.name}
//               </h3>
//               <p
//                 className={`text-sm ${theme.textColors?.secondary || "text-gray-500"}`}
//               >
//                 {tag.count} {tag.count === 1 ? "book" : "books"}
//               </p>
//             </Link>
//           ))}
//         </div>

//         {showViewAll && (
//           <div className="text-center mt-8">
//             <Link
//               href="/tags"
//               className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105
//                 ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"}
//                 text-white
//               `}
//             >
//               View All Topics
//               <FaArrowRight size={16} />
//             </Link>
//           </div>
//         )}
//       </div>
//     );
//   }

//   // Carousel Layout
//   if (layout === "carousel") {
//     return (
//       <div className="py-12 relative" style={fontStyle}>
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h2
//               className={`text-2xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
//             >
//               {title}
//             </h2>
//             {subtitle && (
//               <p
//                 className={`text-sm ${theme.textColors?.secondary || "text-gray-600"} mt-1`}
//               >
//                 {subtitle}
//               </p>
//             )}
//           </div>

//           {showViewAll && (
//             <Link
//               href="/tags"
//               className={`text-sm ${theme.textColors?.highlight || "text-sky-600"} hover:underline flex items-center gap-1`}
//             >
//               View All <FaArrowRight size={12} />
//             </Link>
//           )}
//         </div>

//         <div className="relative">
//           <button
//             onClick={() => scrollCarousel("left")}
//             className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full
//               ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}
//               shadow-lg flex items-center justify-center hover:scale-110 transition-all
//             `}
//           >
//             <FaChevronLeft
//               className={theme.textColors?.primary || "text-gray-600"}
//             />
//           </button>

//           <div
//             ref={carouselRef}
//             className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
//             style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
//           >
//             {tags.slice(0, 20).map((tag) => (
//               <div key={tag.name} className="flex-shrink-0">
//                 <TagChip
//                   tag={tag.name}
//                   count={tag.count}
//                   size="lg"
//                   showCount={true}
//                 />
//               </div>
//             ))}
//           </div>

//           <button
//             onClick={() => scrollCarousel("right")}
//             className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full
//               ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}
//               shadow-lg flex items-center justify-center hover:scale-110 transition-all
//             `}
//           >
//             <FaChevronRight
//               className={theme.textColors?.primary || "text-gray-600"}
//             />
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Tag Cloud Layout (Default)
//   return (
//     <div className="py-12" style={fontStyle}>
//       <div className="text-center mb-8">
//         <h2
//           className={`text-3xl font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
//         >
//           {title}
//         </h2>
//         {subtitle && (
//           <p
//             className={`text-lg ${theme.textColors?.secondary || "text-gray-600"}`}
//           >
//             {subtitle}
//           </p>
//         )}
//       </div>

//       {/* Search Bar */}
//       {showSearch && (
//         <div className="max-w-md mx-auto mb-8">
//           <div className="relative">
//             <FaSearch
//               className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || "text-gray-400"}`}
//             />
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={handleSearch}
//               placeholder="Search topics..."
//               className={`w-full pl-12 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500
//                 ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}
//                 ${theme.border?.default || "border-gray-200 dark:border-gray-700"}
//                 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}
//               `}
//             />
//             {searchTerm && (
//               <button
//                 onClick={clearSearch}
//                 className="absolute right-4 top-1/2 -translate-y-1/2"
//               >
//                 <svg
//                   className="w-4 h-4 text-gray-400"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Alphabet Filter */}
//       {!searchTerm && (
//         <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2">
//           <button
//             onClick={() => setSelectedLetter("all")}
//             className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
//               ${
//                 selectedLetter === "all"
//                   ? "bg-sky-500 text-white"
//                   : `${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}
//                    ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`
//               }`}
//           >
//             All
//           </button>
//           {alphabet.map((letter) => (
//             <button
//               key={letter}
//               onClick={() => setSelectedLetter(letter)}
//               className={`w-10 h-10 rounded-lg font-medium transition-all whitespace-nowrap
//                 ${
//                   selectedLetter === letter
//                     ? "bg-sky-500 text-white"
//                     : `${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}
//                      ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`
//                 }`}
//             >
//               {letter}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Tags Grid */}
//       <div className="flex flex-wrap justify-center gap-3">
//         {filteredTags.map((tag) => (
//           <TagChip
//             key={tag.name}
//             tag={tag.name}
//             count={tag.count}
//             size="md"
//             showCount={true}
//             clickable={true}
//           />
//         ))}
//       </div>

//       {/* No Results */}
//       {filteredTags.length === 0 && (
//         <div className="text-center py-12">
//           <FaTag
//             className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || "text-gray-400"}`}
//           />
//           <h3
//             className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
//           >
//             No tags found
//           </h3>
//           <p className={theme.textColors?.secondary || "text-gray-600"}>
//             Try a different search term or browse all tags
//           </p>
//         </div>
//       )}

//       {/* View More / View Less */}
//       {!searchTerm &&
//         selectedLetter === "all" &&
//         tags.length > visibleCount && (
//           <div className="text-center mt-8">
//             <button
//               onClick={handleViewMore}
//               className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all hover:scale-105
//               ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}
//               ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}
//             `}
//             >
//               View More Tags
//               <FaArrowRight size={14} />
//             </button>
//           </div>
//         )}

//       {visibleCount > limit && (
//         <div className="text-center mt-4">
//           <button
//             onClick={handleViewLess}
//             className={`text-sm ${theme.textColors?.highlight || "text-sky-600"} hover:underline`}
//           >
//             Show Less
//           </button>
//         </div>
//       )}

//       {/* View All Button */}
//       {showViewAll &&
//         !searchTerm &&
//         selectedLetter === "all" &&
//         tags.length <= visibleCount && (
//           <div className="text-center mt-8">
//             <Link
//               href="/tags"
//               className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105
//               ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"}
//               text-white
//             `}
//             >
//               Browse All Tags
//               <FaArrowRight size={16} />
//             </Link>
//           </div>
//         )}
//     </div>
//   );
// };

// export default TagsHome;

// src/components/homepages/TagsHome.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import { getBooksByLanguage } from "@/data/books";
import {
  getAllTags,
  getPopularTags,
  searchTags,
  generateTagSlug,
} from "@/features/tags/TagsData";
import {
  PREDEFINED_TAGS,
  getPopularPredefinedTags,
  getTagsByCategory,
  getCategoryTitle,
  getCategoryIcon,
  TAG_CATEGORIES,
} from "@/features/tags/predefine_tags/predefine_tags_data";
import PredefineTagsTagChip from "@/features/tags/predefine_tags/predefine_tags_tagchip";
import TagChip from "@/features/tags/TagChip";
import {
  FaTag,
  FaSearch,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaFire,
  FaStar,
  FaClock,
} from "react-icons/fa";

const TagsHome = ({
  title = "Explore Topics",
  subtitle = "Discover books by your favorite topics and genres",
  limit = 12,
  showViewAll = true,
  showSearch = true,
  layout = "grid", // "grid", "cloud", "carousel", "featured", "categories"
  usePredefined = true, // Use predefined tags or dynamic tags from books
  showPopular = true,
  showTrending = true,
  showNew = false,
}) => {
  const router = useRouter();
  const { theme, themeName } = useTheme();
  const { language, t } = useLanguage();
  const { currentFont } = useFont();

  const [tags, setTags] = useState([]);
  const [predefinedTags, setPredefinedTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(limit);
  const [popularTags, setPopularTags] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const carouselRef = useRef(null);

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const categories = ["all", ...Object.values(TAG_CATEGORIES)];

  // Load tags
  useEffect(() => {
    const books = getBooksByLanguage(language);

    if (usePredefined) {
      // Use predefined tags
      setPredefinedTags(PREDEFINED_TAGS);
      setTags(PREDEFINED_TAGS.slice(0, limit));
      setFilteredTags(PREDEFINED_TAGS.slice(0, limit));

      // Get popular and trending tags
      const popular = getPopularPredefinedTags(12);
      setPopularTags(popular);

      // Trending tags (based on popularity > 80)
      const trending = PREDEFINED_TAGS.filter(
        (tag) => tag.popularity >= 80,
      ).slice(0, 12);
      setTrendingTags(trending);
    } else {
      // Use dynamic tags from books
      const allTags = getAllTags(books);
      setTags(allTags);
      setFilteredTags(allTags.slice(0, limit));
      setPopularTags(getPopularTags(books, 12));
    }

    setIsLoading(false);
  }, [language, limit, usePredefined]);

  // Filter tags based on search, letter, and category
  useEffect(() => {
    let filtered = usePredefined ? [...PREDEFINED_TAGS] : [...tags];

    if (searchTerm) {
      filtered = filtered.filter((tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedLetter !== "all") {
      filtered = filtered.filter(
        (tag) =>
          tag.name.charAt(0).toLowerCase() === selectedLetter.toLowerCase(),
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((tag) => tag.category === selectedCategory);
    }

    setFilteredTags(filtered.slice(0, visibleCount));
  }, [
    searchTerm,
    selectedLetter,
    selectedCategory,
    tags,
    visibleCount,
    usePredefined,
  ]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setSelectedLetter("all");
    setSelectedCategory("all");
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedLetter("all");
    setSelectedCategory("all");
  };

  const handleViewMore = () => {
    setVisibleCount((prev) => prev + limit);
  };

  const handleViewLess = () => {
    setVisibleCount(limit);
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const fontStyle = currentFont ? { fontFamily: currentFont.family } : {};

  // Loading State
  if (isLoading) {
    return (
      <div className="py-12" style={fontStyle}>
        <div className="text-center mb-8">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto animate-pulse"></div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Categories Layout
  if (layout === "categories") {
    return (
      <div className="py-12" style={fontStyle}>
        <div className="text-center mb-8">
          <h2
            className={`text-3xl font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={`text-lg ${theme.textColors?.secondary || "text-gray-600"}`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-medium transition-all capitalize
                ${
                  selectedCategory === cat
                    ? "bg-sky-500 text-white"
                    : `${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}
                     ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`
                }`}
            >
              {cat === "all" ? "All" : getCategoryTitle(cat)}
            </button>
          ))}
        </div>

        {/* Tags by Category */}
        {selectedCategory === "all" ? (
          Object.values(TAG_CATEGORIES).map((category) => {
            const categoryTags = getTagsByCategory(category);
            if (categoryTags.length === 0) return null;

            return (
              <div key={category} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                  <h3
                    className={`text-xl font-semibold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
                  >
                    {getCategoryTitle(category)}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categoryTags.slice(0, 15).map((tag) => (
                    <PredefineTagsTagChip
                      key={tag.name}
                      tag={tag}
                      size="md"
                      variant="default"
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-wrap gap-3">
            {filteredTags.map((tag) => (
              <PredefineTagsTagChip
                key={tag.name}
                tag={tag}
                size="md"
                variant="default"
                showCategory={false}
              />
            ))}
          </div>
        )}

        {showViewAll && (
          <div className="text-center mt-8">
            <Link
              href="/tags"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105
                ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"}
                text-white
              `}
            >
              Browse All Tags
              <FaArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Featured Tags Layout (Large cards with icons)
  if (layout === "featured") {
    const featuredTags = usePredefined
      ? getPopularPredefinedTags(8)
      : popularTags.slice(0, 8);

    return (
      <div className="py-12" style={fontStyle}>
        <div className="text-center mb-8">
          <h2
            className={`text-3xl font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={`text-lg ${theme.textColors?.secondary || "text-gray-600"}`}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredTags.map((tag) => (
            <Link
              key={tag.name}
              href={`/tags/${generateTagSlug(tag.name)}`}
              className={`group p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl text-center
                ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}
                ${theme.border?.default || "border border-gray-200 dark:border-gray-700"}
              `}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sky-500/10 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                <span className="text-3xl">{tag.icon || "🏷️"}</span>
              </div>
              <h3
                className={`text-lg font-semibold mb-2 capitalize ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
              >
                {tag.name}
              </h3>
              <p
                className={`text-sm ${theme.textColors?.secondary || "text-gray-500"}`}
              >
                {tag.count || tag.popularity}+ books
              </p>
            </Link>
          ))}
        </div>

        {showViewAll && (
          <div className="text-center mt-8">
            <Link
              href="/tags"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105
                ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"}
                text-white
              `}
            >
              View All Topics
              <FaArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Carousel Layout
  if (layout === "carousel") {
    const carouselTags = usePredefined
      ? PREDEFINED_TAGS.slice(0, 20)
      : tags.slice(0, 20);

    return (
      <div className="py-12 relative" style={fontStyle}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2
              className={`text-2xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className={`text-sm ${theme.textColors?.secondary || "text-gray-600"} mt-1`}
              >
                {subtitle}
              </p>
            )}
          </div>

          {showViewAll && (
            <Link
              href="/tags"
              className={`text-sm ${theme.textColors?.highlight || "text-sky-600"} hover:underline flex items-center gap-1`}
            >
              View All <FaArrowRight size={12} />
            </Link>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => scrollCarousel("left")}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full
              ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}
              shadow-lg flex items-center justify-center hover:scale-110 transition-all
            `}
          >
            <FaChevronLeft
              className={theme.textColors?.primary || "text-gray-600"}
            />
          </button>

          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {carouselTags.map((tag) => (
              <div key={tag.name} className="flex-shrink-0">
                {usePredefined ? (
                  <PredefineTagsTagChip
                    tag={tag}
                    size="lg"
                    variant="gradient"
                  />
                ) : (
                  <TagChip
                    tag={tag.name}
                    count={tag.count}
                    size="lg"
                    showCount={true}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollCarousel("right")}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full
              ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}
              shadow-lg flex items-center justify-center hover:scale-110 transition-all
            `}
          >
            <FaChevronRight
              className={theme.textColors?.primary || "text-gray-600"}
            />
          </button>
        </div>

        {/* Trending Badges */}
        {showTrending && trendingTags.length > 0 && (
          <div className="mt-8 pt-4 border-t ${theme.border?.default || 'border-gray-200 dark:border-gray-700'}">
            <div className="flex items-center gap-2 mb-3">
              <FaFire className="text-orange-500" />
              <span
                className={`text-sm font-medium ${theme.textColors?.secondary || "text-gray-600"}`}
              >
                Trending Now
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTags.slice(0, 8).map((tag) => (
                <PredefineTagsTagChip
                  key={tag.name}
                  tag={tag}
                  size="sm"
                  variant="outline"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Tag Cloud Layout (Default)
  return (
    <div className="py-12" style={fontStyle}>
      <div className="text-center mb-8">
        <h2
          className={`text-3xl font-bold mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={`text-lg ${theme.textColors?.secondary || "text-gray-600"}`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Popular Tags Highlight */}
      {showPopular && popularTags.length > 0 && (
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-sky-500/10 to-blue-500/10">
          <div className="flex items-center gap-2 mb-3">
            <FaStar className="text-yellow-500" />
            <span
              className={`font-semibold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
            >
              Popular Tags
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTags.slice(0, 8).map((tag) => (
              <PredefineTagsTagChip
                key={tag.name}
                tag={tag}
                size="sm"
                variant="default"
              />
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      {showSearch && (
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <FaSearch
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textColors?.secondary || "text-gray-400"}`}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search topics..."
              className={`w-full pl-12 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500
                ${theme.background?.section || (isDarkMode ? "bg-gray-800" : "bg-white")}
                ${theme.border?.default || "border-gray-200 dark:border-gray-700"}
                ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}
              `}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category Filter */}
      {!searchTerm && usePredefined && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-full text-sm transition-all capitalize
              ${
                selectedCategory === "all"
                  ? "bg-sky-500 text-white"
                  : `${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}
                   ${theme.textColors?.secondary || "text-gray-600"}`
              }`}
          >
            All
          </button>
          {Object.values(TAG_CATEGORIES).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm transition-all capitalize
                ${
                  selectedCategory === cat
                    ? "bg-sky-500 text-white"
                    : `${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}
                     ${theme.textColors?.secondary || "text-gray-600"}`
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Alphabet Filter */}
      {!searchTerm && !selectedCategory !== "all" && (
        <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedLetter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
              ${
                selectedLetter === "all"
                  ? "bg-sky-500 text-white"
                  : `${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}
                   ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`
              }`}
          >
            All
          </button>
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`w-10 h-10 rounded-lg font-medium transition-all whitespace-nowrap
                ${
                  selectedLetter === letter
                    ? "bg-sky-500 text-white"
                    : `${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}
                     ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`
                }`}
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {/* Tags Grid */}
      <div className="flex flex-wrap justify-center gap-3">
        {filteredTags.map((tag) =>
          usePredefined ? (
            <PredefineTagsTagChip
              key={tag.name}
              tag={tag}
              size="md"
              variant="default"
              showCategory={false}
            />
          ) : (
            <TagChip
              key={tag.name}
              tag={tag.name}
              count={tag.count}
              size="md"
              showCount={true}
              clickable={true}
            />
          ),
        )}
      </div>

      {/* No Results */}
      {filteredTags.length === 0 && (
        <div className="text-center py-12">
          <FaTag
            className={`text-6xl mx-auto mb-4 ${theme.textColors?.secondary || "text-gray-400"}`}
          />
          <h3
            className={`text-xl font-semibold mb-2 ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}`}
          >
            No tags found
          </h3>
          <p className={theme.textColors?.secondary || "text-gray-600"}>
            Try a different search term or browse all tags
          </p>
        </div>
      )}

      {/* View More / View Less */}
      {!searchTerm &&
        selectedLetter === "all" &&
        selectedCategory === "all" &&
        (usePredefined ? PREDEFINED_TAGS.length : tags.length) >
          visibleCount && (
          <div className="text-center mt-8">
            <button
              onClick={handleViewMore}
              className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all hover:scale-105
              ${theme.background?.navigationDots || (isDarkMode ? "bg-gray-800" : "bg-gray-100")}
              ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")}
            `}
            >
              View More Tags
              <FaArrowRight size={14} />
            </button>
          </div>
        )}

      {visibleCount > limit && (
        <div className="text-center mt-4">
          <button
            onClick={handleViewLess}
            className={`text-sm ${theme.textColors?.highlight || "text-sky-600"} hover:underline`}
          >
            Show Less
          </button>
        </div>
      )}

      {/* View All Button */}
      {showViewAll &&
        !searchTerm &&
        selectedLetter === "all" &&
        selectedCategory === "all" &&
        (usePredefined ? PREDEFINED_TAGS.length : tags.length) <=
          visibleCount && (
          <div className="text-center mt-8">
            <Link
              href="/tags"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105
              ${theme.buttonColors?.primaryButton?.background || "bg-gradient-to-r from-sky-600 to-sky-500"}
              text-white
            `}
            >
              Browse All Tags
              <FaArrowRight size={16} />
            </Link>
          </div>
        )}
    </div>
  );
};

export default TagsHome;
