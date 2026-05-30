// src/components_drift/explore/TrendingTopics.jsx

"use client";

const trendingTopics = [
  { rank: 1, topic: "#DriftLaunch", posts: "125K posts", category: "Technology" },
  { rank: 2, topic: "BookQubit", posts: "89K posts", category: "Publishing" },
  { rank: 3, topic: "AI Revolution", posts: "67K posts", category: "Technology" },
  { rank: 4, topic: "Summer Reads", posts: "45K posts", category: "Books" },
  { rank: 5, topic: "Web3", posts: "234K posts", category: "Crypto" },
  { rank: 6, topic: "#WritingCommunity", posts: "34K posts", category: "Writing" },
];

export default function TrendingTopics() {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">Trending Now 🔥</h2>
      </div>
      
      <div className="divide-y divide-gray-800">
        {trendingTopics.map((topic) => (
          <div
            key={topic.rank}
            className="p-4 hover:bg-gray-800/50 transition-colors cursor-pointer"
          >
            <div className="text-xs text-gray-500 mb-1">
              {topic.rank} · {topic.category}
            </div>
            <div className="font-bold text-white mb-1">{topic.topic}</div>
            <div className="text-xs text-gray-500">{topic.posts}</div>
          </div>
        ))}
      </div>
      
      <button className="w-full text-left p-4 text-blue-500 hover:bg-gray-800/50 transition-colors">
        Show more
      </button>
    </div>
  );
}