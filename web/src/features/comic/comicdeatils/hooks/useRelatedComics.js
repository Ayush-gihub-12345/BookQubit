"use client";

import { useMemo } from "react";

export const useRelatedComics = (currentComic, allComics) => {
  const relatedByCategory = useMemo(() => {
    if (!currentComic || !allComics) return [];
    
    return allComics
      .filter(comic => 
        comic.id !== currentComic.id && 
        comic.slug !== currentComic.slug &&
        comic.category === currentComic.category
      )
      .slice(0, 4);
  }, [currentComic, allComics]);

  const relatedByPublisher = useMemo(() => {
    if (!currentComic || !allComics) return [];
    
    return allComics
      .filter(comic => 
        comic.id !== currentComic.id && 
        comic.slug !== currentComic.slug &&
        comic.publisher === currentComic.publisher &&
        comic.category !== currentComic.category
      )
      .slice(0, 4);
  }, [currentComic, allComics]);

  const relatedByCharacters = useMemo(() => {
    if (!currentComic || !allComics || !currentComic.charactersIntroduced) return [];
    
    return allComics
      .filter(comic => 
        comic.id !== currentComic.id && 
        comic.slug !== currentComic.slug &&
        comic.charactersIntroduced?.some(char => 
          currentComic.charactersIntroduced?.includes(char)
        )
      )
      .slice(0, 4);
  }, [currentComic, allComics]);

  return {
    relatedByCategory,
    relatedByPublisher,
    relatedByCharacters,
    allRelated: [...new Set([...relatedByCategory, ...relatedByPublisher, ...relatedByCharacters])].slice(0, 8)
  };
};