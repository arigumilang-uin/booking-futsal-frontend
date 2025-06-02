// src/api/userAPI.js
import axiosInstance from './axiosInstance';

/**
 * User API calls
 * Role-based endpoints sesuai backend architecture
 */

// ===== PROFILE APIs (all authenticated users) =====

export const getProfile = async () => {
  try {
    const response = await axiosInstance.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.put('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ===== STAFF USER MANAGEMENT APIs (roles: manager, supervisor) =====

export const getAllUsers = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/staff/users', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/staff/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/staff/users', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await axiosInstance.put(`/staff/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`/staff/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserRole = async (id, role) => {
  try {
    const response = await axiosInstance.patch(`/staff/users/${id}/role`, { role });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserAnalytics = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/staff/users/analytics', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};
