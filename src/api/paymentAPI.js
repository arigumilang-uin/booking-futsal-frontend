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

// ===== ADVANCED PAYMENT GATEWAY =====

export const getPaymentMethods = async () => {
  try {
    const response = await axiosInstance.get('/customer/payment-methods');
    return response.data;
  } catch (error) {
    console.error('❌ Get payment methods error:', error.response?.data || error.message);
    throw error;
  }
};

export const validatePaymentData = async (paymentData) => {
  try {
    const response = await axiosInstance.post('/customer/payments/validate', paymentData);
    return response.data;
  } catch (error) {
    console.error('❌ Validate payment data error:', error.response?.data || error.message);
    throw error;
  }
};

export const processPayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post('/customer/payments/process', paymentData);
    return response.data;
  } catch (error) {
    console.error('❌ Process payment error:', error.response?.data || error.message);
    throw error;
  }
};

export const generatePaymentReceipt = async (paymentId) => {
  try {
    const response = await axiosInstance.get(`/customer/payments/${paymentId}/receipt`);
    return response.data;
  } catch (error) {
    console.error('❌ Generate payment receipt error:', error.response?.data || error.message);
    throw error;
  }
};

export const downloadPaymentReceipt = async (paymentId, format = 'pdf') => {
  try {
    const response = await axiosInstance.get(`/customer/payments/${paymentId}/receipt/download`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('❌ Download payment receipt error:', error.response?.data || error.message);
    throw error;
  }
};

export const getPaymentGatewayStatus = async () => {
  try {
    const response = await axiosInstance.get('/customer/payment-gateway/status');
    return response.data;
  } catch (error) {
    console.error('❌ Get payment gateway status error:', error.response?.data || error.message);
    throw error;
  }
};