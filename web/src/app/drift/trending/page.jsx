// src/app/drift/trending/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TrendingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("for-you");
  const [selectedLocation, setSelectedLocation] = useState("worldwide");
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // Tabs data
  const tabs = [
    { id: "for-you", label: "For You", icon: "🔥" },
    { id: "trending", label: "Trending", icon: "📈" },
    { id: "news", label: "News", icon: "📰" },
    { id: "entertainment", label: "Entertainment", icon: "🎬" },
    { id: "sports", label: "Sports", icon: "⚽" },
  ];

  // Locations data
  const locations = [
    { id: "worldwide", label: "🌍 Worldwide", flag: "🌍" },
    { id: "us", label: "🇺🇸 United States", flag: "🇺🇸" },
    { id: "india", label: "🇮🇳 India", flag: "🇮🇳" },
    { id: "uk", label: "🇬🇧 United Kingdom", flag: "🇬🇧" },
    { id: "canada", label: "🇨🇦 Canada", flag: "🇨🇦" },
    { id: "australia", label: "🇦🇺 Australia", flag: "🇦🇺" },
  ];

  // News data
  const newsItems = [
    {
      id: 1,
      title: "Major breakthrough in quantum computing announced",
      source: "TechCrunch",
      time: "2 hours ago",
      image: "https://via.placeholder.com/80",
    },
    {
      id: 2,
      title: "Global climate summit reaches historic agreement",
      source: "BBC News",
      time: "4 hours ago",
      image: "https://via.placeholder.com/80",
    },
    {
      id: 3,
      title: "New social media platform Drift gains 1M users in first week",
      source: "BookQubit News",
      time: "6 hours ago",
      image: "https://via.placeholder.com/80",
    },
  ];

  // Hashtags data
  const hashtags = [
    { tag: "#AIRevolution", posts: "125K", trend: "+234%" },
    { tag: "#BookQubit", posts: "89K", trend: "+189%" },
    { tag: "#Web3", posts: "67K", trend: "+156%" },
    { tag: "#WritingCommunity", posts: "45K", trend: "+123%" },
    { tag: "#TechNews", posts: "34K", trend: "+98%" },
  ];

  // Sample trends data
  const sampleTrends = {
    "for-you": [
      {
        id: 1,
        rank: 1,
        category: "Trending in Technology",
        title: "#AIRevolution",
        posts: "125K posts",
        trendScore: "+2,345%",
        image: null,
        isVerified: true,
      },
      {
        id: 2,
        rank: 2,
        category: "Trending in Books",
        title: "BookQubit Launch",
        posts: "89K posts",
        trendScore: "+1,234%",
        image: "https://via.placeholder.com/600x300",
        isVerified: true,
      },
      {
        id: 3,
        rank: 3,
        category: "Politics",
        title: "#Election2024",
        posts: "234K posts",
        trendScore: "+5,678%",
        image: null,
        isVerified: false,
      },
      {
        id: 4,
        rank: 4,
        category: "Entertainment",
        title: "New Movie Release",
        posts: "67K posts",
        trendScore: "+890%",
        image: "https://via.placeholder.com/600x300",
        isVerified: true,
      },
      {
        id: 5,
        rank: 5,
        category: "Sports",
        title: "#WorldCup2026",
        posts: "456K posts",
        trendScore: "+12,345%",
        image: null,
        isVerified: true,
      },
    ],
    trending: [
      {
        id: 6,
        rank: 1,
        category: "Worldwide",
        title: "#GlobalWarming",
        posts: "1.2M posts",
        trendScore: "+45,678%",
        image: null,
        isVerified: true,
      },
      {
        id: 7,
        rank: 2,
        category: "Technology",
        title: "Tesla Robotaxi",
        posts: "567K posts",
        trendScore: "+23,456%",
        image: "https://via.placeholder.com/600x300",
        isVerified: true,
      },
      {
        id: 8,
        rank: 3,
        category: "Crypto",
        title: "#BitcoinHalving",
        posts: "345K posts",
        trendScore: "+8,765%",
        image: null,
        isVerified: true,
      },
    ],
    news: [
      {
        id: 9,
        rank: 1,
        category: "Breaking News",
        title: "Major Discovery in Space",
        posts: "345K posts",
        trendScore: "+67,890%",
        image: "https://via.placeholder.com/600x300",
        isVerified: true,
      },
      {
        id: 10,
        rank: 2,
        category: "World News",
        title: "Global Summit 2024",
        posts: "234K posts",
        trendScore: "+45,678%",
        image: "https://via.placeholder.com/600x300",
        isVerified: true,
      },
    ],
    entertainment: [
      {
        id: 11,
        rank: 1,
        category: "Music",
        title: "New Album Drop",
        posts: "123K posts",
        trendScore: "+7,890%",
        image: "https://via.placeholder.com/600x300",
        isVerified: true,
      },
      {
        id: 12,
        rank: 2,
        category: "Movies",
        title: "#BoxOfficeHit",
        posts: "98K posts",
        trendScore: "+5,432%",
        image: "https://via.placeholder.com/600x300",
        isVerified: true,
      },
    ],
    sports: [
      {
        id: 13,
        rank: 1,
        category: "Football",
        title: "#ChampionsLeague",
        posts: "789K posts",
        trendScore: "+34,567%",
        image: "https://via.placeholder.com/600x300",
        isVerified: true,
      },
      {
        id: 14,
        rank: 2,
        category: "Basketball",
        title: "#NBAFinals",
        posts: "456K posts",
        trendScore: "+23,456%",
        image: "https://via.placeholder.com/600x300",
        isVerified: true,
      },
    ],
  };

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTrends(sampleTrends[activeTab] || sampleTrends["for-you"]);
      setLoading(false);
    }, 500);
  }, [activeTab]);

  const getTrendColor = (score) => {
    const num = parseInt(score.replace(/[^0-9]/g, ''));
    if (num > 10000) return "text-red-500";
    if (num > 5000) return "text-orange-500";
    return "text-green-500";
  };

  const selected = locations.find(loc => loc.id === selectedLocation);

  // Loading Spinner Component
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="mt-4 text-gray-500 text-center">Loading trends...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          <button 
            onClick={() => router.back()}
            className="lg:hidden text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div>
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              Trending
            </h1>
            <p className="text-xs text-gray-500 hidden lg:block">What's happening right now</p>
          </div>
          
          <button className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 p-4">
        {/* Left Column - Main Content */}
        <div className="flex-1 lg:max-w-2xl">
          {/* Tabs */}
          <div className="border-b border-gray-800 overflow-x-auto scrollbar-hide sticky top-[57px] bg-black/80 backdrop-blur-sm z-5">
            <div className="flex gap-1 px-4 py-2 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trending List */}
          <div className="space-y-2 mt-4">
            {trends.map((trend) => (
              <div key={trend.id} className="bg-gray-900/30 rounded-xl hover:bg-gray-900/50 transition-all duration-200 p-4 mb-3 cursor-pointer">
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-500">#{trend.rank}</span>
                      <span className="text-xs text-gray-500">{trend.category}</span>
                      {trend.isVerified && (
                        <span className="text-blue-500 text-xs">✓ Verified</span>
                      )}
                    </div>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setShowMenu(showMenu === trend.id ? null : trend.id)}
                        className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-gray-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                      
                      {showMenu === trend.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl z-10">
                          <button className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                            Not interested
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                            Hide this trend
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trend Title */}
                  <div className="mb-2">
                    <h3 className="text-xl font-bold text-white hover:text-orange-500 transition-colors">
                      {trend.title}
                    </h3>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-gray-500">{trend.posts}</span>
                    <span className={`text-sm font-medium ${getTrendColor(trend.trendScore)}`}>
                      ↑ {trend.trendScore}
                    </span>
                  </div>

                  {/* Image if exists */}
                  {trend.image && (
                    <div className="rounded-xl overflow-hidden mt-3">
                      <img 
                        src={trend.image} 
                        alt={trend.title}
                        className="w-full h-auto max-h-64 object-cover"
                      />
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center gap-6 mt-4 pt-2 border-t border-gray-800">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-sm">Discuss</span>
                    </button>
                    
                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:w-80 xl:w-96 space-y-6">
          {/* Location Selector */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Trending Locations 📍</h2>
            </div>
            
            <div className="p-4">
              <button
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="w-full flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selected?.flag}</span>
                  <span className="text-white">{selected?.label}</span>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isLocationOpen && (
                <div className="mt-2 bg-gray-800 rounded-lg overflow-hidden">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => {
                        setSelectedLocation(location.id);
                        setIsLocationOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-700 transition-colors ${
                        selectedLocation === location.id ? 'bg-gray-700' : ''
                      }`}
                    >
                      <span className="text-xl">{location.flag}</span>
                      <span className="text-white">{location.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Trending News */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Latest News 📰</h2>
            </div>
            
            <div className="divide-y divide-gray-800">
              {newsItems.map((news) => (
                <div key={news.id} className="p-4 hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white mb-1 line-clamp-2">
                        {news.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{news.source}</span>
                        <span>•</span>
                        <span>{news.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full text-left p-4 text-orange-500 hover:bg-gray-800/50 transition-colors">
              Show more news
            </button>
          </div>

          {/* Trending Hashtags */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Trending Hashtags #️⃣</h2>
            </div>
            
            <div className="divide-y divide-gray-800">
              {hashtags.map((hashtag) => (
                <div key={hashtag.tag} className="p-4 hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <div className="font-bold text-white hover:text-orange-500 transition-colors mb-1">
                    {hashtag.tag}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{hashtag.posts} posts</span>
                    <span className="text-green-500">↑ {hashtag.trend}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full text-left p-4 text-orange-500 hover:bg-gray-800/50 transition-colors">
              Show more hashtags
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}