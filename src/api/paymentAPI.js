// src/api/paymentAPI.js
import axiosInstance from './axiosInstance';

/**
 * Payment API calls
 * Role-based endpoints sesuai backend architecture
 */

// ===== CUSTOMER PAYMENT APIs (role: penyewa) =====

export const createPayment = async (bookingId, paymentData) => {
  try {
    const response = await axiosInstance.post(`/customer/bookings/${bookingId}/payment`, paymentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCustomerPayments = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/customer/payments', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPaymentById = async (id) => {
  try {
    const response = await axiosInstance.get(`/customer/payments/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadPaymentProof = async (paymentId, formData) => {
  try {
    const response = await axiosInstance.post(`/customer/payments/${paymentId}/proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ===== STAFF PAYMENT APIs (roles: kasir, manager, supervisor) =====

export const getAllPayments = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/staff/payments', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyPayment = async (id) => {
  try {
    const response = await axiosInstance.patch(`/staff/payments/${id}/verify`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const rejectPayment = async (id, reason) => {
  try {
    const response = await axiosInstance.patch(`/staff/payments/${id}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPaymentAnalytics = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/staff/payments/analytics', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const generatePaymentReport = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/staff/payments/report', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};