// src/api/kasirAPI.js
import axiosInstance from './axiosInstance';

/**
 * Kasir API calls
 * Staff kasir payment management dan transaction processing
 */

// ===== KASIR DASHBOARD APIs =====

export const getKasirDashboard = async () => {
  try {
    const response = await axiosInstance.get('/staff/kasir/dashboard');
    return response.data;
  } catch (error) {
    console.error('❌ Get kasir dashboard error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== PAYMENT MANAGEMENT APIs =====

export const getAllPaymentsForKasir = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/staff/kasir/payments', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get all payments for kasir error:', error.response?.data || error.message);
    throw error;
  }
};

export const getPaymentDetailForKasir = async (id) => {
  try {
    const response = await axiosInstance.get(`/staff/kasir/payments/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Get payment detail for kasir error:', error.response?.data || error.message);
    throw error;
  }
};

export const processManualPayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post('/staff/kasir/payments/manual', paymentData);
    return response.data;
  } catch (error) {
    console.error('❌ Process manual payment error:', error.response?.data || error.message);
    throw error;
  }
};

export const confirmPayment = async (id, notes = '') => {
  try {
    const response = await axiosInstance.put(`/staff/kasir/payments/${id}/confirm`, { notes });
    return response.data;
  } catch (error) {
    console.error('❌ Confirm payment error:', error.response?.data || error.message);
    throw error;
  }
};

export const getPendingPayments = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/staff/kasir/payments/pending', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get pending payments error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== BOOKING MANAGEMENT APIs =====

export const getAllBookingsForKasir = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/staff/kasir/bookings', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get all bookings for kasir error:', error.response?.data || error.message);
    throw error;
  }
};

export const getBookingDetailForKasir = async (id) => {
  try {
    const response = await axiosInstance.get(`/staff/kasir/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Get booking detail for kasir error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== STATISTICS & REPORTS APIs =====

export const getPaymentStatsForKasir = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/staff/kasir/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get payment stats for kasir error:', error.response?.data || error.message);
    throw error;
  }
};

export const getDailyCashReport = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/staff/kasir/daily-report', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get daily cash report error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== PAYMENT METHODS APIs =====

export const getPaymentMethods = async () => {
  try {
    const response = await axiosInstance.get('/staff/kasir/payment-methods');
    return response.data;
  } catch (error) {
    console.error('❌ Get payment methods error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== HELPER FUNCTIONS =====

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const getPaymentStatusColor = (status) => {
  const colors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'paid': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800',
    'cancelled': 'bg-gray-100 text-gray-800',
    'refunded': 'bg-blue-100 text-blue-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getPaymentMethodLabel = (method) => {
  const labels = {
    'cash': 'Tunai',
    'bank_transfer': 'Transfer Bank',
    'debit_card': 'Kartu Debit',
    'credit_card': 'Kartu Kredit',
    'e_wallet': 'E-Wallet',
    'qris': 'QRIS'
  };
  return labels[method] || method;
};

// ===== VALIDATION HELPERS =====

export const validatePaymentAmount = (amount, bookingAmount) => {
  if (!amount || amount <= 0) {
    return 'Jumlah pembayaran harus lebih dari 0';
  }
  if (amount !== bookingAmount) {
    return 'Jumlah pembayaran harus sesuai dengan total booking';
  }
  return null;
};

export const validateReferenceNumber = (method, referenceNumber) => {
  const methodsRequiringReference = ['bank_transfer', 'debit_card', 'credit_card'];
  if (methodsRequiringReference.includes(method) && !referenceNumber) {
    return 'Nomor referensi diperlukan untuk metode pembayaran ini';
  }
  return null;
};
