"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/themes/useTheme";
import { auth } from "@/config/firebase";
import { onAuthStateChanged, updateProfile, updateEmail, updatePassword } from "firebase/auth";
import ProfileHeader from "./components/ProfileHeader";
import ProfileSidebar from "./components/ProfileSidebar";
import OverviewTab from "./components/tabs/OverviewTab";
import ReadingStatsTab from "./components/tabs/ReadingStatsTab";
import AchievementsTab from "./components/tabs/AchievementsTab";
import SettingsTab from "./components/tabs/SettingsTab";
import "./profile.css";

const ProfilePage = () => {
  const router = useRouter();
  const { theme, themeName } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';
  const isForestTheme = themeName === 'forest';

  // User stats
  const [userStats, setUserStats] = useState({
    booksRead: 127,
    pagesRead: 45234,
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
      { name: "Bookworm", icon: "📚", color: "#3b82f6", unlocked: true, description: "Read 50 books" },
      { name: "Speed Reader", icon: "⚡", color: "#f59e0b", unlocked: true, description: "Read 10 books in a month" },
      { name: "Review Master", icon: "⭐", color: "#fbbf24", unlocked: true, description: "Write 20 reviews" },
      { name: "Collector", icon: "📖", color: "#10b981", unlocked: false, description: "Add 100 books to library" },
      { name: "Community Leader", icon: "👥", color: "#ef4444", unlocked: false, description: "Get 500 followers" },
    ],
  });

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
  };

  const validateProfile = () => {
    const newErrors = {};
    if (!formData.displayName.trim()) newErrors.displayName = "Display name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    return newErrors;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = "Current password is required";
    if (!formData.newPassword) newErrors.newPassword = "New password is required";
    else if (formData.newPassword.length < 6) newErrors.newPassword = "Password must be at least 6 characters";
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
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
      setUser({ ...user, displayName: formData.displayName, email: formData.email });
    } catch (err) {
      setErrorMessage(err.message || "Failed to update profile");
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
      setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setErrorMessage(err.message || "Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push("/auth/login");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case "overview":
        return <OverviewTab userStats={userStats} isDarkMode={isDarkMode} />;
      case "reading-stats":
        return <ReadingStatsTab userStats={userStats} isDarkMode={isDarkMode} />;
      case "achievements":
      case "badges":
        return <AchievementsTab userStats={userStats} isDarkMode={isDarkMode} />;
      case "settings":
      case "profile-settings":
        return (
          <SettingsTab
            formData={formData}
            errors={errors}
            isUpdating={isUpdating}
            successMessage={successMessage}
            errorMessage={errorMessage}
            handleChange={handleChange}
            handleProfileUpdate={handleProfileUpdate}
            handlePasswordUpdate={handlePasswordUpdate}
            isDarkMode={isDarkMode}
          />
        );
      default:
        return <OverviewTab userStats={userStats} isDarkMode={isDarkMode} />;
    }
  };

  if (loading) {
    return (
      <div className={`profile-loading ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={`profile-page ${isDarkMode ? 'dark' : 'light'} ${isForestTheme ? 'forest' : ''}`}>
      <div className="profile-container">
        <ProfileHeader 
          user={user}
          userStats={userStats}
          onEditProfile={() => setActiveTab("profile-settings")}
          onShareProfile={() => navigator.clipboard.writeText(window.location.href)}
          isDarkMode={isDarkMode}
          isForestTheme={isForestTheme}
        />

        <div className="profile-grid">
          <ProfileSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            handleSignOut={handleSignOut}
          />

          <div className="profile-main">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;