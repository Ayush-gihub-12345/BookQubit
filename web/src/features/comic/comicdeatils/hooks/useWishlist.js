"use client";

import { useState, useEffect } from "react";

export const useWishlist = (comicSlug) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    // Load wishlist status from localStorage or API
    if (comicSlug && typeof window !== 'undefined') {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setIsWishlisted(wishlist.includes(comicSlug));
    }
  }, [comicSlug]);

  const toggleWishlist = () => {
    if (typeof window !== 'undefined') {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      let newWishlist;
      
      if (isWishlisted) {
        newWishlist = wishlist.filter((slug) => slug !== comicSlug);
      } else {
        newWishlist = [...wishlist, comicSlug];
      }
      
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));
      setIsWishlisted(!isWishlisted);
    }
  };

  return { isWishlisted, toggleWishlist };
};