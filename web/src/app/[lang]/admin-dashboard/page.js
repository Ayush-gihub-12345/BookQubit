"use client";

import { useState } from "react";
import { 
  FaUsers, 
  FaBook, 
  FaComments, 
  FaFlag,
  FaEye,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaChartLine,
  FaCog,
  FaBell,
  FaSearch
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    { title: "Total Users", value: "15.4K", icon: FaUsers, color: "#3b82f6", change: "+12%" },
    { title: "Total Books", value: "12.4K", icon: FaBook, color: "#10b981", change: "+8%" },
    { title: "Total Posts", value: "45.6K", icon: FaComments, color: "#f59e0b", change: "+23%" },
    { title: "Reports", value: "234", icon: FaFlag, color: "#ef4444", change: "-5%" },
  ];

  const recentUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "active", joined: "2 hours ago" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "active", joined: "5 hours ago" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "pending", joined: "1 day ago" },
    { id: 4, name: "Alice Brown", email: "alice@example.com", status: "active", joined: "2 days ago" },
  ];

  const recentReports = [
    { id: 1, type: "Spam", reportedBy: "@user123", status: "pending", date: "2 hours ago" },
    { id: 2, type: "Harassment", reportedBy: "@reader456", status: "reviewing", date: "5 hours ago" },
    { id: 3, type: "Copyright", reportedBy: "@author789", status: "resolved", date: "1 day ago" },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f3f4f6',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Top Navbar */}
      <div style={{
        background: 'white',
        padding: '16px 24px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MdDashboard style={{ color: 'white', fontSize: '24px' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>BookQubit Admin</h1>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Dashboard</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search..." 
              style={{
                padding: '8px 12px 8px 36px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '14px',
                width: '240px'
              }}
            />
            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px' }} />
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
            <FaBell style={{ fontSize: '20px', color: '#6b7280' }} />
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: 'white',
              fontSize: '10px',
              borderRadius: '50%',
              padding: '2px 4px',
              minWidth: '16px'
            }}>3</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src="https://ui-avatars.com/api/?background=3b82f6&color=fff&name=Admin" 
              alt="Admin" 
              style={{ width: '36px', height: '36px', borderRadius: '50%' }}
            />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>Admin User</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Administrator</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Sidebar */}
        <div style={{ 
          width: '260px', 
          background: 'white', 
          borderRadius: '12px', 
          padding: '16px',
          height: 'fit-content',
          position: 'sticky',
          top: '80px'
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {['overview', 'users', 'books', 'reports', 'analytics', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  width: '100%',
                  border: 'none',
                  background: activeTab === tab ? '#3b82f6' : 'transparent',
                  color: activeTab === tab ? 'white' : '#374151',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {tab === 'overview' && <MdDashboard size={18} />}
                {tab === 'users' && <FaUsers size={18} />}
                {tab === 'books' && <FaBook size={18} />}
                {tab === 'reports' && <FaFlag size={18} />}
                {tab === 'analytics' && <FaChartLine size={18} />}
                {tab === 'settings' && <FaCog size={18} />}
                <span style={{ textTransform: 'capitalize' }}>{tab}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {/* Stats Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '20px',
            marginBottom: '24px'
          }}>
            {stats.map((stat, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>{stat.title}</p>
                  <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{stat.value}</h2>
                  <p style={{ color: stat.change.startsWith('+') ? '#10b981' : '#ef4444', fontSize: '12px', marginTop: '8px' }}>
                    {stat.change} from last month
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: `${stat.color}10`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <stat.icon style={{ fontSize: '24px', color: stat.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Recent Users Table */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Recent Users</h3>
              <button style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                View All
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                  <th style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>Name</th>
                  <th style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>Email</th>
                  <th style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>Status</th>
                  <th style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>Joined</th>
                  <th style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{user.name}</td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>{user.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        background: user.status === 'active' ? '#10b98120' : '#f59e0b20',
                        color: user.status === 'active' ? '#10b981' : '#f59e0b'
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>{user.joined}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}>
                          <FaEye size={16} />
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Reports */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Recent Reports</h3>
              <button style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                View All
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentReports.map((report) => (
                <div key={report.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>{report.type}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Reported by {report.reportedBy}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      background: report.status === 'pending' ? '#ef444420' : report.status === 'reviewing' ? '#f59e0b20' : '#10b98120',
                      color: report.status === 'pending' ? '#ef4444' : report.status === 'reviewing' ? '#f59e0b' : '#10b981'
                    }}>
                      {report.status}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{report.date}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }}>
                        <FaCheckCircle size={16} />
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                        <FaTimesCircle size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}