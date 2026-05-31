// src/components_drift/explore/ExploreFeed.jsx

"use client";

import { useState, useEffect } from "react";
import ExplorePost from "./ExplorePost";
import LoadingSpinner from "./LoadingSpinner";

export default function ExploreFeed({ category, searchQuery }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample data - Replace with API call
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const samplePosts = [
        {
          id: 1,
          name: "BookQubit",
          username: "bookqubit",
          time: "2h ago",
          content: "Just launched our new Explore feature! Discover amazing content tailored for you. #Drift",
          image: null,
          likes: 1234,
          comments: 89,
          retweets: 234,
          avatar: "https://via.placeholder.com/48",
          category: "technology",
        },
        {
          id: 2,
          name: "TechCrunch",
          username: "techcrunch",
          time: "4h ago",
          content: "Breaking: New AI technology revolutionizes how we interact with social media. The future is here! 🚀",
          image: "https://via.placeholder.com/600x400",
          likes: 5678,
          comments: 456,
          retweets: 1234,
          avatar: "https://via.placeholder.com/48",
          category: "technology",
        },
        {
          id: 3,
          name: "SportsCenter",
          username: "sportscenter",
          time: "6h ago",
          content: "Incredible match today! The championship finals were absolutely thrilling. 🏆",
          image: "https://via.placeholder.com/600x400",
          likes: 3456,
          comments: 234,
          retweets: 567,
          avatar: "https://via.placeholder.com/48",
          category: "sports",
        },
        {
          id: 4,
          name: "Music Daily",
          username: "musicdaily",
          time: "8h ago",
          content: "New album dropping this Friday! Get ready for the hottest tracks of the summer. 🎵",
          image: null,
          likes: 2345,
          comments: 123,
          retweets: 456,
          avatar: "https://via.placeholder.com/48",
          category: "music",
        },
        {
          id: 5,
          name: "Gaming News",
          username: "gamingnews",
          time: "10h ago",
          content: "Major esports tournament announced with $1M prize pool! Who's ready to compete? 🎮",
          image: "https://via.placeholder.com/600x400",
          likes: 4567,
          comments: 345,
          retweets: 789,
          avatar: "https://via.placeholder.com/48",
          category: "gaming",
        },
      ];

      let filteredPosts = samplePosts;
      
      // Filter by category
      if (category !== "for-you" && category !== "trending") {
        filteredPosts = samplePosts.filter(post => post.category === category);
      }
      
      // Filter by search query
      if (searchQuery) {
        filteredPosts = samplePosts.filter(post => 
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setPosts(filteredPosts);
      setLoading(false);
    }, 500);
  }, [category, searchQuery]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
        <p className="text-gray-500">
          Try searching for something else or check out trending topics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => (
        <ExplorePost key={post.id} post={post} />
      ))}
    </div>
  );
}