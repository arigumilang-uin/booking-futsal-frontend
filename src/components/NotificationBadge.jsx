// src/components/NotificationBadge.jsx
import { useState, useEffect } from 'react';
import { getUnreadNotificationCount, subscribeToNotifications } from '../api';
import useAuth from '../hooks/useAuth';
import NotificationCenter from './NotificationCenter';

const NotificationBadge = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUnreadCount();
      
      // Subscribe to real-time notifications
      const unsubscribe = subscribeToNotifications(user.id, (newNotifications) => {
        setUnreadCount(prev => prev + newNotifications.length);
      });

      return unsubscribe;
    }
  }, [user?.id]);

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadNotificationCount();
      if (response.success) {
        setUnreadCount(response.data?.count || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
    // Reload unread count when closing
    loadUnreadCount();
  };

  return (
    <>
      <button
        onClick={handleNotificationClick}
        className="relative p-3 text-white hover:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded-xl transition-all duration-200 group"
        title="Notifikasi"
      >
        {/* Enhanced Bell Icon */}
        <svg
          className={`w-6 h-6 transition-transform duration-200 ${unreadCount > 0 ? 'animate-bounce' : 'group-hover:scale-110'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Enhanced Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Enhanced Pulse animation for new notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-400 rounded-full h-6 w-6 animate-ping opacity-60"></span>
        )}

        {/* Notification indicator dot */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={handleCloseNotifications}
      />
    </>
  );
};

export default NotificationBadge;
