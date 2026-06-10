"use client";

import "./ReadingProgress.css";

export default function ReadingProgress() {
  return (
    <div className="reading-progress">
      <h3>Reading Goal</h3>

      <div className="progress-bar">
        <div className="progress-fill"></div>
      </div>

      <p>24 / 50 Books Completed</p>
    </div>
  );
}