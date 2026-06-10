"use client";

import "./RecentActivity.css";

export default function RecentActivity() {
  const activities = [
    "Reviewed Atomic Habits",
    "Finished Deep Work",
    "Started Clean Code",
    "Followed new readers",
  ];

  return (
    <div className="recent-activity">
      <h3>Recent Activity</h3>

      <ul>
        {activities.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}