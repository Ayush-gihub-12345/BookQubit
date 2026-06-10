"use client";

import './SidebarRight.css';

const SidebarRight = () => {
  return (
    <aside className="sidebar-right">
      <div className="search-box">
        <input type="text" placeholder="🔍 Search BookQubit..." />
      </div>
      
      <div className="trending-section">
        <h3>📈 Trending Topics</h3>
        <ul>
          <li>#BookTok</li>
          <li>#FantasyBooks</li>
          <li>#ReadingChallenge2026</li>
          <li>#BookRecommendations</li>
        </ul>
      </div>
      
      <div className="suggested-friends">
        <h3>👥 Suggested to follow</h3>
        <div className="friend-list">
          <div className="friend-item">
            <img src="/avatar1.png" alt="Friend" />
            <div>
              <strong>Jane AustenFan</strong>
              <small>2k followers</small>
            </div>
            <button>Follow</button>
          </div>
          <div className="friend-item">
            <img src="/avatar2.png" alt="Friend" />
            <div>
              <strong>SciFiReader</strong>
              <small>1.5k followers</small>
            </div>
            <button>Follow</button>
          </div>
        </div>
      </div>
      
      <div className="reading-challenge">
        <h3>📚 2026 Challenge</h3>
        <div className="progress">
          <div className="progress-bar" style={{ width: '45%' }}></div>
        </div>
        <p>12/52 books read</p>
      </div>
    </aside>
  );
};

export default SidebarRight;