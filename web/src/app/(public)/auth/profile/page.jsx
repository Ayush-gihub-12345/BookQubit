"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { auth } from "@/config/firebase";
import { onAuthStateChanged, updateProfile, updateEmail, updatePassword } from "firebase/auth";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
  FaBookOpen,
  FaHeart,
  FaBookmark,
  FaStar,
  FaClock,
  FaChartLine,
  FaCrown,
  FaFire,
  FaMedal,
  FaTrophy,
} from "react-icons/fa";

const ProfilePage = () => {
  const router = useRouter();
  const { theme, themeName } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // User stats
  const [userStats, setUserStats] = useState({
    booksRead: 47,
    pagesRead: 15234,
    readingStreak: 12,
    hoursSpent: 342,
    favoriteGenre: "Science Fiction",
    achievements: 8,
    reviews: 23,
    followers: 156,
    following: 89,
    readingGoal: 52,
    completedGoals: 3,
    badges: [
      { name: "Bookworm", icon: <FaBookOpen />, color: "text-blue-500", unlocked: true },
      { name: "Speed Reader", icon: <FaFire />, color: "text-orange-500", unlocked: true },
      { name: "Review Master", icon: <FaStar />, color: "text-amber-500", unlocked: true },
      { name: "Collector", icon: <FaBookmark />, color: "text-emerald-500", unlocked: false },
      { name: "Community Leader", icon: <FaHeart />, color: "text-rose-500", unlocked: false },
    ],
  });

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setFormData({
          ...formData,
          displayName: currentUser.displayName || "",
          email: currentUser.email || "",
        });
      } else {
        router.push("/auth/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (errorMessage) setErrorMessage("");
    if (successMessage) setSuccessMessage("");
  };

  const validateProfile = () => {
    const newErrors = {};
    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    return newErrors;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const newErrors = validateProfile();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsUpdating(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (user && formData.displayName !== user.displayName) {
        await updateProfile(user, { displayName: formData.displayName });
      }
      if (formData.email !== user.email) {
        await updateEmail(user, formData.email);
      }
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      // Refresh user data
      setUser({ ...user, displayName: formData.displayName, email: formData.email });
    } catch (err) {
      console.error("Update error:", err);
      if (err.code === "auth/requires-recent-login") {
        setErrorMessage("Please re-authenticate to update this information.");
      } else {
        setErrorMessage(err.message || "Failed to update profile");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const newErrors = validatePassword();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsUpdating(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updatePassword(user, formData.newPassword);
      setSuccessMessage("Password updated successfully!");
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Password update error:", err);
      if (err.code === "auth/requires-recent-login") {
        setErrorMessage("Please re-authenticate to change your password.");
      } else {
        setErrorMessage(err.message || "Failed to update password");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const readingGoalProgress = (userStats.booksRead / userStats.readingGoal) * 100;

  if (loading) {
    return (
      <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600 mx-auto"></div>
          <p className={`mt-4 ${theme.textColors?.secondary || 'text-gray-600'}`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-gray-50')} min-h-screen py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')} mb-2`}>
            My Profile
          </h1>
          <p className={`${theme.textColors?.secondary || 'text-gray-600'}`}>
            Manage your account and track your reading journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6 sticky top-24`}>
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-sky-500"
                    />
                  ) : (
                    <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl bg-gradient-to-br from-sky-500 to-purple-500 text-white`}>
                      {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 p-1.5 bg-sky-600 text-white rounded-full hover:bg-sky-700 transition">
                    <FaCamera size={12} />
                  </button>
                </div>
                <h2 className={`text-xl font-bold mt-3 ${theme.textColors?.primary || (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                  {user?.displayName || "User"}
                </h2>
                <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-500'}`}>{user?.email}</p>
                <p className={`text-xs mt-1 ${theme.textColors?.secondary || 'text-gray-400'}`}>Member since 2024</p>
              </div>

              {/* Navigation Tabs */}
              <div className="space-y-2">
                {[
                  { id: "overview", label: "Overview", icon: <FaUser /> },
                  { id: "reading", label: "Reading Stats", icon: <FaBookOpen /> },
                  { id: "achievements", label: "Achievements", icon: <FaTrophy /> },
                  { id: "settings", label: "Settings", icon: <FaEdit /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? `${theme.buttonColors?.primaryButton?.background || 'bg-sky-600'} text-white`
                        : `${theme.textColors?.secondary || 'text-gray-600'} hover:bg-gray-100 dark:hover:bg-gray-700`
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Books Read", value: userStats.booksRead, icon: <FaBookOpen />, color: "text-blue-500" },
                    { label: "Reading Streak", value: `${userStats.readingStreak} days`, icon: <FaFire />, color: "text-orange-500" },
                    { label: "Hours Spent", value: userStats.hoursSpent, icon: <FaClock />, color: "text-emerald-500" },
                    { label: "Achievements", value: userStats.achievements, icon: <FaMedal />, color: "text-amber-500" },
                  ].map((stat, idx) => (
                    <div key={idx} className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-4 text-center`}>
                      <div className={`text-2xl mb-2 ${stat.color}`}>{stat.icon}</div>
                      <div className={`text-2xl font-bold ${theme.textColors?.primary || 'text-gray-900'}`}>{stat.value}</div>
                      <div className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Reading Goal Progress */}
                <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-bold ${theme.textColors?.primary || 'text-gray-900'}`}>Reading Goal 2024</h3>
                    <span className={`text-sm ${theme.textColors?.highlight || 'text-sky-600'}`}>
                      {userStats.booksRead}/{userStats.readingGoal} books
                    </span>
                  </div>
                  <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3`}>
                    <div
                      className="bg-gradient-to-r from-sky-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(readingGoalProgress, 100)}%` }}
                    ></div>
                  </div>
                  <p className={`text-sm ${theme.textColors?.secondary || 'text-gray-500'} mt-3`}>
                    You're {Math.round(readingGoalProgress)}% of the way to your yearly goal!
                  </p>
                </div>

                {/* Recent Activity */}
                <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6`}>
                  <h3 className={`text-lg font-bold mb-4 ${theme.textColors?.primary || 'text-gray-900'}`}>Recent Activity</h3>
                  <div className="space-y-4">
                    {[
                      { action: "Finished reading", book: "The Midnight Library", date: "2 days ago", icon: <FaBookOpen /> },
                      { action: "Wrote a review", book: "Atomic Habits", date: "5 days ago", icon: <FaStar /> },
                      { action: "Added to wishlist", book: "Project Hail Mary", date: "1 week ago", icon: <FaHeart /> },
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${theme.textColors?.primary || 'text-gray-900'}`}>
                            {activity.action} <span className="font-semibold">"{activity.book}"</span>
                          </p>
                          <p className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reading Stats Tab */}
            {activeTab === "reading" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Favorite Genres */}
                  <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6`}>
                    <h3 className={`text-lg font-bold mb-4 ${theme.textColors?.primary || 'text-gray-900'}`}>Favorite Genres</h3>
                    <div className="space-y-3">
                      {[
                        { name: "Science Fiction", percentage: 65, color: "bg-purple-500" },
                        { name: "Fantasy", percentage: 45, color: "bg-emerald-500" },
                        { name: "Mystery", percentage: 30, color: "bg-amber-500" },
                      ].map((genre, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className={theme.textColors?.secondary || 'text-gray-600'}>{genre.name}</span>
                            <span className={theme.textColors?.secondary || 'text-gray-600'}>{genre.percentage}%</span>
                          </div>
                          <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                            <div className={`${genre.color} h-2 rounded-full`} style={{ width: `${genre.percentage}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reading Stats */}
                  <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6`}>
                    <h3 className={`text-lg font-bold mb-4 ${theme.textColors?.primary || 'text-gray-900'}`}>Reading Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className={theme.textColors?.secondary || 'text-gray-600'}>Total Pages Read</span>
                        <span className={`font-semibold ${theme.textColors?.primary || 'text-gray-900'}`}>{userStats.pagesRead.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className={theme.textColors?.secondary || 'text-gray-600'}>Average Rating</span>
                        <span className={`font-semibold ${theme.textColors?.primary || 'text-gray-900'}`}>4.7/5</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className={theme.textColors?.secondary || 'text-gray-600'}>Reviews Written</span>
                        <span className={`font-semibold ${theme.textColors?.primary || 'text-gray-900'}`}>{userStats.reviews}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className={theme.textColors?.secondary || 'text-gray-600'}>Favorite Book</span>
                        <span className={`font-semibold ${theme.textColors?.primary || 'text-gray-900'}`}>Dune</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Reading Chart */}
                <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6`}>
                  <h3 className={`text-lg font-bold mb-4 ${theme.textColors?.primary || 'text-gray-900'}`}>Monthly Reading Activity</h3>
                  <div className="flex items-end justify-between h-48 gap-2">
                    {[12, 19, 15, 22, 28, 18, 10].map((books, idx) => (
                      <div key={idx} className="flex-1 text-center">
                        <div
                          className="bg-gradient-to-t from-sky-500 to-blue-500 rounded-t-lg transition-all hover:opacity-80"
                          style={{ height: `${(books / 30) * 100}%` }}
                        ></div>
                        <div className={`text-xs mt-2 ${theme.textColors?.secondary || 'text-gray-500'}`}>
                          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"][idx]}
                        </div>
                        <div className={`text-xs font-semibold ${theme.textColors?.primary || 'text-gray-900'}`}>{books}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === "achievements" && (
              <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6`}>
                <h3 className={`text-lg font-bold mb-4 ${theme.textColors?.primary || 'text-gray-900'}`}>Badges & Achievements</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {userStats.badges.map((badge, idx) => (
                    <div
                      key={idx}
                      className={`text-center p-4 rounded-lg transition-all ${badge.unlocked ? 'opacity-100' : 'opacity-40 grayscale'} ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                      <div className={`text-3xl mb-2 ${badge.color}`}>{badge.icon}</div>
                      <div className={`text-sm font-medium ${theme.textColors?.primary || 'text-gray-900'}`}>{badge.name}</div>
                      {!badge.unlocked && <div className={`text-xs mt-1 ${theme.textColors?.secondary || 'text-gray-500'}`}>Locked</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Profile Settings */}
                <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-bold ${theme.textColors?.primary || 'text-gray-900'}`}>Profile Settings</h3>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
                      >
                        <FaEdit /> Edit Profile
                      </button>
                    )}
                  </div>

                  {successMessage && (
                    <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
                      {successMessage}
                    </div>
                  )}
                  {errorMessage && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                      {errorMessage}
                    </div>
                  )}

                  {isEditing ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || 'text-gray-900'}`}>
                          Display Name
                        </label>
                        <input
                          type="text"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.displayName ? 'border-red-500' : theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-white')}`}
                        />
                        {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || 'text-gray-900'}`}>
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.email ? 'border-red-500' : theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-white')}`}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-50 flex items-center gap-2"
                        >
                          <FaSave /> {isUpdating ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                        >
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 py-2 border-b border-gray-200 dark:border-gray-700">
                        <FaUser className={theme.textColors?.secondary || 'text-gray-500'} />
                        <div>
                          <p className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>Display Name</p>
                          <p className={`font-medium ${theme.textColors?.primary || 'text-gray-900'}`}>{formData.displayName || "Not set"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2">
                        <FaEnvelope className={theme.textColors?.secondary || 'text-gray-500'} />
                        <div>
                          <p className={`text-xs ${theme.textColors?.secondary || 'text-gray-500'}`}>Email</p>
                          <p className={`font-medium ${theme.textColors?.primary || 'text-gray-900'}`}>{formData.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Change Password */}
                <div className={`${theme.background?.section || (isDarkMode ? 'bg-gray-800' : 'bg-white')} rounded-xl p-6`}>
                  <h3 className={`text-lg font-bold mb-4 ${theme.textColors?.primary || 'text-gray-900'}`}>Change Password</h3>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || 'text-gray-900'}`}>
                        Current Password
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.currentPassword ? 'border-red-500' : theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-white')}`}
                          placeholder="Enter current password"
                        />
                      </div>
                      {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || 'text-gray-900'}`}>
                        New Password
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.newPassword ? 'border-red-500' : theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-white')}`}
                          placeholder="Enter new password"
                        />
                      </div>
                      {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme.textColors?.primary || 'text-gray-900'}`}>
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.confirmPassword ? 'border-red-500' : theme.border?.default || 'border-gray-300 dark:border-gray-600'} ${theme.background?.section || (isDarkMode ? 'bg-gray-900' : 'bg-white')}`}
                          placeholder="Confirm new password"
                        />
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition disabled:opacity-50"
                    >
                      {isUpdating ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;