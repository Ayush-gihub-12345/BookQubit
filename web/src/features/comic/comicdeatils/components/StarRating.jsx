"use client";

import React from "react";

const StarRating = ({ rating, theme, isDarkMode, size = "md" }) => {
  const fullStars = Math.floor(rating / 2);
  const hasHalfStar = (rating / 2) % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const starSize = sizeClasses[size] || sizeClasses.md;
  const textSize =
    size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-lg";

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <span
          key={`full-${i}`}
          className={`${starSize} ${theme.iconColors?.starFilled || "text-amber-400"}`}
        >
          ★
        </span>
      ))}
      {hasHalfStar && (
        <span
          key="half"
          className={`${starSize} ${theme.iconColors?.starFilled || "text-amber-400"}`}
        >
          ½
        </span>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <span
          key={`empty-${i}`}
          className={`${starSize} ${theme.iconColors?.starEmpty || "text-gray-300"}`}
        >
          ★
        </span>
      ))}
      {size !== "sm" && (
        <span
          className={`${textSize} font-semibold ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} ml-2`}
        >
          {rating}/10
        </span>
      )}
    </div>
  );
};

export default StarRating;
