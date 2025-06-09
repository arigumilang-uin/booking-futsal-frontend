// src/hooks/useWebSocket.js
import { useEffect, useRef, useCallback, useState } from 'react';
import webSocketService from '../services/WebSocketService';
import useAuth from './useAuth';

const useWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastActivity, setLastActivity] = useState(null);
  const listenersRef = useRef(new Map());

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id && user?.role) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        console.log('🔌 Initializing WebSocket connection for user:', user.id, user.role);
        webSocketService.connect(user.id, user.role, token);
        
        // Subscribe to notifications after connection
        setTimeout(() => {
          if (webSocketService.isConnected()) {
            webSocketService.subscribeToNotifications(user.id, user.role);
          }
        }, 1000);
      }
    }

    return () => {
      if (!isAuthenticated) {
        console.log('🔌 User logged out, disconnecting WebSocket');
        webSocketService.disconnect();
      }
    };
  }, [isAuthenticated, user?.id, user?.role]);

  // Setup event listeners
  useEffect(() => {
    const setupListeners = () => {
      // Connection status listeners
      const onConnected = (data) => {
        console.log('✅ WebSocket connected:', data);
        setConnectionStatus('connected');
        setLastActivity(new Date());
      };

      const onDisconnected = (data) => {
        console.log('🔌 WebSocket disconnected:', data);
        setConnectionStatus('disconnected');
      };

      const onError = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('error');
      };

      const onAuthRequired = (data) => {
        console.log('🔐 WebSocket auth required:', data);
        setConnectionStatus('auth_required');
      };

      // Notification listeners
      const onNotification = (notification) => {
        console.log('📨 New notification received:', notification);
        setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
        setUnreadCount(prev => prev + 1);
        setLastActivity(new Date());
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(notification.title || 'New Notification', {
            body: notification.message || notification.content,
            icon: '/favicon.ico',
            tag: notification.id
          });
        }
      };

      const onBookingUpdate = (update) => {
        console.log('📅 Booking update received:', update);
        setLastActivity(new Date());
        
        // Create notification for booking updates
        const notification = {
          id: `booking_${update.booking_id}_${Date.now()}`,
          type: 'booking_update',
          title: 'Booking Update',
          message: `Booking ${update.booking_id} status changed to ${update.status}`,
          data: update,
          timestamp: new Date().toISOString()
        };
        
        setNotifications(prev => [notification, ...prev.slice(0, 49)]);
        setUnreadCount(prev => prev + 1);
      };

      const onPaymentUpdate = (update) => {
        console.log('💰 Payment update received:', update);
        setLastActivity(new Date());
        
        // Create notification for payment updates
        const notification = {
          id: `payment_${update.payment_id}_${Date.now()}`,
          type: 'payment_update',
          title: 'Payment Update',
          message: `Payment ${update.payment_id} status changed to ${update.status}`,
          data: update,
          timestamp: new Date().toISOString()
        };
        
        setNotifications(prev => [notification, ...prev.slice(0, 49)]);
        setUnreadCount(prev => prev + 1);
      };

      const onSystemAlert = (alert) => {
        console.log('🚨 System alert received:', alert);
        setLastActivity(new Date());
        
        // Create notification for system alerts
        const notification = {
          id: `alert_${Date.now()}`,
          type: 'system_alert',
          title: alert.title || 'System Alert',
          message: alert.message,
          priority: alert.priority || 'normal',
          data: alert,
          timestamp: new Date().toISOString()
        };
        
        setNotifications(prev => [notification, ...prev.slice(0, 49)]);
        setUnreadCount(prev => prev + 1);
        
        // Show urgent alerts as browser notifications
        if (alert.priority === 'urgent' && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id,
            requireInteraction: true
          });
        }
      };

      const onUserActivity = (activity) => {
        console.log('👤 User activity received:', activity);
        setLastActivity(new Date());
      };

      // Register listeners
      webSocketService.on('connected', onConnected);
      webSocketService.on('disconnected', onDisconnected);
      webSocketService.on('error', onError);
      webSocketService.on('auth_required', onAuthRequired);
      webSocketService.on('notification', onNotification);
      webSocketService.on('booking_update', onBookingUpdate);
      webSocketService.on('payment_update', onPaymentUpdate);
      webSocketService.on('system_alert', onSystemAlert);
      webSocketService.on('user_activity', onUserActivity);

      // Store listeners for cleanup
      listenersRef.current.set('connected', onConnected);
      listenersRef.current.set('disconnected', onDisconnected);
      listenersRef.current.set('error', onError);
      listenersRef.current.set('auth_required', onAuthRequired);
      listenersRef.current.set('notification', onNotification);
      listenersRef.current.set('booking_update', onBookingUpdate);
      listenersRef.current.set('payment_update', onPaymentUpdate);
      listenersRef.current.set('system_alert', onSystemAlert);
      listenersRef.current.set('user_activity', onUserActivity);
    };

    setupListeners();

    // Cleanup listeners on unmount
    return () => {
      listenersRef.current.forEach((listener, event) => {
        webSocketService.off(event, listener);
      });
      listenersRef.current.clear();
    };
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', permission);
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((type, payload) => {
    return webSocketService.send(type, payload);
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    return webSocketService.getStatus();
  }, []);

  // Check if connected
  const isConnected = useCallback(() => {
    return webSocketService.isConnected();
  }, []);

  // Reconnect manually
  const reconnect = useCallback(() => {
    if (user?.id && user?.role) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        webSocketService.disconnect();
        setTimeout(() => {
          webSocketService.connect(user.id, user.role, token);
        }, 1000);
      }
    }
  }, [user?.id, user?.role]);

  return {
    // Connection status
    connectionStatus,
    isConnected: isConnected(),
    lastActivity,
    
    // Notifications
    notifications,
    unreadCount,
    
    // Actions
    sendMessage,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    requestNotificationPermission,
    reconnect,
    getConnectionStatus,
    
    // WebSocket service instance (for advanced usage)
    webSocketService
  };
};

export default useWebSocket;
