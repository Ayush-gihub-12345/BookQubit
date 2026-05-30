"use client";

import { useEffect } from 'react';

const useSEO = ({ title, description, keywords, image, url, author, type = 'website' }) => {
  useEffect(() => {
    // Save original title
    const originalTitle = document.title;
    
    // Set title
    document.title = title;

    // Helper to update or create meta tags
    const setMetaTag = (name, content, isProperty = false) => {
      if (!content) return;
      
      let tag;
      if (isProperty) {
        tag = document.querySelector(`meta[property="${name}"]`);
      } else {
        tag = document.querySelector(`meta[name="${name}"]`);
      }
      
      if (!tag) {
        tag = document.createElement('meta');
        if (isProperty) {
          tag.setAttribute('property', name);
        } else {
          tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Helper to update or create link tags
    const setLinkTag = (rel, href) => {
      if (!href) return;
      
      let tag = document.querySelector(`link[rel="${rel}"]`);
      if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        document.head.appendChild(tag);
      }
      tag.setAttribute('href', href);
    };

    // Set basic meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('author', author);
    setMetaTag('robots', 'index, follow');
    
    // Open Graph
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:url', url, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:site_name', 'BookQubit', true);
    setMetaTag('og:locale', 'en_US', true);
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
    
    // Twitter
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:site', '@bookqubit');
    setMetaTag('twitter:creator', '@bookqubit');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', image);
    setMetaTag('twitter:url', url);
    
    // Canonical
    setLinkTag('canonical', url);

    // Cleanup function
    return () => {
      document.title = originalTitle;
      // Optionally remove added meta tags if needed
    };
  }, [title, description, keywords, image, url, author, type]);
};

export default useSEO;