// src/api/reviewAPI.js
import axiosInstance from './axiosInstance';

/**
 * Review API calls
 * Field review dan rating system
 */

// ===== CUSTOMER REVIEW APIs =====

export const getUserReviews = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/customer/reviews', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get user reviews error:', error.response?.data || error.message);
    throw error;
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await axiosInstance.post('/customer/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('❌ Create review error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateReview = async (id, reviewData) => {
  try {
    const response = await axiosInstance.put(`/customer/reviews/${id}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('❌ Update review error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteReview = async (id) => {
  try {
    const response = await axiosInstance.delete(`/customer/reviews/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete review error:', error.response?.data || error.message);
    throw error;
  }
};

export const getReviewDetail = async (id) => {
  try {
    const response = await axiosInstance.get(`/customer/reviews/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Get review detail error:', error.response?.data || error.message);
    throw error;
  }
};

export const checkCanReview = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/customer/reviews/can-review/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Check can review error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== PUBLIC REVIEW APIs =====

export const getFieldReviews = async (fieldId, params = {}) => {
  try {
    const response = await axiosInstance.get(`/public/fields/${fieldId}/reviews`, { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get field reviews error:', error.response?.data || error.message);
    throw error;
  }
};

export const getFieldRating = async (fieldId) => {
  try {
    const response = await axiosInstance.get(`/public/fields/${fieldId}/rating`);
    return response.data;
  } catch (error) {
    console.error('❌ Get field rating error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== ADMIN REVIEW APIs =====

export const getAdminReviews = async (params = {}) => {
  try {
    // Use customer reviews endpoint for admin access (backend handles permissions)
    const response = await axiosInstance.get('/customer/reviews', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get admin reviews error:', error.response?.data || error.message);
    throw error;
  }
};

export const moderateReview = async (id, action, reason = '') => {
  try {
    const response = await axiosInstance.put(`/admin/reviews/${id}/moderate`, { action, reason });
    return response.data;
  } catch (error) {
    console.error('❌ Moderate review error:', error.response?.data || error.message);
    throw error;
  }
};

export const getReviewAnalytics = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/reviews/analytics', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get review analytics error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== REVIEW HELPERS =====

export const uploadReviewImages = async (files) => {
  try {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    const response = await axiosInstance.post('/customer/reviews/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Upload review images error:', error.response?.data || error.message);
    throw error;
  }
};

export const getReviewStatistics = async () => {
  try {
    const response = await axiosInstance.get('/customer/reviews/statistics');
    return response.data;
  } catch (error) {
    console.error('❌ Get review statistics error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== RATING HELPERS =====

export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return (totalRating / reviews.length).toFixed(1);
};

export const getRatingDistribution = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(review => {
    distribution[review.rating]++;
  });

  return distribution;
};

export const formatReviewDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} minggu yang lalu`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} bulan yang lalu`;
  
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
