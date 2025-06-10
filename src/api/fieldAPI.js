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
    // Use admin endpoint for field updates (includes status)
    const response = await axiosInstance.put(`/admin/fields/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error('❌ Update field status error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== FIELD MAINTENANCE =====

export const getMaintenanceSchedule = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/fields/maintenance/schedule', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get maintenance schedule error:', error.response?.data || error.message);
    throw error;
  }
};

export const createMaintenanceTask = async (taskData) => {
  try {
    const response = await axiosInstance.post('/admin/fields/maintenance', taskData);
    return response.data;
  } catch (error) {
    console.error('❌ Create maintenance task error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateMaintenanceTask = async (taskId, updateData) => {
  try {
    const response = await axiosInstance.put(`/admin/fields/maintenance/${taskId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('❌ Update maintenance task error:', error.response?.data || error.message);
    throw error;
  }
};

export const getMaintenanceHistory = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/fields/maintenance/history', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get maintenance history error:', error.response?.data || error.message);
    throw error;
  }
};

export const getEquipmentInventory = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/fields/equipment', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get equipment inventory error:', error.response?.data || error.message);
    throw error;
  }
};

export const reportFieldIssue = async (issueData) => {
  try {
    const response = await axiosInstance.post('/admin/fields/issues', issueData);
    return response.data;
  } catch (error) {
    console.error('❌ Report field issue error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== OPERATOR ASSIGNMENT APIs =====

export const getOperators = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/admin/operators', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get operators error:', error.response?.data || error.message);
    throw error;
  }
};

export const assignOperatorToField = async (fieldId, operatorId) => {
  try {
    const response = await axiosInstance.put(`/admin/fields/${fieldId}/assign-operator`, {
      operator_id: operatorId
    });
    return response.data;
  } catch (error) {
    console.error('❌ Assign operator to field error:', error.response?.data || error.message);
    throw error;
  }
};

export const unassignOperatorFromField = async (fieldId) => {
  try {
    const response = await axiosInstance.put(`/admin/fields/${fieldId}/assign-operator`, {
      operator_id: null
    });
    return response.data;
  } catch (error) {
    console.error('❌ Unassign operator from field error:', error.response?.data || error.message);
    throw error;
  }
};
