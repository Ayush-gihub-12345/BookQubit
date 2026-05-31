"use client";

import React from "react";
import ComicRectangleCard from "@/features/comic/comiclist/ui/ComicRectangleCard";
import ComicSquareCard from "@/features/comic/comiclist/ui/ComicSquareCard";
import ComicCompactCard from "@/features/comic/comiclist/ui/ComicCompactCard";

const ComicsGrid = ({
  comics,
  viewMode,
  cardStyle,
  wishlist,
  onWishlistToggle,
  onTagClick,
}) => {
  const renderCard = (comic) => {
    if (viewMode === "list") {
      return (
        <ComicRectangleCard
          key={comic.id}
          comic={comic}
          onWishlistToggle={onWishlistToggle}
          isWishlisted={wishlist.includes(comic.id)}
        />
      );
    } else {
      switch (cardStyle) {
        case "compact":
          return (
            <ComicCompactCard
              key={comic.id}
              comic={comic}
              collections={comic.series ? [comic.series] : []}
              showCollections={true}
            />
          );
        case "rectangle":
          return (
            <ComicRectangleCard
              key={comic.id}
              comic={comic}
              onWishlistToggle={onWishlistToggle}
              isWishlisted={wishlist.includes(comic.id)}
            />
          );
        default:
          return (
            <ComicSquareCard
              key={comic.id}
              comic={comic}
              onTagClick={onTagClick}
              onWishlistToggle={onWishlistToggle}
              isWishlisted={wishlist.includes(comic.id)}
            />
          );
      }
    }
  };

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {comics.map((comic) => renderCard(comic))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comics.map((comic) => renderCard(comic))}
    </div>
  );
};

export default ComicsGrid;