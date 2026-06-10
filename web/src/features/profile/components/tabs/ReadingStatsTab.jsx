"use client";

import { FaBookOpen, FaChartLine, FaCalendarAlt, FaStar, FaClock } from "react-icons/fa";

export default function ReadingStatsTab({ userStats, isDarkMode }) {
  const monthlyData = [12, 19, 15, 22, 28, 18, 10, 14, 20, 25, 30, 18];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const topBooks = [
    { title: "The Name of the Wind", author: "Patrick Rothfuss", rating: 5, date: "Mar 2024" },
    { title: "Project Hail Mary", author: "Andy Weir", rating: 5, date: "Feb 2024" },
    { title: "The Midnight Library", author: "Matt Haig", rating: 4, date: "Jan 2024" },
  ];

  return (
    <div className={`reading-stats-tab ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="stats-summary">
        <div className="summary-card">
          <FaBookOpen />
          <div>
            <span className="summary-value">{userStats?.booksRead || 127}</span>
            <span className="summary-label">Total Books</span>
          </div>
        </div>
        <div className="summary-card">
          <FaChartLine />
          <div>
            <span className="summary-value">{userStats?.pagesRead?.toLocaleString() || "45,234"}</span>
            <span className="summary-label">Pages Read</span>
          </div>
        </div>
        <div className="summary-card">
          <FaClock />
          <div>
            <span className="summary-value">{userStats?.hoursSpent || 342}</span>
            <span className="summary-label">Hours Spent</span>
          </div>
        </div>
        <div className="summary-card">
          <FaStar />
          <div>
            <span className="summary-value">4.7</span>
            <span className="summary-label">Avg Rating</span>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="chart-card">
        <h3>Monthly Reading Activity</h3>
        <div className="chart-bars">
          {monthlyData.map((books, idx) => (
            <div key={idx} className="chart-bar-item">
              <div className="chart-bar" style={{ height: `${(books / 30) * 100}%` }}></div>
              <div className="chart-label">{months[idx]}</div>
              <div className="chart-value">{books}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Books */}
      <div className="top-books-card">
        <h3>🏆 Top Rated Books</h3>
        <div className="top-books-list">
          {topBooks.map((book, idx) => (
            <div key={idx} className="top-book-item">
              <div className="top-book-rank">#{idx + 1}</div>
              <div className="top-book-info">
                <div className="top-book-title">{book.title}</div>
                <div className="top-book-author">by {book.author}</div>
              </div>
              <div className="top-book-rating">{'⭐'.repeat(book.rating)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}