"use client";

import "./DashboardHeader.css";

export default function DashboardHeader() {
  return (
    <div className="dashboard-header">
      <div className="dashboard-header-left">
        <h1>User Dashboard</h1>
        <p>Welcome back to BookQubit</p>
      </div>

      <div className="dashboard-header-right">
        <button>New Post</button>
      </div>
    </div>
  );
}