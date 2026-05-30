"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/dashboardnavbar/DashboardNavbar";
import DashboradSlideNav from "@/components/dashboardnavbar/DashboradSlideNav";

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top navbar – passes toggleSidebar to show/hide sidebar on mobile/desktop */}
      <DashboardNavbar toggleSidebar={toggleSidebar} />

      {/* Main content row with sidebar and page content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar – receives collapsed state */}
        <DashboradSlideNav collapsed={sidebarCollapsed} />

        {/* Page content area – adjusts margin based on sidebar state */}
        <main
          className={`flex-1 overflow-auto p-6 bg-gray-50 transition-all duration-300 ${
            sidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}