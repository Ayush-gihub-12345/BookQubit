"use client";

import React from "react";
import TrendDashboard from "@/components/trend_dashboard";

// Remove the metadata export - it cannot be used with "use client"
// export const metadata = { ... }; // ❌ Remove this

export default function TrendDashboardPage() {
  return (
    <div className="trend-dashboard-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            📊 Trend Dashboard
          </h1>
          <p className="hero-subtitle">
            Discover what's hot in the world of books! Track trending books, 
            rising authors, popular comics, and our most active readers.
          </p>
        </div>
      </div>

      {/* Trend Dashboard Component */}
      <TrendDashboard />

      {/* Footer Info Section */}
      <div className="info-section">
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">🔥</div>
            <h3>Trending Now</h3>
            <p>Real-time trending data based on user engagement, views, and interactions</p>
          </div>
          <div className="info-card">
            <div className="info-icon">📈</div>
            <h3>Growth Metrics</h3>
            <p>Track growth percentages and performance trends over time</p>
          </div>
          <div className="info-card">
            <div className="info-icon">⭐</div>
            <h3>Community Driven</h3>
            <p>Data is updated daily based on community activity and feedback</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🔄</div>
            <h3>Real-time Updates</h3>
            <p>Live updates as trends change throughout the day</p>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .trend-dashboard-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .hero-section {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
          padding: 4rem 2rem;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        .hero-subtitle {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
        }

        .info-section {
          padding: 3rem 2rem;
          background: white;
        }

        .info-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .info-card {
          text-align: center;
          padding: 1.5rem;
          border-radius: 1rem;
          background: #f9fafb;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .info-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .info-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .info-card p {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 2rem 1rem;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .info-section {
            padding: 2rem 1rem;
          }

          .info-grid {
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}