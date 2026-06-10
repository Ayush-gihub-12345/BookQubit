"use client";

import "./user-dashboard.css";

import { useState } from "react";
import DashboardHeader from "./components/DashboardHeader";
import DashboardSidebar from "./components/DashboardSidebar";

export default function UserDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  return (
    <div className="dashboard-page">
      <DashboardHeader />

      <div className="dashboard-layout">
        <DashboardSidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />

        <div className="dashboard-content">
          <h2>{activeMenu}</h2>
        </div>
      </div>
    </div>
  );
}