// src/components_drift/explore/RecommendedUsers.jsx

"use client";

import { useState } from "react";

const recommendedUsers = [
  {
    id: 1,
    name: "Elon Musk",
    username: "elonmusk",
    avatar: "https://via.placeholder.com/48",
    bio: "CEO of Tesla, SpaceX",
    followers: "45M",
  },
  {
    id: 2,
    name: "NASA",
    username: "nasa",
    avatar: "https://via.placeholder.com/48",
    bio: "Space exploration agency",
    followers: "32M",
  },
  {
    id: 3,
    name: "Mark Zuckerberg",
    username: "zuck",
    avatar: "https://via.placeholder.com/48",
    bio: "Meta CEO",
    followers: "28M",
  },
  {
    id: 4,
    name: "Bill Gates",
    username: "billgates",
    avatar: "https://via.placeholder.com/48",
    bio: "Philanthropist",
    followers: "56M",
  },
];

export default function RecommendedUsers() {
  const [following, setFollowing] = useState({});

  const toggleFollow = (userId) => {
    setFollowing(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">Who to Follow 👥</h2>
      </div>
      
      <div className="divide-y divide-gray-800">
        {recommendedUsers.map((user) => (
          <div key={user.id} className="p-4 hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-bold text-white hover:underline cursor-pointer truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">@{user.username}</div>
                  <div className="text-xs text-gray-500 mt-1">{user.followers} followers</div>
                </div>
              </div>
              
              <button
                onClick={() => toggleFollow(user.id)}
                className={`text-sm font-bold px-4 py-1.5 rounded-full transition-colors flex-shrink-0 ${
                  following[user.id]
                    ? "bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {following[user.id] ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full text-left p-4 text-blue-500 hover:bg-gray-800/50 transition-colors">
        Show more
      </button>
    </div>
  );
}