"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import './MiddleContent.css';

export default function MiddleContent({ children }) {
  const pathname = usePathname();
  const [isFullWidth, setIsFullWidth] = useState(false);
  
  useEffect(() => {
    // Define which routes should be full width
    // Remove '/drift' from fullWidthRoutes to keep Feed centered
    const fullWidthRoutes = ['/explore', '/search', '/discover', '/books'];
    const shouldBeFullWidth = fullWidthRoutes.some(route => pathname?.includes(route));
    setIsFullWidth(shouldBeFullWidth);
  }, [pathname]);

  return (
    <main className={`middle-content ${isFullWidth ? 'full-width-mode' : ''}`}>
      <div className={`middle-container ${isFullWidth ? 'full-width-container' : 'normal-container'}`}>
        {children}
      </div>
    </main>
  );
}