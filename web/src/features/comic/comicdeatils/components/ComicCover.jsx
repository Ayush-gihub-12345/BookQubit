"use client";

import React, { useState } from "react";
import {
  ComicActionButtons,
  ComicButtonGroup,
} from "@/features/comic/comiclist/components/ComicButton";

const ComicCover = ({ comic, isDarkMode, theme, isWishlisted, onToggleWishlist }) => {
  const [imageError, setImageError] = useState(false);
  const fallbackImage = "/placeholder-comic.jpg";

  return (
    <>
      <div className={`p-8 rounded-xl ${theme.background?.bookCoverSide || "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"}`}>
        <img 
          src={imageError ? fallbackImage : (comic.image || fallbackImage)} 
          alt={comic.title || "Comic cover"} 
          className="w-full h-auto object-contain rounded-lg"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
      <div className="mt-6 space-y-4">
        <ComicButtonGroup direction="vertical">
          <ComicActionButtons.ReadDigital comicSlug={comic.slug} size="lg" />
          <ComicActionButtons.BuyPhysical url="#" size="lg" />
          <ComicActionButtons.AddWishlist
            comicSlug={comic.slug}
            isWishlisted={isWishlisted}
            onToggle={onToggleWishlist}
            size="lg"
          />
          <ComicActionButtons.ShareComic comicSlug={comic.slug} size="lg" />
        </ComicButtonGroup>
      </div>
    </>
  );
};

export default ComicCover;