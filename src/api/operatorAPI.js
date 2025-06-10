// src/api/operatorAPI.js
/**
 * API functions untuk Operator Lapangan
 * Menggunakan endpoint /api/staff/operator/*
 */

import axiosInstance from './axiosInstance';

// ===== DASHBOARD APIs =====

export const getOperatorDashboard = async () => {
  try {
    const response = await axiosInstance.get('/staff/operator/dashboard');
    return {
      success: true,
      data: response.data.data,
      _metadata: {
        endpoint_used: '/staff/operator/dashboard',
        timestamp: new Date().toISOString(),
        is_role_specific: true
      }
    };
  } catch (error) {
    console.error('❌ Get operator dashboard error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      code: error.response?.data?.code || 'OPERATOR_DASHBOARD_FAILED'
    };
  }
};

export const getOperatorStatistics = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/staff/operator/statistics', { params });
    return {
      success: true,
      data: response.data.data,
      _metadata: {
        endpoint_used: '/staff/operator/statistics',
        params,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Get operator statistics error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      code: error.response?.data?.code || 'OPERATOR_STATISTICS_FAILED'
    };
  }
};

// ===== FIELD MANAGEMENT APIs =====

export const getAssignedFields = async () => {
  try {
    const response = await axiosInstance.get('/staff/operator/fields');

    // Ensure data is always an array
    const fieldsData = response.data.data;
    const safeData = Array.isArray(fieldsData) ? fieldsData : [];

    console.log('🏟️ Operator Fields API Response:', {
      originalData: fieldsData,
      safeData: safeData.length,
      isArray: Array.isArray(fieldsData)
    });

    return {
      success: true,
      data: safeData,
      _metadata: {
        endpoint_used: '/staff/operator/fields',
        timestamp: new Date().toISOString(),
        is_assigned_only: true,
        data_count: safeData.length
      }
    };
  } catch (error) {
    console.error('❌ Get assigned fields error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      code: error.response?.data?.code || 'ASSIGNED_FIELDS_FAILED',
      data: [] // Return empty array on error
    };
  }
};

export const updateFieldStatus = async (fieldId, statusData) => {
  try {
    const response = await axiosInstance.put(`/staff/operator/fields/${fieldId}/status`, statusData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
      _metadata: {
        endpoint_used: `/staff/operator/fields/${fieldId}/status`,
        action: 'update_field_status',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Update field status error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      code: error.response?.data?.code || 'UPDATE_FIELD_STATUS_FAILED'
    };
  }
};

export const getFieldBookings = async (fieldId, params = {}) => {
  try {
    const response = await axiosInstance.get(`/staff/operator/fields/${fieldId}/bookings`, { params });
    return {
      success: true,
      data: response.data.data,
      _metadata: {
        endpoint_used: `/staff/operator/fields/${fieldId}/bookings`,
        field_id: fieldId,
        params,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Get field bookings error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      code: error.response?.data?.code || 'FIELD_BOOKINGS_FAILED'
    };
  }
};

// ===== BOOKING MANAGEMENT APIs =====

export const getAllBookingsForOperator = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/staff/operator/bookings', { params });

    // Handle different response structures
    const responseData = response.data.data;
    let bookingsArray = [];
    let assignedFields = [];

    // Check if response is object with bookings property or direct array
    if (responseData && typeof responseData === 'object') {
      if (Array.isArray(responseData)) {
        // Direct array of bookings
        bookingsArray = responseData;
      } else if (responseData.bookings && Array.isArray(responseData.bookings)) {
        // Object with bookings property
        bookingsArray = responseData.bookings;
        assignedFields = responseData.assigned_fields || [];
      }
    }

    console.log('📅 Operator Bookings API Response:', {
      originalData: responseData,
      bookingsArray: bookingsArray.length,
      assignedFields: assignedFields.length,
      isResponseArray: Array.isArray(responseData),
      hasBookingsProperty: responseData && responseData.bookings ? true : false
    });

    return {
      success: true,
      data: bookingsArray,
      assigned_fields: assignedFields,
      pagination: response.data.pagination,
      _metadata: {
        endpoint_used: '/staff/operator/bookings',
        params,
        timestamp: new Date().toISOString(),
        is_assigned_fields_only: true,
        data_count: bookingsArray.length,
        assigned_fields_count: assignedFields.length
      }
    };
  } catch (error) {
    console.error('❌ Get operator bookings error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      code: error.response?.data?.code || 'OPERATOR_BOOKINGS_FAILED',
      data: [], // Return empty array on error
      assigned_fields: []
    };
  }
};

export const getBookingDetailForOperator = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/staff/operator/bookings/${bookingId}`);
    return {
      success: true,
      data: response.data.data,
      _metadata: {
        endpoint_used: `/staff/operator/bookings/${bookingId}`,
        booking_id: bookingId,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Get booking detail error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      code: error.response?.data?.code || 'BOOKING_DETAIL_FAILED'
    };
  }
};

export const confirmBooking = async (bookingId, notes = '') => {
  try {
    const response = await axiosInstance.put(`/staff/operator/bookings/${bookingId}/confirm`, { notes });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
      _metadata: {
        endpoint_used: `/staff/operator/bookings/${bookingId}/confirm`,
        action: 'confirm_booking',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Confirm booking error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      code: error.response?.data?.code || 'CONFIRM_BOOKING_FAILED',
      details: error.response?.data?.details
    };
  }
};

export const completeBooking = async (bookingId, completionData) => {
  try {
    const response = await axiosInstance.put(`/staff/operator/bookings/${bookingId}/complete`, completionData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
      _metadata: {
        endpoint_used: `/staff/operator/bookings/${bookingId}/complete`,
        action: 'complete_booking',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Complete booking error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      code: error.response?.data?.code || 'COMPLETE_BOOKING_FAILED'
    };
  }
};

// ===== SCHEDULE APIs =====

export const getTodaySchedule = async () => {
  try {
    const response = await axiosInstance.get('/staff/operator/schedule/today');
    return {
      success: true,
      data: response.data.data,
      _metadata: {
        endpoint_used: '/staff/operator/schedule/today',
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Get today schedule error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      code: error.response?.data?.code || 'TODAY_SCHEDULE_FAILED'
    };
  }
};

export const getScheduleByDate = async (date) => {
  try {
    const response = await axiosInstance.get(`/staff/operator/schedule/${date}`);
    return {
      success: true,
      data: response.data.data,
      _metadata: {
        endpoint_used: `/staff/operator/schedule/${date}`,
        date,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Get schedule by date error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      code: error.response?.data?.code || 'SCHEDULE_BY_DATE_FAILED'
    };
  }
};

// ===== UTILITY FUNCTIONS =====

export const getBookingActions = async () => {
  try {
    const response = await axiosInstance.get('/staff/operator/booking-actions');
    return {
      success: true,
      data: response.data.data,
      _metadata: {
        endpoint_used: '/staff/operator/booking-actions',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Get booking actions error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      code: error.response?.data?.code || 'BOOKING_ACTIONS_FAILED'
    };
  }
};

// Helper functions untuk status dan validasi
export const getFieldStatusColor = (status) => {
  const statusColors = {
    'active': 'bg-gray-100 text-gray-900',
    'maintenance': 'bg-gray-100 text-gray-900',
    'inactive': 'bg-red-100 text-red-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-900';
};

export const getBookingStatusColor = (status) => {
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-900';
};

export const getBookingStatusLabel = (status) => {
  const statusLabels = {
    'pending': 'Menunggu',
    'confirmed': 'Dikonfirmasi',
    'completed': 'Selesai',
    'cancelled': 'Dibatalkan'
  };
  return statusLabels[status] || status;
};

export const formatOperatorTime = (timeString) => {
  if (!timeString) return '-';
  return new Date(timeString).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatOperatorDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
