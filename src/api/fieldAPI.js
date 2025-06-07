// src/api/fieldAPI.js
import axiosInstance from './axiosInstance';

/**
 * Field API calls
 * Public dan role-based endpoints sesuai backend architecture
 */

// ===== PUBLIC FIELD APIs =====

export const getPublicFields = async (params = {}) => {
  const response = await axiosInstance.get('/public/fields', { params });
  return response.data;
};

export const getFieldById = async (id) => {
  const response = await axiosInstance.get(`/public/fields/${id}`);
  return response.data;
};

export const checkFieldAvailability = async (fieldId, date) => {
  const response = await axiosInstance.get(`/public/fields/${fieldId}/availability`, {
    params: { date }
  });
  return response.data;
};

// ===== STAFF FIELD APIs (roles: operator, manager, supervisor) =====

export const getAllFields = async (params = {}) => {
  try {
    // Use admin endpoint for field management
    const response = await axiosInstance.get('/admin/fields', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get all fields error:', error.response?.data || error.message);
    throw error;
  }
};

export const createField = async (fieldData) => {
  try {
    // Use admin endpoint for field creation
    const response = await axiosInstance.post('/admin/fields', fieldData);
    return response.data;
  } catch (error) {
    console.error('❌ Create field error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateField = async (id, fieldData) => {
  try {
    // Use admin endpoint for field updates
    const response = await axiosInstance.put(`/admin/fields/${id}`, fieldData);
    return response.data;
  } catch (error) {
    console.error('❌ Update field error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteField = async (id) => {
  try {
    // Use admin endpoint for field deletion
    const response = await axiosInstance.delete(`/admin/fields/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete field error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateFieldStatus = async (id, status) => {
  try {
    // Use admin endpoint for field status updates
    const response = await axiosInstance.patch(`/admin/fields/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('❌ Update field status error:', error.response?.data || error.message);
    throw error;
  }
};
