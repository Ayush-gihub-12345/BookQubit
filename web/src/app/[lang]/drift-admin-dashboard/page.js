"use client";

import { useState, useEffect } from "react";
import { 
  FaUsers, 
  FaBook, 
  FaComments, 
  FaFlag,
  FaThumbsUp,
  FaShare,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaRocket,
  FaUserPlus
} from "react-icons/fa";
import { MdVerified, MdTrendingUp, MdReportProblem } from "react-icons/md";
import "./page.css";

export default function DriftAdminOverview() {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats([
        { title: "Total Users", value: "45,234", icon: FaUsers, color: "#3b82f6", change: "+12.5%", period: "this month" },
        { title: "Total Posts", value: "123,456", icon: FaComments, color: "#10b981", change: "+23.1%", period: "this month" },
        { title: "Daily Active Users", value: "12,345", icon: FaEye, color: "#f59e0b", change: "+8.2%", period: "today" },
        { title: "Reports", value: "234", icon: FaFlag, color: "#ef4444", change: "-5.3%", period: "this week" },
        { title: "Verified Users", value: "8,234", icon: MdVerified, color: "#8b5cf6", change: "+15.8%", period: "this month" },
      ]);

      setRecentActivity([
        { id: 1, user: "@sarahj", action: "posted a new book review", target: "The Midnight Library", type: "post", time: "2 minutes ago", status: "normal" },
        { id: 2, user: "@mikereads", action: "reported inappropriate content", target: "User @spammer123", type: "report", time: "15 minutes ago", status: "urgent" },
        { id: 3, user: "@booklover", action: "joined Drift", target: "", type: "user", time: "1 hour ago", status: "normal" },
        { id: 4, user: "@fantasyclub", action: "reached 10K followers", target: "", type: "milestone", time: "3 hours ago", status: "celebrate" },
        { id: 5, user: "@authorJane", action: "posted a thread", target: "Writing Tips for Beginners", type: "post", time: "5 hours ago", status: "trending" },
      ]);

      setTrendingTopics([
        { topic: "#BookRecommendations", posts: 12500, growth: "+2.1K", category: "books" },
        { topic: "#AmWriting", posts: 8200, growth: "+1.2K", category: "writing" },
        { topic: "#FantasyBooks", posts: 6700, growth: "+890", category: "books" },
        { topic: "#DriftCommunity", posts: 5400, growth: "+567", category: "community" },
        { topic: "#AuthorTips", posts: 4100, growth: "+432", category: "authors" },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'urgent': return '#ef4444';
      case 'celebrate': return '#10b981';
      case 'trending': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const getStatusIcon = (type) => {
    switch(type) {
      case 'post': return <FaComments />;
      case 'report': return <FaExclamationTriangle />;
      case 'user': return <FaUserPlus />;
      case 'milestone': return <FaRocket />;
      default: return <FaComments />;
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="drift-admin-dashboard">
      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                  <IconComponent />
                </div>
                <div className="stat-change" style={{ color: stat.change.startsWith('+') ? '#10b981' : '#ef4444' }}>
                  {stat.change}
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
              <div className="stat-period">{stat.period}</div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-two-columns">
        {/* Left Column - Recent Activity */}
        <div className="activity-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <button className="view-all-btn">View All</button>
          </div>
          
          <div className="activity-timeline">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon" style={{ background: `${getStatusColor(activity.status)}15`, color: getStatusColor(activity.status) }}>
                  {getStatusIcon(activity.type)}
                </div>
                <div className="activity-content">
                  <div className="activity-text">
                    <span className="activity-user">{activity.user}</span>
                    <span className="activity-action">{activity.action}</span>
                    {activity.target && (
                      <span className="activity-target">"{activity.target}"</span>
                    )}
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
                {activity.status === 'urgent' && (
                  <div className="activity-actions">
                    <button className="resolve-btn">
                      <FaCheckCircle /> Resolve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Trending Topics */}
        <div className="trending-section">
          <div className="section-header">
            <h2>Trending Topics</h2>
            <MdTrendingUp className="trending-icon" />
          </div>

          <div className="trending-list">
            {trendingTopics.map((topic, index) => (
              <div key={index} className="trending-item">
                <div className="trending-rank">#{index + 1}</div>
                <div className="trending-info">
                  <div className="trending-topic">{topic.topic}</div>
                  <div className="trending-stats">
                    <span>{topic.posts.toLocaleString()} posts</span>
                    <span className="trending-growth">{topic.growth}</span>
                  </div>
                </div>
                <div className="trending-category">{topic.category}</div>
              </div>
            ))}
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn">
                <FaUserPlus /> Add Moderator
              </button>
              <button className="action-btn">
                <MdReportProblem /> Review Reports
              </button>
              <button className="action-btn">
                <FaThumbsUp /> Announcement
              </button>
              <button className="action-btn">
                <FaShare /> Share Update
              </button>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="platform-stats">
            <h3>Platform Health</h3>
            <div className="health-metrics">
              <div className="metric">
                <div className="metric-label">Server Status</div>
                <div className="metric-value status-online">● Online</div>
              </div>
              <div className="metric">
                <div className="metric-label">API Response</div>
                <div className="metric-value">124ms</div>
              </div>
              <div className="metric">
                <div className="metric-label">Uptime</div>
                <div className="metric-value">99.97%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Moderation Queue */}
      <div className="moderation-section">
        <div className="section-header">
          <h2>Moderation Queue</h2>
          <span className="queue-count">3 pending</span>
        </div>
        
        <div className="moderation-table">
          <table>
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Type</th>
                <th>Reported By</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#1001</td>
                <td><span className="badge spam">Spam</span></td>
                <td>@user123</td>
                <td>Unsolicited promotional content</td>
                <td><span className="status pending">Pending</span></td>
                <td>
                  <div className="table-actions">
                    <button className="approve-btn">✓ Approve</button>
                    <button className="reject-btn">✗ Reject</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>#1002</td>
                <td><span className="badge harassment">Harassment</span></td>
                <td>@reader456</td>
                <td>Targeted harassment</td>
                <td><span className="status reviewing">Reviewing</span></td>
                <td>
                  <div className="table-actions">
                    <button className="approve-btn">✓ Approve</button>
                    <button className="reject-btn">✗ Reject</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>#1003</td>
                <td><span className="badge copyright">Copyright</span></td>
                <td>@publisher789</td>
                <td>Unauthorized content sharing</td>
                <td><span className="status urgent">Urgent</span></td>
                <td>
                  <div className="table-actions">
                    <button className="approve-btn">✓ Approve</button>
                    <button className="reject-btn">✗ Reject</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}