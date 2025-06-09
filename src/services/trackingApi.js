import axiosInstance from '../api/axiosInstance';

// Booking History & Timeline API
export const trackingApi = {
  // Get booking history
  getBookingHistory: async (bookingId) => {
    try {
      const response = await axiosInstance.get(`/admin/bookings/${bookingId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking history:', error);
      throw error;
    }
  },

  // Get booking timeline (combined history + payments)
  getBookingTimeline: async (bookingId) => {
    try {
      const response = await axiosInstance.get(`/admin/bookings/${bookingId}/timeline`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking timeline:', error);
      throw error;
    }
  },

  // Get payment logs
  getPaymentLogs: async (paymentId) => {
    try {
      const response = await axiosInstance.get(`/admin/payments/${paymentId}/logs`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment logs:', error);
      throw error;
    }
  },

  // Get daily booking changes (analytics)
  getDailyBookingChanges: async (days = 30) => {
    try {
      const response = await axiosInstance.get(`/admin/analytics/booking-changes?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching daily booking changes:', error);
      throw error;
    }
  },

  // Get booking status flow analysis
  getBookingStatusFlow: async (days = 30) => {
    try {
      const response = await axiosInstance.get(`/admin/analytics/status-flow?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking status flow:', error);
      throw error;
    }
  }
};

export default trackingApi;
