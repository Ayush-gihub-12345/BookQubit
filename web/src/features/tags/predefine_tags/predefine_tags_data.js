// src/features/tags/predefine_tags/predefine_tags_data.js
"use client";

// Predefined tag categories
export const TAG_CATEGORIES = {
  GENRE: "genre",
  TOPIC: "topic",
  THEME: "theme",
  MOOD: "mood",
  FORMAT: "format",
  AUDIENCE: "audience",
  AWARD: "award",
  TIME_PERIOD: "time_period"
};

// Predefined tags with metadata
export const PREDEFINED_TAGS = [
  // Genres
  { name: "fiction", category: TAG_CATEGORIES.GENRE, icon: "📚", color: "#3B82F6", popularity: 95 },
  { name: "non-fiction", category: TAG_CATEGORIES.GENRE, icon: "📖", color: "#10B981", popularity: 90 },
  { name: "fantasy", category: TAG_CATEGORIES.GENRE, icon: "🐉", color: "#8B5CF6", popularity: 85 },
  { name: "science fiction", category: TAG_CATEGORIES.GENRE, icon: "🚀", color: "#06B6D4", popularity: 88 },
  { name: "mystery", category: TAG_CATEGORIES.GENRE, icon: "🔍", color: "#EF4444", popularity: 82 },
  { name: "thriller", category: TAG_CATEGORIES.GENRE, icon: "⚡", color: "#DC2626", popularity: 80 },
  { name: "romance", category: TAG_CATEGORIES.GENRE, icon: "💕", color: "#EC4899", popularity: 85 },
  { name: "horror", category: TAG_CATEGORIES.GENRE, icon: "👻", color: "#7F1D1D", popularity: 70 },
  { name: "biography", category: TAG_CATEGORIES.GENRE, icon: "👤", color: "#F59E0B", popularity: 75 },
  { name: "autobiography", category: TAG_CATEGORIES.GENRE, icon: "📝", color: "#F59E0B", popularity: 72 },
  { name: "history", category: TAG_CATEGORIES.GENRE, icon: "🏛️", color: "#92400E", popularity: 78 },
  { name: "philosophy", category: TAG_CATEGORIES.GENRE, icon: "💭", color: "#6366F1", popularity: 68 },
  { name: "psychology", category: TAG_CATEGORIES.GENRE, icon: "🧠", color: "#A855F7", popularity: 74 },
  { name: "self-help", category: TAG_CATEGORIES.GENRE, icon: "🌱", color: "#22C55E", popularity: 82 },
  { name: "business", category: TAG_CATEGORIES.GENRE, icon: "💼", color: "#0EA5E9", popularity: 76 },
  { name: "economics", category: TAG_CATEGORIES.GENRE, icon: "📈", color: "#0EA5E9", popularity: 65 },
  { name: "politics", category: TAG_CATEGORIES.GENRE, icon: "🏛️", color: "#DC2626", popularity: 70 },
  { name: "science", category: TAG_CATEGORIES.GENRE, icon: "🔬", color: "#14B8A6", popularity: 72 },
  { name: "technology", category: TAG_CATEGORIES.GENRE, icon: "💻", color: "#3B82F6", popularity: 78 },
  { name: "art", category: TAG_CATEGORIES.GENRE, icon: "🎨", color: "#F97316", popularity: 68 },
  { name: "poetry", category: TAG_CATEGORIES.GENRE, icon: "📜", color: "#D946EF", popularity: 65 },
  { name: "drama", category: TAG_CATEGORIES.GENRE, icon: "🎭", color: "#A855F7", popularity: 60 },
  
  // Topics
  { name: "social justice", category: TAG_CATEGORIES.TOPIC, icon: "⚖️", color: "#EF4444", popularity: 85 },
  { name: "climate change", category: TAG_CATEGORIES.TOPIC, icon: "🌍", color: "#22C55E", popularity: 80 },
  { name: "mental health", category: TAG_CATEGORIES.TOPIC, icon: "🧠", color: "#06B6D4", popularity: 82 },
  { name: "leadership", category: TAG_CATEGORIES.TOPIC, icon: "👑", color: "#F59E0B", popularity: 75 },
  { name: "entrepreneurship", category: TAG_CATEGORIES.TOPIC, icon: "🚀", color: "#3B82F6", popularity: 78 },
  { name: "spirituality", category: TAG_CATEGORIES.TOPIC, icon: "🕉️", color: "#A855F7", popularity: 68 },
  { name: "relationships", category: TAG_CATEGORIES.TOPIC, icon: "💑", color: "#EC4899", popularity: 72 },
  { name: "parenting", category: TAG_CATEGORIES.TOPIC, icon: "👨‍👩‍👧", color: "#10B981", popularity: 65 },
  { name: "education", category: TAG_CATEGORIES.TOPIC, icon: "🎓", color: "#6366F1", popularity: 70 },
  { name: "health", category: TAG_CATEGORIES.TOPIC, icon: "🏥", color: "#22C55E", popularity: 78 },
  { name: "fitness", category: TAG_CATEGORIES.TOPIC, icon: "💪", color: "#14B8A6", popularity: 72 },
  { name: "cooking", category: TAG_CATEGORIES.TOPIC, icon: "🍳", color: "#F97316", popularity: 68 },
  { name: "travel", category: TAG_CATEGORIES.TOPIC, icon: "✈️", color: "#06B6D4", popularity: 74 },
  { name: "photography", category: TAG_CATEGORIES.TOPIC, icon: "📷", color: "#8B5CF6", popularity: 62 },
  { name: "music", category: TAG_CATEGORIES.TOPIC, icon: "🎵", color: "#EC4899", popularity: 70 },
  
  // Themes
  { name: "love", category: TAG_CATEGORIES.THEME, icon: "❤️", color: "#EF4444", popularity: 90 },
  { name: "friendship", category: TAG_CATEGORIES.THEME, icon: "🤝", color: "#F59E0B", popularity: 85 },
  { name: "family", category: TAG_CATEGORIES.THEME, icon: "👨‍👩‍👧‍👦", color: "#10B981", popularity: 82 },
  { name: "death", category: TAG_CATEGORIES.THEME, icon: "💀", color: "#6B7280", popularity: 65 },
  { name: "hope", category: TAG_CATEGORIES.THEME, icon: "🌟", color: "#FBBF24", popularity: 78 },
  { name: "redemption", category: TAG_CATEGORIES.THEME, icon: "🔄", color: "#8B5CF6", popularity: 70 },
  { name: "courage", category: TAG_CATEGORIES.THEME, icon: "🦁", color: "#F97316", popularity: 75 },
  { name: "survival", category: TAG_CATEGORIES.THEME, icon: "🏕️", color: "#14B8A6", popularity: 68 },
  { name: "justice", category: TAG_CATEGORIES.THEME, icon: "⚖️", color: "#3B82F6", popularity: 72 },
  { name: "freedom", category: TAG_CATEGORIES.THEME, icon: "🕊️", color: "#06B6D4", popularity: 76 },
  
  // Moods
  { name: "inspiring", category: TAG_CATEGORIES.MOOD, icon: "✨", color: "#FBBF24", popularity: 88 },
  { name: "thought-provoking", category: TAG_CATEGORIES.MOOD, icon: "💭", color: "#8B5CF6", popularity: 85 },
  { name: "heartwarming", category: TAG_CATEGORIES.MOOD, icon: "🔥", color: "#EF4444", popularity: 82 },
  { name: "sad", category: TAG_CATEGORIES.MOOD, icon: "😢", color: "#6B7280", popularity: 60 },
  { name: "funny", category: TAG_CATEGORIES.MOOD, icon: "😂", color: "#F59E0B", popularity: 75 },
  { name: "suspenseful", category: TAG_CATEGORIES.MOOD, icon: "🎬", color: "#DC2626", popularity: 72 },
  { name: "relaxing", category: TAG_CATEGORIES.MOOD, icon: "😌", color: "#22C55E", popularity: 70 },
  { name: "exciting", category: TAG_CATEGORIES.MOOD, icon: "🤩", color: "#F97316", popularity: 78 },
  { name: "dark", category: TAG_CATEGORIES.MOOD, icon: "🌑", color: "#374151", popularity: 65 },
  { name: "whimsical", category: TAG_CATEGORIES.MOOD, icon: "🦄", color: "#D946EF", popularity: 68 },
  
  // Awards
  { name: "booker prize", category: TAG_CATEGORIES.AWARD, icon: "🏆", color: "#FBBF24", popularity: 85 },
  { name: "pulitzer", category: TAG_CATEGORIES.AWARD, icon: "📰", color: "#F59E0B", popularity: 88 },
  { name: "nobel prize", category: TAG_CATEGORIES.AWARD, icon: "🏅", color: "#14B8A6", popularity: 90 },
  { name: "national book award", category: TAG_CATEGORIES.AWARD, icon: "📖", color: "#3B82F6", popularity: 82 },
  { name: "hugo award", category: TAG_CATEGORIES.AWARD, icon: "🚀", color: "#8B5CF6", popularity: 78 },
  { name: "nebula award", category: TAG_CATEGORIES.AWARD, icon: "🌌", color: "#06B6D4", popularity: 75 },
  
  // Time Periods
  { name: "classic", category: TAG_CATEGORIES.TIME_PERIOD, icon: "📜", color: "#92400E", popularity: 85 },
  { name: "contemporary", category: TAG_CATEGORIES.TIME_PERIOD, icon: "📱", color: "#3B82F6", popularity: 88 },
  { name: "bestseller", category: TAG_CATEGORIES.TIME_PERIOD, icon: "⭐", color: "#FBBF24", popularity: 92 },
  { name: "new release", category: TAG_CATEGORIES.TIME_PERIOD, icon: "🆕", color: "#22C55E", popularity: 90 },
  
  // Formats
  { name: "audiobook", category: TAG_CATEGORIES.FORMAT, icon: "🎧", color: "#A855F7", popularity: 82 },
  { name: "e-book", category: TAG_CATEGORIES.FORMAT, icon: "📱", color: "#06B6D4", popularity: 85 },
  { name: "paperback", category: TAG_CATEGORIES.FORMAT, icon: "📚", color: "#F59E0B", popularity: 88 },
  { name: "hardcover", category: TAG_CATEGORIES.FORMAT, icon: "📕", color: "#DC2626", popularity: 80 },
  
  // Audience
  { name: "young adult", category: TAG_CATEGORIES.AUDIENCE, icon: "🧑", color: "#EC4899", popularity: 85 },
  { name: "children", category: TAG_CATEGORIES.AUDIENCE, icon: "🧒", color: "#22C55E", popularity: 78 },
  { name: "adult", category: TAG_CATEGORIES.AUDIENCE, icon: "👨", color: "#3B82F6", popularity: 90 },
  { name: "new adult", category: TAG_CATEGORIES.AUDIENCE, icon: "🎓", color: "#F59E0B", popularity: 75 },
  { name: "middle grade", category: TAG_CATEGORIES.AUDIENCE, icon: "📘", color: "#14B8A6", popularity: 70 }
];

// Get tags by category
export const getTagsByCategory = (category) => {
  return PREDEFINED_TAGS.filter(tag => tag.category === category);
};

// Get all categories
export const getAllCategories = () => {
  return Object.values(TAG_CATEGORIES);
};

// Get tags by popularity
export const getPopularPredefinedTags = (limit = 20) => {
  return [...PREDEFINED_TAGS].sort((a, b) => b.popularity - a.popularity).slice(0, limit);
};

// Search predefined tags
export const searchPredefinedTags = (query, limit = 10) => {
  if (!query) return [];
  const searchLower = query.toLowerCase();
  return PREDEFINED_TAGS
    .filter(tag => tag.name.toLowerCase().includes(searchLower))
    .slice(0, limit);
};

// Get tag by name
export const getPredefinedTagByName = (name) => {
  return PREDEFINED_TAGS.find(tag => tag.name.toLowerCase() === name.toLowerCase());
};

// Check if tag is predefined
export const isPredefinedTag = (tagName) => {
  return PREDEFINED_TAGS.some(tag => tag.name.toLowerCase() === tagName.toLowerCase());
};

// Get tags by category with limit
export const getTagsByCategoryWithLimit = (category, limit = 10) => {
  const tags = getTagsByCategory(category);
  return tags.slice(0, limit);
};

// Get category icon
export const getCategoryIcon = (category) => {
  const icons = {
    [TAG_CATEGORIES.GENRE]: "📚",
    [TAG_CATEGORIES.TOPIC]: "💡",
    [TAG_CATEGORIES.THEME]: "🎯",
    [TAG_CATEGORIES.MOOD]: "😊",
    [TAG_CATEGORIES.FORMAT]: "📖",
    [TAG_CATEGORIES.AUDIENCE]: "👥",
    [TAG_CATEGORIES.AWARD]: "🏆",
    [TAG_CATEGORIES.TIME_PERIOD]: "⏰"
  };
  return icons[category] || "🏷️";
};

// Get category title
export const getCategoryTitle = (category) => {
  const titles = {
    [TAG_CATEGORIES.GENRE]: "Genres",
    [TAG_CATEGORIES.TOPIC]: "Topics",
    [TAG_CATEGORIES.THEME]: "Themes",
    [TAG_CATEGORIES.MOOD]: "Moods",
    [TAG_CATEGORIES.FORMAT]: "Formats",
    [TAG_CATEGORIES.AUDIENCE]: "Audience",
    [TAG_CATEGORIES.AWARD]: "Awards",
    [TAG_CATEGORIES.TIME_PERIOD]: "Time Period"
  };
  return titles[category] || category;
};