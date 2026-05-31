//src\utils\ScrollToTop.jsx

"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollToTop - Automatically scrolls to top when page/route changes
 * Use this in your layout or individual pages
 */
const ScrollToTop = ({ behavior = 'auto', onMount = true, onRouteChange = true }) => {
  const pathname = usePathname();

  // Scroll to top on component mount
  useEffect(() => {
    if (onMount) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: behavior
      });
    }
  }, [onMount, behavior]);

  // Scroll to top on route change
  useEffect(() => {
    if (onRouteChange && pathname) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: behavior
      });
    }
  }, [pathname, onRouteChange, behavior]);

  return null;
};

export default ScrollToTop;