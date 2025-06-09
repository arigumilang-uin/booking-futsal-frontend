// src/api/analyticsAPI.js
import axiosInstance from './axiosInstance';

/**
 * Analytics API calls
 * Business analytics dan reporting system
 */

// ===== DASHBOARD ANALYTICS =====

export const getDashboardStats = async (role, params = {}) => {
  try {
    let endpoint = '/customer/dashboard';

    // Determine endpoint based on role
    if (['manajer_futsal', 'supervisor_sistem'].includes(role)) {
      endpoint = '/admin/analytics/business';
    } else if (['staff_kasir'].includes(role)) {
      endpoint = '/staff/kasir/statistics';
    } else if (['operator_lapangan'].includes(role)) {
      endpoint = '/staff/operator/dashboard';
    }

    const response = await axiosInstance.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get dashboard stats error:', error.response?.data || error.message);
    throw error;
  }
};

export const getBookingAnalytics = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/analytics/bookings', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get booking analytics error:', error.response?.data || error.message);
    throw error;
  }
};

export const getRevenueAnalytics = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/analytics/revenue', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get revenue analytics error:', error.response?.data || error.message);
    throw error;
  }
};

export const getFieldAnalytics = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/analytics/fields', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get field analytics error:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserAnalytics = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/analytics/users', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get user analytics error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== PERFORMANCE METRICS =====

export const getPerformanceMetrics = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/analytics/performance', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get performance metrics error:', error.response?.data || error.message);
    throw error;
  }
};

export const getOccupancyRate = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/analytics/occupancy-rate', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get occupancy rate error:', error.response?.data || error.message);
    throw error;
  }
};

export const getPeakHours = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/analytics/peak-hours', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get peak hours error:', error.response?.data || error.message);
    throw error;
  }
};

export const getCustomerRetention = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/analytics/customer-retention', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get customer retention error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== REPORTS =====

export const generateReport = async (reportType, params = {}) => {
  try {
    const response = await axiosInstance.post('/admin/reports/generate', {
      type: reportType,
      ...params
    });
    return response.data;
  } catch (error) {
    console.error('❌ Generate report error:', error.response?.data || error.message);
    throw error;
  }
};

export const getReportList = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/reports', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get report list error:', error.response?.data || error.message);
    throw error;
  }
};

export const downloadReport = async (reportId) => {
  try {
    const response = await axiosInstance.get(`/admin/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('❌ Download report error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteReport = async (reportId) => {
  try {
    const response = await axiosInstance.delete(`/admin/reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete report error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== REAL-TIME ANALYTICS =====

export const getRealTimeStats = async () => {
  try {
    const response = await axiosInstance.get('/admin/analytics/real-time');
    return response.data;
  } catch (error) {
    console.error('❌ Get real-time stats error:', error.response?.data || error.message);
    throw error;
  }
};

export const getActiveBookings = async () => {
  try {
    const response = await axiosInstance.get('/admin/analytics/active-bookings');
    return response.data;
  } catch (error) {
    console.error('❌ Get active bookings error:', error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentOccupancy = async () => {
  try {
    const response = await axiosInstance.get('/admin/analytics/current-occupancy');
    return response.data;
  } catch (error) {
    console.error('❌ Get current occupancy error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== ANALYTICS HELPERS =====

export const formatAnalyticsData = (data, type) => {
  if (!data) return null;

  switch (type) {
    case 'revenue':
      return {
        ...data,
        formatted_total: formatCurrency(data.total),
        growth_percentage: calculateGrowthPercentage(data.current, data.previous)
      };
    case 'bookings':
      return {
        ...data,
        completion_rate: calculateCompletionRate(data.completed, data.total),
        cancellation_rate: calculateCancellationRate(data.cancelled, data.total)
      };
    default:
      return data;
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const calculateGrowthPercentage = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous * 100).toFixed(1);
};

export const calculateCompletionRate = (completed, total) => {
  if (!total || total === 0) return 0;
  return ((completed / total) * 100).toFixed(1);
};

export const calculateCancellationRate = (cancelled, total) => {
  if (!total || total === 0) return 0;
  return ((cancelled / total) * 100).toFixed(1);
};

export const getDateRangeOptions = () => {
  return [
    { value: 'today', label: 'Hari Ini' },
    { value: 'yesterday', label: 'Kemarin' },
    { value: 'last_7_days', label: '7 Hari Terakhir' },
    { value: 'last_30_days', label: '30 Hari Terakhir' },
    { value: 'this_month', label: 'Bulan Ini' },
    { value: 'last_month', label: 'Bulan Lalu' },
    { value: 'this_year', label: 'Tahun Ini' },
    { value: 'custom', label: 'Kustom' }
  ];
};

// ===== ENHANCED ANALYTICS =====

export const getAdvancedAnalytics = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/analytics/advanced', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get advanced analytics error:', error.response?.data || error.message);
    throw error;
  }
};

// Duplicate functions removed - already exist above
