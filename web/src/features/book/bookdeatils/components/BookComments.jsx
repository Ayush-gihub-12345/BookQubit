"use client";

import React, { useState } from "react";
import { FaComments } from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";

const BookComments = ({ showComments, onToggleComments }) => {
  const { theme, themeName } = useTheme();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  // Guard against undefined theme
  if (!theme) {
    return null;
  }

  // Check if current theme is dark mode
  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const handlePostComment = () => {
    if (!comment.trim()) return;

    const newComment = {
      id: Date.now(),
      text: comment,
      user: "Current User",
      date: new Date().toLocaleDateString(),
    };

    setComments([...comments, newComment]);
    setComment("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePostComment();
    }
  };

  // Get button styles based on show state
  const getToggleButtonStyles = () => {
    if (showComments) {
      return "bg-gradient-to-r from-blue-600 to-blue-500 text-white";
    }
    const secondaryBg = theme.buttonColors?.secondaryButton?.background || 'border-2 border-sky-500 bg-transparent';
    const secondaryText = theme.buttonColors?.secondaryButton?.textColor || 'text-sky-600 dark:text-sky-400';
    return `${secondaryBg} ${secondaryText}`;
  };

  return (
    <div
      className={`
        ${theme.shadow?.container || 'shadow-lg'} 
        ${theme.border?.default || 'border border-gray-200 dark:border-gray-700'} 
        p-6 
        ${theme.background?.section || 'bg-white dark:bg-gray-800'} 
        mb-16 
        rounded-2xl
      `}
    >
      <button
        onClick={onToggleComments}
        className={`
          flex items-center gap-2 px-4 py-3 rounded-lg 
          font-medium transition-all duration-200 
          hover:scale-105 active:scale-95
          ${getToggleButtonStyles()}
        `}
      >
        <FaComments className="w-4 h-4" />
        {showComments ? "Hide Comments" : "Show Comments"}
      </button>

      {showComments && (
        <div className="mt-6 space-y-4">
          {/* Input Area */}
          <div className="flex gap-3">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add your comment..."
              className={`
                flex-1 px-4 py-3 rounded-lg border 
                focus:outline-none focus:ring-2 focus:ring-sky-500
                transition-all duration-200
                ${theme.border?.default || 'border-gray-300 dark:border-gray-600'}
                ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'}
                ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}
                placeholder-gray-400 dark:placeholder-gray-500
              `}
            />
            <button
              onClick={handlePostComment}
              className={`
                px-6 py-3 rounded-lg font-medium 
                transition-all duration-200 hover:scale-105 active:scale-95
                ${theme.buttonColors?.primaryButton?.background || 'bg-gradient-to-r from-blue-600 to-blue-500'}
                ${theme.buttonColors?.primaryButton?.hoverBackground || 'hover:from-blue-700 hover:to-blue-600'}
                text-white
              `}
            >
              Post
            </button>
          </div>

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className={`text-center py-8 ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className={`
                    p-4 rounded-lg 
                    ${theme.background?.navigationDots || 'bg-gray-100 dark:bg-gray-700'}
                    transition-all duration-200 hover:shadow-md
                  `}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium ${theme.textColors?.primary || 'text-gray-900 dark:text-white'}`}>
                      {c.user}
                    </span>
                    <span className={`text-xs ${theme.textColors?.secondary || 'text-gray-600 dark:text-gray-400'}`}>
                      {c.date}
                    </span>
                  </div>
                  <p className={theme.textColors?.primary || 'text-gray-900 dark:text-white'}>
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookComments;