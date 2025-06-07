// src/components/NotificationCenter.jsx
import { useState, useEffect } from 'react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
  subscribeToNotifications
} from '../api';
import useAuth from '../hooks/useAuth';

const NotificationCenter = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [isOpen, filter]);

  useEffect(() => {
    if (user?.id) {
      // Subscribe to real-time notifications
      const unsubscribe = subscribeToNotifications(user.id, (newNotifications) => {
        setNotifications(prev => [...newNotifications, ...prev]);
        setUnreadCount(prev => prev + newNotifications.length);
      });

      return unsubscribe;
    }
  }, [user?.id]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'unread') params.unread_only = true;
      if (filter === 'read') params.read_only = true;

      const response = await getNotifications(params);
      if (response.success) {
        setNotifications(response.data?.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      // Update unread count if deleted notification was unread
      const deletedNotif = notifications.find(n => n.id === notificationId);
      if (deletedNotif && !deletedNotif.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'payment':
        return '💳';
      case 'system':
        return '⚙️';
      case 'promotion':
        return '🎉';
      default:
        return '📢';
    }
  };

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-end backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl overflow-hidden border-l-4 border-purple-500">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔔</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Notification Center</h2>
                <p className="text-purple-100 text-sm">Pusat notifikasi sistem</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Enhanced Stats */}
          <div className="mt-4 flex items-center space-x-4">
            {unreadCount > 0 && (
              <div className="bg-red-500/20 border border-red-400/30 px-3 py-2 rounded-xl backdrop-blur-sm">
                <span className="text-red-100 text-sm font-medium">
                  {unreadCount} notifikasi belum dibaca
                </span>
              </div>
            )}
            <div className="bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm">
              <span className="text-purple-100 text-sm">
                Total: {notifications.length}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Filter */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-wrap gap-3 mb-4">
            {['all', 'unread', 'read'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filter === filterType
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-purple-300'
                }`}
              >
                {filterType === 'all' ? '📋 Semua' :
                 filterType === 'unread' ? '🔴 Belum Dibaca' : '✅ Sudah Dibaca'}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-800 font-medium bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors duration-200"
            >
              <span>✅</span>
              <span>Tandai semua sebagai dibaca ({unreadCount})</span>
            </button>
          )}
        </div>

        {/* Enhanced Notifications List */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Memuat notifikasi...</p>
              <p className="text-sm text-gray-500">Mohon tunggu sebentar</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📭</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada notifikasi</h3>
              <p className="text-sm">Semua notifikasi akan muncul di sini</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-white transition-colors duration-200 ${
                    !notification.read_at
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-l-purple-500'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      !notification.read_at
                        ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className="text-xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`font-semibold truncate ${
                          !notification.read_at ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.read_at && (
                          <span className="ml-2 w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-500 font-medium">
                          {formatNotificationTime(notification.created_at)}
                        </p>
                        <div className="flex items-center space-x-2">
                          {!notification.read_at && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-purple-600 hover:text-purple-800 bg-purple-100 hover:bg-purple-200 px-3 py-1 rounded-full font-medium transition-colors duration-200"
                            >
                              ✅ Tandai dibaca
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-xs text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full font-medium transition-colors duration-200"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
