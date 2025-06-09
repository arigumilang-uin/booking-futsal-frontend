// src/api/notificationAPI.js
import axiosInstance from './axiosInstance';

/**
 * Notification API calls
 * Enhanced notification system dengan real-time updates
 */

// ===== CUSTOMER NOTIFICATION APIs =====

export const getNotifications = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/customer/notifications', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get notifications error:', error.response?.data || error.message);
    throw error;
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    const response = await axiosInstance.put(`/customer/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error('❌ Mark notification as read error:', error.response?.data || error.message);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axiosInstance.put('/customer/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('❌ Mark all notifications as read error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteNotification = async (id) => {
  try {
    const response = await axiosInstance.delete(`/customer/notifications/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete notification error:', error.response?.data || error.message);
    throw error;
  }
};

export const getNotificationStatistics = async () => {
  try {
    const response = await axiosInstance.get('/customer/notifications/statistics');
    return response.data;
  } catch (error) {
    console.error('❌ Get notification statistics error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== ADMIN NOTIFICATION APIs =====

export const getAdminNotifications = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/notifications', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get admin notifications error:', error.response?.data || error.message);
    throw error;
  }
};

export const createSystemNotification = async (notificationData) => {
  try {
    const response = await axiosInstance.post('/admin/notifications', notificationData);
    return response.data;
  } catch (error) {
    console.error('❌ Create system notification error:', error.response?.data || error.message);
    throw error;
  }
};

export const broadcastNotification = async (broadcastData) => {
  try {
    const response = await axiosInstance.post('/admin/notifications/broadcast', broadcastData);
    return response.data;
  } catch (error) {
    console.error('❌ Broadcast notification error:', error.response?.data || error.message);
    throw error;
  }
};

export const getNotificationDeliveryStatus = async (id) => {
  try {
    const response = await axiosInstance.get(`/admin/notifications/${id}/delivery-status`);
    return response.data;
  } catch (error) {
    console.error('❌ Get notification delivery status error:', error.response?.data || error.message);
    throw error;
  }
};

export const getNotificationAnalytics = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/notifications/analytics', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get notification analytics error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== REAL-TIME NOTIFICATION HELPERS =====

export const subscribeToNotifications = (userId, onNotification, useWebSocket = true) => {
  // Primary: WebSocket implementation
  if (useWebSocket && window.WebSocket) {
    try {
      // Import WebSocket service dynamically to avoid circular dependencies
      import('../services/WebSocketService.js').then(({ default: webSocketService }) => {
        // WebSocket notifications are handled by useWebSocket hook
        console.log('🔌 Using WebSocket for real-time notifications');

        // Setup WebSocket notification listener
        const handleNotification = (notification) => {
          onNotification([notification]);
        };

        webSocketService.on('notification', handleNotification);

        // Return cleanup function
        return () => {
          webSocketService.off('notification', handleNotification);
        };
      });
    } catch (error) {
      console.error('❌ WebSocket not available, falling back to polling:', error);
    }
  }

  // Fallback: Polling implementation
  const pollInterval = 30000; // 30 detik

  const poll = async () => {
    try {
      const response = await getNotifications({ unread_only: true, limit: 10 });
      if (response.success && response.data?.notifications?.length > 0) {
        onNotification(response.data.notifications);
      }
    } catch (error) {
      console.error('❌ Notification polling error:', error);
    }
  };

  // Start polling as fallback
  const intervalId = setInterval(poll, pollInterval);

  // Return cleanup function
  return () => clearInterval(intervalId);
};

export const getUnreadNotificationCount = async () => {
  try {
    const response = await axiosInstance.get('/customer/notifications/unread-count');
    return response.data;
  } catch (error) {
    console.error('❌ Get unread notification count error:', error.response?.data || error.message);
    throw error;
  }
};
