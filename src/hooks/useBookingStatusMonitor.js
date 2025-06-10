import { useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '../api/axiosConfig';

/**
 * Hook untuk monitoring status booking secara real-time
 * @param {string|number} bookingId - ID booking yang akan dimonitor
 * @param {number} refreshInterval - Interval refresh dalam milliseconds (default: 30000 = 30 detik)
 * @param {boolean} autoRefresh - Apakah auto refresh aktif (default: true)
 */
export const useBookingStatusMonitor = (bookingId, refreshInterval = 30000, autoRefresh = true) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch booking status dari API
  const fetchBookingStatus = useCallback(async () => {
    if (!bookingId) return;

    try {
      setError(null);
      const response = await axiosInstance.get(`/customer/bookings/${bookingId}`);
      
      if (response.data.success) {
        const bookingData = response.data.data;

        // Cek apakah status berubah
        if (booking && booking.status !== bookingData.status) {
          console.log(`📊 Booking ${bookingId} status changed: ${booking.status} → ${bookingData.status}`);

          // Tampilkan notifikasi jika auto-completed
          if (bookingData.status === 'completed' && booking.status === 'confirmed') {
            showAutoCompleteNotification(bookingData);
          }
        }

        setBooking(bookingData);
        setLastUpdated(new Date());
      } else {
        setError(response.data.error || 'Failed to fetch booking status');
      }
    } catch (err) {
      console.error('Error fetching booking status:', err);
      setError(err.response?.data?.error || err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [bookingId, booking]);

  // Tampilkan notifikasi auto-complete
  const showAutoCompleteNotification = (bookingData) => {
    // Browser notification jika permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Booking Selesai - Panam Soccer Field', {
        body: `Booking Anda di ${bookingData.field_name} telah selesai. Terima kasih!`,
        icon: '/favicon.ico',
        tag: `booking-${bookingData.id}`,
        requireInteraction: true
      });
    }

    // Console log untuk debugging
    console.log('🎉 Booking auto-completed:', {
      id: bookingData.id,
      field: bookingData.field_name,
      date: bookingData.date,
      time: `${bookingData.start_time} - ${bookingData.end_time}`
    });
  };

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    return Notification.permission === 'granted';
  }, []);

  // Setup polling untuk real-time update
  useEffect(() => {
    if (!autoRefresh || !bookingId) return;

    // Initial fetch
    fetchBookingStatus();

    // Setup interval
    const interval = setInterval(fetchBookingStatus, refreshInterval);

    // Cleanup
    return () => clearInterval(interval);
  }, [bookingId, refreshInterval, autoRefresh, fetchBookingStatus]);

  // Manual refresh function
  const refresh = useCallback(() => {
    setLoading(true);
    fetchBookingStatus();
  }, [fetchBookingStatus]);

  // Check if booking is eligible for auto-completion
  const isEligibleForAutoCompletion = useCallback(() => {
    if (!booking || booking.status !== 'confirmed') return false;

    try {
      const endTime = new Date(`${booking.date}T${booking.end_time}`);
      const now = new Date();
      return now >= endTime;
    } catch (error) {
      console.error('Error checking auto-completion eligibility:', error);
      return false;
    }
  }, [booking]);

  // Get time until auto-completion
  const getTimeUntilAutoCompletion = useCallback(() => {
    if (!booking || booking.status !== 'confirmed') return null;

    try {
      const endTime = new Date(`${booking.date}T${booking.end_time}`);
      const gracePeriodEnd = new Date(endTime.getTime() + (15 * 60 * 1000)); // +15 menit grace period
      const now = new Date();
      const timeDiff = gracePeriodEnd - now;

      if (timeDiff <= 0) return 0;
      return Math.max(0, timeDiff);
    } catch (error) {
      console.error('Error calculating time until auto-completion:', error);
      return null;
    }
  }, [booking]);

  // Format time remaining
  const formatTimeRemaining = useCallback((milliseconds) => {
    if (milliseconds === null || milliseconds <= 0) return null;

    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}j ${remainingMinutes}m`;
    } else {
      return `${remainingMinutes}m`;
    }
  }, []);

  return {
    booking,
    loading,
    error,
    lastUpdated,
    refresh,
    requestNotificationPermission,
    isEligibleForAutoCompletion,
    getTimeUntilAutoCompletion,
    formatTimeRemaining,
    timeUntilAutoCompletion: getTimeUntilAutoCompletion(),
    formattedTimeRemaining: formatTimeRemaining(getTimeUntilAutoCompletion())
  };
};

/**
 * Hook untuk monitoring multiple bookings
 * @param {Array} bookingIds - Array of booking IDs
 * @param {number} refreshInterval - Interval refresh dalam milliseconds
 */
export const useMultipleBookingStatusMonitor = (bookingIds = [], refreshInterval = 60000) => {
  const [bookings, setBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMultipleBookings = useCallback(async () => {
    if (!bookingIds.length) return;

    try {
      setError(null);
      const promises = bookingIds.map(id => 
        axiosInstance.get(`/customer/bookings/${id}`).catch(err => ({ error: err, id }))
      );

      const responses = await Promise.all(promises);
      const newBookings = {};

      responses.forEach((response, index) => {
        const bookingId = bookingIds[index];
        
        if (response.error) {
          console.error(`Error fetching booking ${bookingId}:`, response.error);
          return;
        }

        if (response.data?.success) {
          newBookings[bookingId] = response.data.data;
        }
      });

      setBookings(newBookings);
    } catch (err) {
      console.error('Error fetching multiple bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [bookingIds]);

  useEffect(() => {
    fetchMultipleBookings();
    const interval = setInterval(fetchMultipleBookings, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchMultipleBookings, refreshInterval]);

  return {
    bookings,
    loading,
    error,
    refresh: fetchMultipleBookings
  };
};

export default useBookingStatusMonitor;
