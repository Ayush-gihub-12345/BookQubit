"use client";

import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';
import MiddleContent from './MiddleContent';
import './DesktopLayout.css';

export default function DesktopLayout({ children }) {
  return (
    <div className="desktop-layout">
      <SidebarLeft />
      <MiddleContent>
        {children}
      </MiddleContent>
      <SidebarRight />
    </div>
  );
}