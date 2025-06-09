// src/api/managerAPI.js - Manager-specific API endpoints
import axiosInstance from './axiosInstance';

/**
 * Manager Dashboard API
 */
export const getManagerDashboard = async () => {
  try {
    const response = await axiosInstance.get('/staff/manager/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching manager dashboard:', error);
    return { success: false, error: error.response?.data?.error || error.message, data: {} };
  }
};

/**
 * Business Analytics API
 */
export const getBusinessAnalytics = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/staff/manager/analytics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching business analytics:', error);
    return { success: false, error: error.response?.data?.error || error.message, data: {} };
  }
};

/**
 * Manager Booking Management API
 */
export const getManagerBookings = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/staff/manager/bookings', { params });
    if (response.data.success) {
      // Extract bookings from nested data structure
      return {
        success: true,
        data: response.data.data?.bookings || response.data.data || []
      };
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching manager bookings:', error);
    return { success: false, error: error.response?.data?.error || error.message, data: [] };
  }
};

export const getManagerBookingDetail = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/staff/manager/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching manager booking detail:', error);
    throw error;
  }
};

export const updateManagerBookingStatus = async (bookingId, status, reason = '') => {
  try {
    const response = await axiosInstance.put(`/staff/manager/bookings/${bookingId}/status`, {
      status,
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Error updating manager booking status:', error);
    throw error;
  }
};

/**
 * Manager User Management API - Limited to staff only (not customers)
 */
export const getManagerUsers = async (params = {}) => {
  try {
    // Manager can only manage staff, not customers
    const staffParams = { ...params, role_filter: 'staff_only' };
    const response = await axiosInstance.get('/staff/manager/users', { params: staffParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching manager users:', error);
    return { success: false, error: error.response?.data?.error || error.message, data: [] };
  }
};

export const updateManagerUserRole = async (userId, newRole) => {
  try {
    // Manager can only assign roles below their level
    const allowedRoles = ['staff_kasir', 'operator_lapangan'];
    if (!allowedRoles.includes(newRole)) {
      return { success: false, error: 'Manager can only assign kasir and operator roles' };
    }
    const response = await axiosInstance.put(`/staff/manager/users/${userId}/role`, { new_role: newRole });
    return response.data;
  } catch (error) {
    console.error('Error updating manager user role:', error);
    return { success: false, error: error.response?.data?.error || error.message };
  }
};

export const updateManagerUserStatus = async (userId, isActive) => {
  try {
    const response = await axiosInstance.put(`/staff/manager/users/${userId}/status`, { is_active: isActive });
    return response.data;
  } catch (error) {
    console.error('Error updating manager user status:', error);
    return { success: false, error: error.response?.data?.error || error.message };
  }
};

/**
 * Manager Field Management API
 */
export const getManagerFields = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/staff/manager/fields', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching manager fields:', error);
    throw error;
  }
};

export const createManagerField = async (fieldData) => {
  try {
    const response = await axiosInstance.post('/staff/manager/fields', fieldData);
    return response.data;
  } catch (error) {
    console.error('Error creating manager field:', error);
    throw error;
  }
};

export const updateManagerField = async (fieldId, fieldData) => {
  try {
    const response = await axiosInstance.put(`/staff/manager/fields/${fieldId}`, fieldData);
    return response.data;
  } catch (error) {
    console.error('Error updating manager field:', error);
    throw error;
  }
};

/**
 * Manager Reports API
 */
export const getManagerReports = async (type, params = {}) => {
  try {
    const response = await axiosInstance.get(`/staff/manager/reports/${type}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching manager reports:', error);
    throw error;
  }
};

export const getBookingReports = async (params = {}) => {
  return getManagerReports('bookings', params);
};

export const getRevenueReports = async (params = {}) => {
  return getManagerReports('revenue', params);
};

export const getFieldUtilizationReports = async (params = {}) => {
  return getManagerReports('field-utilization', params);
};

export const getStaffPerformanceReports = async (params = {}) => {
  return getManagerReports('staff-performance', params);
};
