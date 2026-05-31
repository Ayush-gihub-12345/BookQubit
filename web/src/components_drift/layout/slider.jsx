// src/components_drift/layout/slider.jsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  HiHome, 
  HiSearch, 
  HiTrendingUp, 
  HiBell, 
  HiMail, 
  HiBookmark, 
  HiUser, 
  HiCog,
  HiMenu,
  HiX,
  HiPlusCircle
} from "react-icons/hi";
import { 
  FaRocket, 
  FaCompass, 
  FaCrown,
  FaRegBookmark,
  FaRegBell,
  FaUserFriends,
  FaCommentDots
} from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import "./slider.css";

export default function DriftSlider() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { href: "/drift", label: "Home", icon: HiHome },
    { href: "/drift/explore", label: "Explore", icon: FaCompass },
    { href: "/drift/trending", label: "Trending", icon: HiTrendingUp },
    { href: "/drift/community", label: "Community", icon: FaUserFriends },
    { href: "/drift/notifications", label: "Notifications", icon: FaRegBell },
    { href: "/drift/messages", label: "Messages", icon: FaCommentDots },
    { href: "/drift/bookmarks", label: "Bookmarks", icon: FaRegBookmark },
    { href: "/drift/profile/bookqubit", label: "Profile", icon: HiUser },
    { href: "/drift/settings", label: "Settings", icon: IoSettingsOutline },
  ];

  const bottomNavItems = navItems.slice(0, 5);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="drift-slider-desktop">
        <div className="drift-slider-content">
          {/* Logo */}
          <div className="drift-logo">
            <FaRocket className="drift-logo-icon" />
            <div>
              <h1>Drift</h1>
              <p>by BookQubit</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="drift-nav">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`drift-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon className="drift-nav-icon" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Create Button */}
          <div className="drift-create-wrapper">
            <button className="drift-create-btn">
              <HiPlusCircle />
              <span>Create Drift</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="drift-mobile-nav">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`drift-mobile-item ${isActive ? 'active' : ''}`}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="drift-mobile-item"
        >
          {isMobileMenuOpen ? <HiX /> : <HiMenu />}
          <span>Menu</span>
        </button>
      </nav>

      {/* Mobile Menu Modal */}
      {isMobileMenuOpen && (
        <>
          <div
            className="drift-mobile-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="drift-mobile-menu">
            <div className="drift-mobile-menu-header">
              <FaRocket />
              <h3>Menu</h3>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <HiX />
              </button>
            </div>
            
            <div className="drift-mobile-menu-items">
              {navItems.slice(5).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="drift-mobile-menu-item"
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="drift-mobile-menu-footer">
              <button className="drift-mobile-create-btn">
                <HiPlusCircle />
                Create Drift
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}