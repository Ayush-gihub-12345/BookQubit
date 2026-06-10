"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import layouts with no SSR
const DesktopLayout = dynamic(() => import('./desktop_layout/DesktopLayout'), {
  ssr: false,
});

const MobileLayout = dynamic(() => import('./mobile_layout/MobileLayout'), {
  ssr: false,
});

export default function ResponsiveLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }
  
  return <DesktopLayout>{children}</DesktopLayout>;
}