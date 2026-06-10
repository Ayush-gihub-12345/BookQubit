"use client";

import MobileBottomNav from './MobileBottomNav';
import './MobileLayout.css';

export default function MobileLayout({ children }) {
  return (
    <div className="mobile-layout">
      <main className="mobile-main-content">
        <div className="mobile-content-container">
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}