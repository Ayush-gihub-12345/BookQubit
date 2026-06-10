"use client";

import dynamic from 'next/dynamic';

// Dynamically import the leaderboard component with ssr: false (allowed in Client Component)
const BookwormLeaderboard = dynamic(
  () => import("@/features/bookworm-leaderboard/bookworm-leaderboard.jsx"),
  { 
    ssr: false,
    loading: () => (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#f59e0b',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p>Loading leaderboard...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }
);

export default function LeaderboardClient() {
  return <BookwormLeaderboard />;
}