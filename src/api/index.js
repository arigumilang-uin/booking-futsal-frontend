// src/api/index.js
/**
 * Centralized API exports
 * Memudahkan import API functions dari components
 */

// Authentication APIs
export {
  loginUser,
  registerUser,
  logoutUser,
  getProfile,
  updateProfile
} from './authAPI';

// Booking APIs
export {
  // Customer booking APIs
  createBooking,
  getCustomerBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  // Staff booking APIs
  getAllBookings,
  updateBookingStatus,
  confirmBooking,
  rejectBooking,
  getBookingAnalytics
} from './bookingAPI';

// Field APIs
export {
  // Public field APIs
  getPublicFields,
  getFieldById,
  checkFieldAvailability,
  // Staff field APIs
  getAllFields,
  createField,
  updateField,
  deleteField,
  updateFieldStatus
} from './fieldAPI';

// Payment APIs
export {
  // Customer payment APIs
  createPayment,
  getCustomerPayments,
  getPaymentById,
  uploadPaymentProof,
  // Staff payment APIs
  getAllPayments,
  verifyPayment,
  rejectPayment,
  getPaymentAnalytics,
  generatePaymentReport
} from './paymentAPI';

// User APIs
export {
  // Profile APIs
  getProfile as getUserProfile,
  updateProfile as updateUserProfile,
  changePassword,
  // Staff user management APIs
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getUserAnalytics
} from './userAPI';

// Axios instance for direct use if needed
export { default as axiosInstance } from './axiosInstance';
