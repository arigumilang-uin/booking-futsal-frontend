// src/api/authAPI.js
import axiosInstance from './axiosInstance';

/**
 * Authentication API calls
 * Menggunakan cookie-based authentication sesuai backend
 */

export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);

    // Handle token storage for development/cross-domain scenarios
    if (response.data.success && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      console.log('🔑 Token stored from response body');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('❌ Register error:', error.response?.data || error.message);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await axiosInstance.post('/auth/logout');

    // Clear stored token on successful logout
    if (response.data.success) {
      localStorage.removeItem('auth_token');
      console.log('🔓 Token cleared from localStorage');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Logout error:', error.response?.data || error.message);
    // Clear token even if logout request fails (for security)
    localStorage.removeItem('auth_token');
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await axiosInstance.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('❌ Get profile error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('❌ Update profile error:', error.response?.data || error.message);
    throw error;
  }
};