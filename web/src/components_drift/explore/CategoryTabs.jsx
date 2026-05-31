// src/components_drift/explore/CategoryTabs.jsx

"use client";

const categories = [
  { id: "for-you", label: "For You", icon: "🔥" },
  { id: "trending", label: "Trending", icon: "📈" },
  { id: "news", label: "News", icon: "📰" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "entertainment", label: "Entertainment", icon: "🎬" },
  { id: "technology", label: "Technology", icon: "💻" },
  { id: "gaming", label: "Gaming", icon: "🎮" },
  { id: "music", label: "Music", icon: "🎵" },
];

export default function CategoryTabs({ activeCategory, setActiveCategory }) {
  return (
    <div className="border-b border-gray-800 overflow-x-auto scrollbar-hide">
      <div className="flex gap-1 px-4 py-2 min-w-max">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
              activeCategory === category.id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}