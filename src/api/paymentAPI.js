// src/api/paymentAPI.js
import axiosInstance from './axiosInstance';

/**
 * Payment API calls
 * Role-based endpoints sesuai backend architecture
 */

// ===== CUSTOMER PAYMENT APIs (role: penyewa) =====

export const createPayment = async (bookingId, paymentData) => {
  const response = await axiosInstance.post(`/customer/bookings/${bookingId}/payment`, paymentData);
  return response.data;
};

export const getCustomerPayments = async (params = {}) => {
  const response = await axiosInstance.get('/customer/payments', { params });
  return response.data;
};

export const getPaymentById = async (id) => {
  const response = await axiosInstance.get(`/customer/payments/${id}`);
  return response.data;
};

export const uploadPaymentProof = async (paymentId, formData) => {
  const response = await axiosInstance.post(`/customer/payments/${paymentId}/proof`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ===== STAFF PAYMENT APIs (roles: kasir, manager, supervisor) =====

export const getAllPayments = async (params = {}) => {
  try {
    // Use kasir endpoint for payment management
    const response = await axiosInstance.get('/staff/kasir/payments', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get all payments error:', error.response?.data || error.message);
    throw error;
  }
};

export const verifyPayment = async (id) => {
  try {
    // Use kasir endpoint for payment verification
    const response = await axiosInstance.put(`/staff/kasir/payments/${id}/confirm`);
    return response.data;
  } catch (error) {
    console.error('❌ Verify payment error:', error.response?.data || error.message);
    throw error;
  }
};

export const rejectPayment = async (id, reason) => {
  try {
    // Use kasir endpoint for payment rejection
    const response = await axiosInstance.patch(`/staff/kasir/payments/${id}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('❌ Reject payment error:', error.response?.data || error.message);
    throw error;
  }
};

export const getPaymentAnalytics = async (params = {}) => {
  try {
    // Use kasir endpoint for payment analytics
    const response = await axiosInstance.get('/staff/kasir/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get payment analytics error:', error.response?.data || error.message);
    throw error;
  }
};

export const generatePaymentReport = async (params = {}) => {
  try {
    // Use kasir endpoint for payment reports
    const response = await axiosInstance.get('/staff/kasir/daily-report', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Generate payment report error:', error.response?.data || error.message);
    throw error;
  }
};