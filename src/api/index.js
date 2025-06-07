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

// Enhanced Features APIs

// Notification APIs
export {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStatistics,
  getAdminNotifications,
  createSystemNotification,
  broadcastNotification,
  getNotificationDeliveryStatus,
  getNotificationAnalytics,
  subscribeToNotifications,
  getUnreadNotificationCount
} from './notificationAPI';

// Review APIs
export {
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
  getReviewDetail,
  checkCanReview,
  getFieldReviews,
  getFieldRating,
  getAdminReviews,
  moderateReview,
  getReviewAnalytics,
  uploadReviewImages,
  getReviewStatistics,
  calculateAverageRating,
  getRatingDistribution,
  formatReviewDate
} from './reviewAPI';

// Favorites APIs
export {
  getFavoriteFields,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  checkIsFavorite,
  getFavoriteStatistics,
  getRecommendations,
  getPersonalizedRecommendations,
  getPopularFields,
  getSimilarFields,
  getAdminFavoriteAnalytics,
  getFieldPopularityStats,
  getFavoritesWithAvailability,
  getFavoriteFieldsCount,
  syncFavoritesWithServer
} from './favoritesAPI';

// Promotion APIs
export {
  getAvailablePromotions,
  validatePromotion,
  applyPromotion,
  getPromotionDetail,
  getUserPromotionHistory,
  checkPromotionEligibility,
  getAdminPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotionStatus,
  getPromotionAnalytics,
  getPromotionUsageStats,
  calculateDiscount,
  formatPromotionCode,
  isPromotionValid,
  getPromotionStatusText,
  formatPromotionPeriod
} from './promotionAPI';

// Analytics APIs
export {
  getDashboardStats,
  getBookingAnalytics as getBookingAnalyticsData,
  getRevenueAnalytics,
  getFieldAnalytics,
  getUserAnalytics as getUserAnalyticsData,
  getPerformanceMetrics,
  getOccupancyRate,
  getPeakHours,
  getCustomerRetention,
  generateReport,
  getReportList,
  downloadReport,
  deleteReport,
  getRealTimeStats,
  getActiveBookings,
  getCurrentOccupancy,
  formatAnalyticsData,
  formatCurrency,
  calculateGrowthPercentage,
  getDateRangeOptions
} from './analyticsAPI';

// Axios instance for direct use if needed
export { default as axiosInstance } from './axiosInstance';
