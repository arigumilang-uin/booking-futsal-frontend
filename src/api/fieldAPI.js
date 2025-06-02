// src/api/fieldAPI.js
import axiosInstance from './axiosInstance';

/**
 * Field API calls
 * Public dan role-based endpoints sesuai backend architecture
 */

// ===== PUBLIC FIELD APIs =====

export const getPublicFields = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/public/fields', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFieldById = async (id) => {
  try {
    const response = await axiosInstance.get(`/public/fields/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkFieldAvailability = async (fieldId, date) => {
  try {
    const response = await axiosInstance.get(`/public/fields/${fieldId}/availability`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ===== STAFF FIELD APIs (roles: operator, manager, supervisor) =====

export const getAllFields = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/staff/fields', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createField = async (fieldData) => {
  try {
    const response = await axiosInstance.post('/staff/fields', fieldData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateField = async (id, fieldData) => {
  try {
    const response = await axiosInstance.put(`/staff/fields/${id}`, fieldData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteField = async (id) => {
  try {
    const response = await axiosInstance.delete(`/staff/fields/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateFieldStatus = async (id, status) => {
  try {
    const response = await axiosInstance.patch(`/staff/fields/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};
