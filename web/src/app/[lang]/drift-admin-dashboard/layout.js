"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  FaHome, 
  FaUsers, 
  FaBook, 
  FaComments, 
  FaFlag,
  FaChartLine,
  FaCog,
  FaBell,
  FaSearch,
  FaUserShield,
  FaTwitter,
  FaEnvelope,
  FaHashtag,
  FaThLarge
} from "react-icons/fa";
import { MdDashboard, MdReportProblem, MdAnalytics, MdSettings, MdVerified } from "react-icons/md";
import { useTheme } from "@/themes/useTheme";
import "./layout.css";

export default function DriftAdminLayout({ children }) {
  const params = useParams();
  const pathname = usePathname();
  const lang = params?.lang || "en";
  const { theme, themeName } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(5);

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const menuItems = [
    { id: "overview", label: "Overview", icon: MdDashboard, href: `/drift-admin-dashboard` },
    { id: "users", label: "Users", icon: FaUsers, href: `/drift-admin-dashboard/users` },
    { id: "content", label: "Content", icon: FaComments, href: `/drift-admin-dashboard/content` },
    { id: "reports", label: "Reports", icon: MdReportProblem, href: `/drift-admin-dashboard/reports`, badge: 12 },
    { id: "analytics", label: "Analytics", icon: MdAnalytics, href: `/drift-admin-dashboard/analytics` },
    { id: "moderators", label: "Moderators", icon: FaUserShield, href: `/drift-admin-dashboard/moderators` },
    { id: "settings", label: "Settings", icon: MdSettings, href: `/drift-admin-dashboard/settings` },
  ];

  return (
    <div className={`drift-admin-layout ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <FaTwitter className="logo-icon" />
            {!sidebarCollapsed && <span className="logo-text">Drift Admin</span>}
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
              {item.badge && !sidebarCollapsed && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <img 
              src="https://ui-avatars.com/api/?background=3b82f6&color=fff&name=Admin" 
              alt="Admin" 
              className="admin-avatar"
            />
            {!sidebarCollapsed && (
              <div className="admin-details">
                <div className="admin-name">Admin User</div>
                <div className="admin-role">Super Admin</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-left">
            <h1 className="page-title">
              {menuItems.find(item => item.href === pathname)?.label || "Dashboard"}
            </h1>
          </div>

          <div className="header-right">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search..." />
            </div>
            
            <button className="notification-btn">
              <FaBell />
              {notifications > 0 && (
                <span className="notification-badge">{notifications}</span>
              )}
            </button>

            <div className="user-menu">
              <img 
                src="https://ui-avatars.com/api/?background=3b82f6&color=fff&name=Admin" 
                alt="Admin" 
                className="user-avatar"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}