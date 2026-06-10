"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { id: 'home', icon: '🏠', label: 'Home', path: '/drift' },
    { id: 'explore', icon: '🔍', label: 'Explore', path: '/drift/explore' },
    { id: 'books', icon: '📚', label: 'My Books', path: '/drift/my-books' },
    { id: 'messages', icon: '💬', label: 'Messages', path: '/drift/messages' },
    { id: 'profile', icon: '👤', label: 'Profile', path: '/drift/profile' },
  ];

  const handleNavigation = (path) => {
    router.push(path);
  };

  const isActive = (path) => {
    if (path === '/drift' && pathname === '/drift') return true;
    if (path !== '/drift' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="mobile-bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => handleNavigation(item.path)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default MobileBottomNav;