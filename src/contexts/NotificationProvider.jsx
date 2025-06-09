// src/contexts/NotificationProvider.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import useWebSocket from '../hooks/useWebSocket';
import { getNotifications, markNotificationAsRead } from '../api/notificationAPI';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { 
    notifications: wsNotifications, 
    unreadCount: wsUnreadCount,
    connectionStatus,
    isConnected,
    markNotificationAsRead: markWsNotificationAsRead,
    markAllNotificationsAsRead: markAllWsNotificationsAsRead,
    clearNotifications: clearWsNotifications
  } = useWebSocket();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  // Fallback polling when WebSocket is not connected
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await getNotifications({ limit: 50 });
        if (response.success) {
          setNotifications(response.data?.notifications || []);
          setUnreadCount(response.data?.unread_count || 0);
          setLastFetch(new Date());
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Fallback polling when WebSocket is not connected
    let pollInterval;
    if (!isConnected) {
      console.log('📡 WebSocket not connected, using polling fallback');
      pollInterval = setInterval(fetchNotifications, 30000); // 30 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isAuthenticated, user?.id, isConnected]);

  // Merge WebSocket notifications with fetched notifications
  useEffect(() => {
    if (isConnected && wsNotifications.length > 0) {
      console.log('🔌 Using WebSocket notifications');
      
      // Merge and deduplicate notifications
      setNotifications(prevNotifications => {
        const existingIds = new Set(prevNotifications.map(n => n.id));
        const newNotifications = wsNotifications.filter(n => !existingIds.has(n.id));
        
        return [...newNotifications, ...prevNotifications].slice(0, 50); // Keep last 50
      });
      
      setUnreadCount(wsUnreadCount);
    }
  }, [isConnected, wsNotifications, wsUnreadCount]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      if (isConnected) {
        // Use WebSocket method
        markWsNotificationAsRead(notificationId);
      } else {
        // Use API method
        await markNotificationAsRead(notificationId);
        
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (isConnected) {
        // Use WebSocket method
        markAllWsNotificationsAsRead();
      } else {
        // Use API method - mark all unread notifications
        const unreadNotifications = notifications.filter(n => !n.read);
        await Promise.all(
          unreadNotifications.map(n => markNotificationAsRead(n.id))
        );
        
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    if (isConnected) {
      clearWsNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Refresh notifications
  const refreshNotifications = async () => {
    if (!isAuthenticated || !user?.id) return;

    try {
      setLoading(true);
      const response = await getNotifications({ limit: 50 });
      if (response.success) {
        setNotifications(response.data?.notifications || []);
        setUnreadCount(response.data?.unread_count || 0);
        setLastFetch(new Date());
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get notification by ID
  const getNotificationById = (id) => {
    return notifications.find(n => n.id === id);
  };

  // Get notifications by type
  const getNotificationsByType = (type) => {
    return notifications.filter(n => n.type === type);
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.read);
  };

  // Show browser notification
  const showBrowserNotification = (notification) => {
    if (Notification.permission === 'granted') {
      new Notification(notification.title || 'New Notification', {
        body: notification.message || notification.content,
        icon: '/favicon.ico',
        tag: notification.id,
        data: notification
      });
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  const value = {
    // Data
    notifications,
    unreadCount,
    loading,
    lastFetch,
    
    // WebSocket status
    connectionStatus,
    isConnected,
    
    // Actions
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    refreshNotifications,
    
    // Getters
    getNotificationById,
    getNotificationsByType,
    getUnreadNotifications,
    
    // Browser notifications
    showBrowserNotification,
    requestNotificationPermission,
    
    // Stats
    stats: {
      total: notifications.length,
      unread: unreadCount,
      read: notifications.length - unreadCount,
      lastFetch,
      connectionStatus
    }
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
