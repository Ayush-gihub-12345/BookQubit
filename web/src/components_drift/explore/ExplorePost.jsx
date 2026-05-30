// src/components_drift/explore/ExplorePost.jsx

"use client";

import { useState } from "react";
import Image from "next/image";

export default function ExplorePost({ post }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const truncateText = (text, maxLength = 120) => {
    if (text.length <= maxLength || isExpanded) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <div className="bg-gray-900/30 rounded-xl hover:bg-gray-900/50 transition-all duration-200 p-4 mb-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <img
          src={post.avatar}
          alt={post.name}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-bold text-white hover:underline cursor-pointer text-sm md:text-base">
              {post.name}
            </span>
            <span className="text-gray-500 text-xs">@{post.username}</span>
            <span className="text-gray-500 text-xs">· {post.time}</span>
          </div>

          {/* Content Text */}
          <p className="text-white text-sm md:text-base mb-3 break-words leading-relaxed">
            {truncateText(post.content)}
            {post.content.length > 120 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-500 ml-2 hover:underline"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </p>

          {/* Media */}
          {post.image && (
            <div className="rounded-xl overflow-hidden mb-3 cursor-pointer hover:opacity-90 transition-opacity">
              <img
                src={post.image}
                alt="Post media"
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between max-w-md mt-2 text-gray-500">
            <button className="flex items-center gap-1 md:gap-2 hover:text-blue-500 transition-colors group">
              <div className="p-1 md:p-2 rounded-full group-hover:bg-blue-500/10">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-xs md:text-sm">{formatNumber(post.comments)}</span>
            </button>

            <button className="flex items-center gap-1 md:gap-2 hover:text-green-500 transition-colors group">
              <div className="p-1 md:p-2 rounded-full group-hover:bg-green-500/10">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="text-xs md:text-sm">{formatNumber(post.retweets)}</span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1 md:gap-2 transition-colors group ${
                liked ? "text-red-500" : "hover:text-red-500"
              }`}
            >
              <div className={`p-1 md:p-2 rounded-full group-hover:bg-red-500/10`}>
                <svg className="w-4 h-4 md:w-5 md:h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xs md:text-sm">{formatNumber(likeCount)}</span>
            </button>

            <button className="flex items-center gap-1 md:gap-2 hover:text-purple-500 transition-colors group">
              <div className="p-1 md:p-2 rounded-full group-hover:bg-purple-500/10">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}