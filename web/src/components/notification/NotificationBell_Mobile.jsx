"use client";

import { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import Notification_Mobile from "./Notification_Mobile";
import "./NotificationBell_Mobile.css";

const NotificationBell_Mobile = ({ user, onNotificationClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch unread count from API
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    setIsLoading(true);
    try {
      // Replace with your actual API endpoint
      // const response = await fetch(`/api/notifications/unread?userId=${user.uid}`);
      // const data = await response.json();
      // setUnreadCount(data.count);
      
      // Mock data for testing
      setTimeout(() => {
        setUnreadCount(3);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching unread count:", error);
      setUnreadCount(0);
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Lock body scroll when notification panel opens
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
  };

  const handleClose = () => {
    setIsOpen(false);
    // Restore body scroll
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
    // Refresh unread count when closing
    fetchUnreadCount();
  };

  const handleBellClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    }
    handleOpen();
  };

  return (
    <>
      {/* Notification Bell Icon */}
      <button
        onClick={handleBellClick}
        className="notification-bell-mobile"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <FaBell size={20} />
        {!isLoading && unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
        {isLoading && (
          <span className="notification-badge loading">
            <span className="loading-dot"></span>
          </span>
        )}
      </button>

      {/* Full Screen Notification Page */}
      {isOpen && (
        <Notification_Mobile 
          user={user} 
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default NotificationBell_Mobile;