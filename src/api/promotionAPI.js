// src/api/promotionAPI.js
import axiosInstance from './axiosInstance';

/**
 * Promotion API calls
 * Promotion dan discount management system
 */

// ===== CUSTOMER PROMOTION APIs =====

export const getAvailablePromotions = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/customer/promotions', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get available promotions error:', error.response?.data || error.message);
    throw error;
  }
};

export const validatePromotion = async (promotionData) => {
  try {
    const response = await axiosInstance.post('/customer/promotions/validate', promotionData);
    return response.data;
  } catch (error) {
    console.error('❌ Validate promotion error:', error.response?.data || error.message);
    throw error;
  }
};

export const applyPromotion = async (promotionCode, bookingData) => {
  try {
    const response = await axiosInstance.post('/customer/promotions/apply', {
      promotion_code: promotionCode,
      ...bookingData
    });
    return response.data;
  } catch (error) {
    console.error('❌ Apply promotion error:', error.response?.data || error.message);
    throw error;
  }
};

export const getPromotionDetail = async (id) => {
  try {
    const response = await axiosInstance.get(`/customer/promotions/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Get promotion detail error:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserPromotionHistory = async (params = {}) => {
  try {
    // Use bookings endpoint to get promotion usage history
    const response = await axiosInstance.get('/customer/bookings', {
      params: { ...params, has_promotion: true }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get user promotion history error:', error.response?.data || error.message);
    throw error;
  }
};

export const checkPromotionEligibility = async (promotionId, bookingData) => {
  try {
    const response = await axiosInstance.post(`/customer/promotions/${promotionId}/check-eligibility`, bookingData);
    return response.data;
  } catch (error) {
    console.error('❌ Check promotion eligibility error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== ADMIN PROMOTION APIs =====

export const getAdminPromotions = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/promotions', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get admin promotions error:', error.response?.data || error.message);
    throw error;
  }
};

export const createPromotion = async (promotionData) => {
  try {
    const response = await axiosInstance.post('/admin/promotions', promotionData);
    return response.data;
  } catch (error) {
    console.error('❌ Create promotion error:', error.response?.data || error.message);
    throw error;
  }
};

export const updatePromotion = async (id, promotionData) => {
  try {
    const response = await axiosInstance.put(`/admin/promotions/${id}`, promotionData);
    return response.data;
  } catch (error) {
    console.error('❌ Update promotion error:', error.response?.data || error.message);
    throw error;
  }
};

export const deletePromotion = async (id) => {
  try {
    const response = await axiosInstance.delete(`/admin/promotions/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete promotion error:', error.response?.data || error.message);
    throw error;
  }
};

export const togglePromotionStatus = async (id) => {
  try {
    const response = await axiosInstance.patch(`/admin/promotions/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('❌ Toggle promotion status error:', error.response?.data || error.message);
    throw error;
  }
};

export const getPromotionAnalytics = async (id, params = {}) => {
  try {
    const response = await axiosInstance.get(`/admin/promotions/${id}/analytics`, { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get promotion analytics error:', error.response?.data || error.message);
    throw error;
  }
};

export const getPromotionUsageStats = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/promotions/usage-stats', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get promotion usage stats error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== PROMOTION HELPERS =====

export const calculateDiscount = (originalPrice, promotion) => {
  if (!promotion || !promotion.is_active) return 0;

  let discount = 0;
  
  switch (promotion.discount_type) {
    case 'percentage':
      discount = (originalPrice * promotion.discount_value) / 100;
      break;
    case 'fixed':
      discount = promotion.discount_value;
      break;
    case 'buy_x_get_y':
      // Implementasi logika buy X get Y
      // Untuk saat ini, return 0
      discount = 0;
      break;
    default:
      discount = 0;
  }

  // Apply maximum discount limit if exists
  if (promotion.max_discount && discount > promotion.max_discount) {
    discount = promotion.max_discount;
  }

  // Apply minimum order requirement
  if (promotion.min_order && originalPrice < promotion.min_order) {
    discount = 0;
  }

  return Math.min(discount, originalPrice);
};

export const formatPromotionCode = (code) => {
  return code ? code.toUpperCase().trim() : '';
};

export const isPromotionValid = (promotion) => {
  if (!promotion) return false;

  const now = new Date();
  const startDate = new Date(promotion.start_date);
  const endDate = new Date(promotion.end_date);

  return (
    promotion.is_active &&
    now >= startDate &&
    now <= endDate &&
    (promotion.usage_limit === null || promotion.used_count < promotion.usage_limit)
  );
};

export const getPromotionStatusText = (promotion) => {
  if (!promotion.is_active) return 'Tidak Aktif';
  
  const now = new Date();
  const startDate = new Date(promotion.start_date);
  const endDate = new Date(promotion.end_date);

  if (now < startDate) return 'Belum Dimulai';
  if (now > endDate) return 'Sudah Berakhir';
  if (promotion.usage_limit && promotion.used_count >= promotion.usage_limit) return 'Kuota Habis';
  
  return 'Aktif';
};

export const formatPromotionPeriod = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return `${start.toLocaleDateString('id-ID', options)} - ${end.toLocaleDateString('id-ID', options)}`;
};
