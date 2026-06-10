"use client";

import { useState } from "react";
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaBell,
  FaShieldAlt,
  FaPalette,
  FaLanguage,
  FaGlobe,
  FaDatabase,
  FaTrash,
  FaDownload,
  FaMoon,
  FaSun,
  FaMobileAlt,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import { MdVerified, MdSecurity } from "react-icons/md";
import "./SettingsTab.css";

export default function SettingsTab({
  formData,
  errors,
  isUpdating,
  successMessage,
  errorMessage,
  handleChange,
  handleProfileUpdate,
  handlePasswordUpdate,
  isDarkMode,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSettingSection, setActiveSettingSection] = useState("profile");
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    readingReminders: false,
    newBooksAlerts: true,
    weeklyDigest: true,
  });

  const [preferences, setPreferences] = useState({
    theme: isDarkMode ? 'dark' : 'light',
    fontSize: 'medium',
    compactView: false,
    showProgress: true,
  });

  const settingSections = [
    { id: "profile", label: "Profile", icon: <FaUser /> },
    { id: "security", label: "Security", icon: <FaShieldAlt /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
    { id: "preferences", label: "Preferences", icon: <FaPalette /> },
    { id: "data", label: "Data & Privacy", icon: <FaDatabase /> },
  ];

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`settings-tab ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Settings Sidebar */}
      <div className="settings-sidebar">
        {settingSections.map((section) => (
          <button
            key={section.id}
            className={`settings-nav-btn ${activeSettingSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSettingSection(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-label">{section.label}</span>
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="settings-content">
        {/* Profile Settings */}
        {activeSettingSection === "profile" && (
          <div className="settings-section">
            <div className="section-header">
              <h2>Profile Settings</h2>
              <p>Manage your personal information</p>
            </div>

            {successMessage && <div className="alert success">{successMessage}</div>}
            {errorMessage && <div className="alert error">{errorMessage}</div>}

            {!isEditing ? (
              <div className="profile-view">
                <div className="info-group">
                  <div className="info-row">
                    <FaUser className="info-icon" />
                    <div className="info-content">
                      <label>Display Name</label>
                      <p>{formData.displayName || "Not set"}</p>
                    </div>
                  </div>
                  <div className="info-row">
                    <FaEnvelope className="info-icon" />
                    <div className="info-content">
                      <label>Email Address</label>
                      <p>{formData.email}</p>
                    </div>
                  </div>
                </div>
                <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                  <FaEdit /> Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                  {errors.displayName && <span className="error">{errors.displayName}</span>}
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={isUpdating} className="save-btn">
                    <FaSave /> {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                    <FaTimes /> Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Security Settings */}
        {activeSettingSection === "security" && (
          <div className="settings-section">
            <div className="section-header">
              <h2>Security Settings</h2>
              <p>Manage your password and security preferences</p>
            </div>

            <div className="security-card">
              <h3>Change Password</h3>
              <form onSubmit={handlePasswordUpdate} className="password-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-input">
                    <FaLock />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter current password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-input">
                    <FaLock />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                    />
                  </div>
                  {errors.newPassword && <span className="error">{errors.newPassword}</span>}
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="password-input">
                    <FaLock />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                    />
                  </div>
                  {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                </div>

                <button type="submit" disabled={isUpdating} className="update-password-btn">
                  <FaLock /> Update Password
                </button>
              </form>
            </div>

            <div className="security-card">
              <h3>Two-Factor Authentication</h3>
              <p>Add an extra layer of security to your account</p>
              <button className="enable-2fa-btn">
                <MdSecurity /> Enable 2FA
              </button>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeSettingSection === "notifications" && (
          <div className="settings-section">
            <div className="section-header">
              <h2>Notification Preferences</h2>
              <p>Choose what notifications you want to receive</p>
            </div>

            <div className="notifications-list">
              <div className="notification-item">
                <div className="notification-info">
                  <FaBell />
                  <div>
                    <h4>Email Alerts</h4>
                    <p>Receive email notifications about your account</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={notifications.emailAlerts} 
                    onChange={() => toggleNotification('emailAlerts')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-info">
                  <FaMobileAlt />
                  <div>
                    <h4>Push Notifications</h4>
                    <p>Get push notifications on your device</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={notifications.pushNotifications} 
                    onChange={() => toggleNotification('pushNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-info">
                  <FaBookOpen />
                  <div>
                    <h4>Reading Reminders</h4>
                    <p>Daily reminders to reach your reading goals</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={notifications.readingReminders} 
                    onChange={() => toggleNotification('readingReminders')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-info">
                  <FaStar />
                  <div>
                    <h4>New Books Alerts</h4>
                    <p>Get notified about new book releases</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={notifications.newBooksAlerts} 
                    onChange={() => toggleNotification('newBooksAlerts')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-info">
                  <FaEnvelope />
                  <div>
                    <h4>Weekly Digest</h4>
                    <p>Weekly summary of your reading activity</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={notifications.weeklyDigest} 
                    onChange={() => toggleNotification('weeklyDigest')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Preferences */}
        {activeSettingSection === "preferences" && (
          <div className="settings-section">
            <div className="section-header">
              <h2>Preferences</h2>
              <p>Customize your reading experience</p>
            </div>

            <div className="preferences-list">
              <div className="preference-item">
                <div className="preference-info">
                  <FaPalette />
                  <div>
                    <h4>Theme</h4>
                    <p>Choose your preferred theme</p>
                  </div>
                </div>
                <div className="theme-selector">
                  <button 
                    className={`theme-option ${preferences.theme === 'light' ? 'active' : ''}`}
                    onClick={() => updatePreference('theme', 'light')}
                  >
                    <FaSun /> Light
                  </button>
                  <button 
                    className={`theme-option ${preferences.theme === 'dark' ? 'active' : ''}`}
                    onClick={() => updatePreference('theme', 'dark')}
                  >
                    <FaMoon /> Dark
                  </button>
                </div>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <FaLanguage />
                  <div>
                    <h4>Font Size</h4>
                    <p>Adjust text size for better readability</p>
                  </div>
                </div>
                <div className="font-size-selector">
                  <button 
                    className={`size-option ${preferences.fontSize === 'small' ? 'active' : ''}`}
                    onClick={() => updatePreference('fontSize', 'small')}
                  >
                    A-
                  </button>
                  <button 
                    className={`size-option ${preferences.fontSize === 'medium' ? 'active' : ''}`}
                    onClick={() => updatePreference('fontSize', 'medium')}
                  >
                    A
                  </button>
                  <button 
                    className={`size-option ${preferences.fontSize === 'large' ? 'active' : ''}`}
                    onClick={() => updatePreference('fontSize', 'large')}
                  >
                    A+
                  </button>
                </div>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <FaEye />
                  <div>
                    <h4>Compact View</h4>
                    <p>Show more items per page</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={preferences.compactView} 
                    onChange={() => updatePreference('compactView', !preferences.compactView)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <FaChartLine />
                  <div>
                    <h4>Show Reading Progress</h4>
                    <p>Display progress indicators on books</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={preferences.showProgress} 
                    onChange={() => updatePreference('showProgress', !preferences.showProgress)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Data & Privacy */}
        {activeSettingSection === "data" && (
          <div className="settings-section">
            <div className="section-header">
              <h2>Data & Privacy</h2>
              <p>Manage your data and privacy settings</p>
            </div>

            <div className="data-options">
              <div className="data-card">
                <FaDownload />
                <div>
                  <h4>Export Your Data</h4>
                  <p>Download all your reading data, reviews, and history</p>
                  <button className="data-btn export">Export Data</button>
                </div>
              </div>

              <div className="data-card">
                <FaDatabase />
                <div>
                  <h4>Clear Reading History</h4>
                  <p>Remove all your reading history and activity</p>
                  <button className="data-btn clear">Clear History</button>
                </div>
              </div>

              <div className="data-card danger">
                <FaTrash />
                <div>
                  <h4>Delete Account</h4>
                  <p>Permanently delete your account and all data</p>
                  <button className="data-btn delete">Delete Account</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}