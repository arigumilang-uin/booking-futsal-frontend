import axiosInstance from './axiosInstance';

// Customer Dashboard API
export const getCustomerDashboard = async () => {
  try {
    const response = await axiosInstance.get('/customer/dashboard');
    return response.data;
  } catch (error) {
    console.error('Get customer dashboard error:', error);
    throw error;
  }
};

// Customer Statistics API
export const getCustomerStatistics = async () => {
  try {
    const response = await axiosInstance.get('/customer/statistics');
    return response.data;
  } catch (error) {
    console.error('Get customer statistics error:', error);
    throw error;
  }
};

// Customer Profile API
export const getCustomerProfile = async () => {
  try {
    const response = await axiosInstance.get('/customer/profile');
    return response.data;
  } catch (error) {
    console.error('Get customer profile error:', error);
    throw error;
  }
};

export const updateCustomerProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put('/customer/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Update customer profile error:', error);
    throw error;
  }
};

// Customer Favorites API
export const getFavoriteFields = async () => {
  try {
    const response = await axiosInstance.get('/customer/favorites');
    return response.data;
  } catch (error) {
    console.error('Get favorite fields error:', error);
    throw error;
  }
};

export const addFieldToFavorites = async (fieldId) => {
  try {
    const response = await axiosInstance.post(`/customer/favorites/${fieldId}`);
    return response.data;
  } catch (error) {
    console.error('Add field to favorites error:', error);
    throw error;
  }
};

export const removeFieldFromFavorites = async (fieldId) => {
  try {
    const response = await axiosInstance.delete(`/customer/favorites/${fieldId}`);
    return response.data;
  } catch (error) {
    console.error('Remove field from favorites error:', error);
    throw error;
  }
};

export const toggleFieldFavorite = async (fieldId) => {
  try {
    // Backend uses PUT method for toggle
    const response = await axiosInstance.put(`/customer/favorites/${fieldId}/toggle`);
    return response.data;
  } catch (error) {
    console.error('Toggle field favorite error:', error);
    throw error;
  }
};

// Customer Notifications API
export const getCustomerNotifications = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/customer/notifications', { params });
    return response.data;
  } catch (error) {
    console.error('Get customer notifications error:', error);
    throw error;
  }
};

export const getUnreadNotificationsCount = async () => {
  try {
    const response = await axiosInstance.get('/customer/notifications/unread-count');
    return response.data;
  } catch (error) {
    console.error('Get unread notifications count error:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.put(`/customer/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axiosInstance.put('/customer/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    throw error;
  }
};

// Customer Reviews API
export const getCustomerReviews = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/customer/reviews', { params });
    return response.data;
  } catch (error) {
    console.error('Get customer reviews error:', error);
    throw error;
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await axiosInstance.post('/customer/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('Create review error:', error);
    throw error;
  }
};

export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await axiosInstance.put(`/customer/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Update review error:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await axiosInstance.delete(`/customer/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Delete review error:', error);
    throw error;
  }
};

export const checkCanReview = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/customer/reviews/can-review/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Check can review error:', error);
    throw error;
  }
};

// Customer Promotions API
export const getAvailablePromotions = async () => {
  try {
    const response = await axiosInstance.get('/customer/promotions');
    return response.data;
  } catch (error) {
    console.error('Get available promotions error:', error);
    throw error;
  }
};

export const validatePromotionCode = async (code) => {
  try {
    const response = await axiosInstance.post('/customer/promotions/validate', { code });
    return response.data;
  } catch (error) {
    console.error('Validate promotion code error:', error);
    throw error;
  }
};

export const applyPromotionToBooking = async (promotionData) => {
  try {
    const response = await axiosInstance.post('/customer/promotions/apply', promotionData);
    return response.data;
  } catch (error) {
    console.error('Apply promotion to booking error:', error);
    throw error;
  }
};

export const calculateDiscountPreview = async (promotionData) => {
  try {
    const response = await axiosInstance.post('/customer/promotions/calculate', promotionData);
    return response.data;
  } catch (error) {
    console.error('Calculate discount preview error:', error);
    throw error;
  }
};

// Customer Recommendations API
export const getRecommendations = async () => {
  try {
    const response = await axiosInstance.get('/customer/recommendations');
    return response.data;
  } catch (error) {
    console.error('Get recommendations error:', error);
    throw error;
  }
};

// Customer Fields API
export const getCustomerFields = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/customer/fields', { params });
    return response.data;
  } catch (error) {
    console.error('Get customer fields error:', error);
    throw error;
  }
};
