// src/api/favoritesAPI.js
import axiosInstance from './axiosInstance';

/**
 * Favorites API calls
 * User favorites dan recommendation system
 */

// ===== CUSTOMER FAVORITES APIs =====

export const getFavoriteFields = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/customer/favorites', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get favorite fields error:', error.response?.data || error.message);
    throw error;
  }
};

export const addToFavorites = async (fieldId) => {
  try {
    const response = await axiosInstance.post(`/customer/favorites/${fieldId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Add to favorites error:', error.response?.data || error.message);
    throw error;
  }
};

export const removeFromFavorites = async (fieldId) => {
  try {
    const response = await axiosInstance.delete(`/customer/favorites/${fieldId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Remove from favorites error:', error.response?.data || error.message);
    throw error;
  }
};

export const toggleFavorite = async (fieldId) => {
  try {
    // Backend uses PUT method for toggle
    const response = await axiosInstance.put(`/customer/favorites/${fieldId}/toggle`);
    return response.data;
  } catch (error) {
    console.error('❌ Toggle favorite error:', error.response?.data || error.message);
    throw error;
  }
};

export const checkIsFavorite = async (fieldId) => {
  try {
    const response = await axiosInstance.get(`/customer/favorites/${fieldId}/check`);
    return response.data;
  } catch (error) {
    console.error('❌ Check is favorite error:', error.response?.data || error.message);
    throw error;
  }
};

export const getFavoriteStatistics = async () => {
  try {
    const response = await axiosInstance.get('/customer/favorites/statistics');
    return response.data;
  } catch (error) {
    console.error('❌ Get favorite statistics error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== RECOMMENDATION APIs =====

export const getRecommendations = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/customer/recommendations', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get recommendations error:', error.response?.data || error.message);
    throw error;
  }
};

export const getPersonalizedRecommendations = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/customer/recommendations/personalized', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get personalized recommendations error:', error.response?.data || error.message);
    throw error;
  }
};

export const getPopularFields = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/customer/recommendations/popular', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get popular fields error:', error.response?.data || error.message);
    throw error;
  }
};

export const getSimilarFields = async (fieldId, params = {}) => {
  try {
    const response = await axiosInstance.get(`/customer/recommendations/similar/${fieldId}`, { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get similar fields error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== ADMIN FAVORITES APIs =====

export const getAdminFavoriteAnalytics = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/favorites/analytics', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get admin favorite analytics error:', error.response?.data || error.message);
    throw error;
  }
};

export const getFieldPopularityStats = async (fieldId) => {
  try {
    const response = await axiosInstance.get(`/admin/fields/${fieldId}/popularity`);
    return response.data;
  } catch (error) {
    console.error('❌ Get field popularity stats error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== FAVORITES HELPERS =====

export const getFavoritesWithAvailability = async (date = null) => {
  try {
    const params = date ? { date } : {};
    const response = await axiosInstance.get('/customer/favorites/with-availability', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get favorites with availability error:', error.response?.data || error.message);
    throw error;
  }
};

export const getFavoriteFieldsCount = async () => {
  try {
    const response = await axiosInstance.get('/customer/favorites/count');
    return response.data;
  } catch (error) {
    console.error('❌ Get favorite fields count error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== LOCAL STORAGE HELPERS =====

export const getFavoritesFromStorage = () => {
  try {
    const favorites = localStorage.getItem('user_favorites');
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('❌ Get favorites from storage error:', error);
    return [];
  }
};

export const saveFavoritesToStorage = (favorites) => {
  try {
    localStorage.setItem('user_favorites', JSON.stringify(favorites));
  } catch (error) {
    console.error('❌ Save favorites to storage error:', error);
  }
};

export const addFavoriteToStorage = (fieldId) => {
  try {
    const favorites = getFavoritesFromStorage();
    if (!favorites.includes(fieldId)) {
      favorites.push(fieldId);
      saveFavoritesToStorage(favorites);
    }
  } catch (error) {
    console.error('❌ Add favorite to storage error:', error);
  }
};

export const removeFavoriteFromStorage = (fieldId) => {
  try {
    const favorites = getFavoritesFromStorage();
    const updatedFavorites = favorites.filter(id => id !== fieldId);
    saveFavoritesToStorage(updatedFavorites);
  } catch (error) {
    console.error('❌ Remove favorite from storage error:', error);
  }
};

export const isFavoriteInStorage = (fieldId) => {
  try {
    const favorites = getFavoritesFromStorage();
    return favorites.includes(fieldId);
  } catch (error) {
    console.error('❌ Check favorite in storage error:', error);
    return false;
  }
};

// ===== SYNC HELPERS =====

export const syncFavoritesWithServer = async () => {
  try {
    const serverFavorites = await getFavoriteFields();
    if (serverFavorites.success && serverFavorites.data?.favorites) {
      const favoriteIds = serverFavorites.data.favorites.map(fav => fav.field_id);
      saveFavoritesToStorage(favoriteIds);
      return favoriteIds;
    }
    return [];
  } catch (error) {
    console.error('❌ Sync favorites with server error:', error);
    return getFavoritesFromStorage();
  }
};
