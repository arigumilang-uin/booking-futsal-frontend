// src/api/userAPI.js
import axiosInstance from './axiosInstance';

/**
 * User API calls
 * Role-based endpoints sesuai backend architecture
 */

// ===== PROFILE APIs (all authenticated users) =====

export const getProfile = async () => {
  const response = await axiosInstance.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (profileData) => {
  try {
    // Use customer profile endpoint for profile updates
    const response = await axiosInstance.put('/customer/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('❌ Update profile error:', error.response?.data || error.message);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.post('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('❌ Change password error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== STAFF USER MANAGEMENT APIs (roles: manager, supervisor) =====

export const getAllUsers = async (params = {}) => {
  try {
    // Use admin endpoint for user management
    const response = await axiosInstance.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get all users error:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    // Use admin endpoint for user details
    const response = await axiosInstance.get(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Get user by ID error:', error.response?.data || error.message);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    // Use admin endpoint for user creation
    const response = await axiosInstance.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    console.error('❌ Create user error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    // Use admin endpoint for user updates
    const response = await axiosInstance.put(`/admin/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('❌ Update user error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    // Use admin endpoint for user deletion
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete user error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateUserRole = async (id, role) => {
  try {
    // Use admin endpoint for role updates
    const response = await axiosInstance.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('❌ Update user role error:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserAnalytics = async (params = {}) => {
  try {
    // Use admin endpoint for user analytics
    const response = await axiosInstance.get('/admin/users/analytics', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get user analytics error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== USER STATUS MANAGEMENT APIs =====

export const activateUser = async (id) => {
  try {
    const response = await axiosInstance.patch(`/admin/users/${id}/status`, {
      is_active: true
    });
    return response.data;
  } catch (error) {
    console.error('❌ Activate user error:', error.response?.data || error.message);
    throw error;
  }
};

export const deactivateUser = async (id) => {
  try {
    const response = await axiosInstance.patch(`/admin/users/${id}/status`, {
      is_active: false
    });
    return response.data;
  } catch (error) {
    console.error('❌ Deactivate user error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateUserStatus = async (id, isActive) => {
  try {
    const response = await axiosInstance.patch(`/admin/users/${id}/status`, {
      is_active: isActive
    });
    return response.data;
  } catch (error) {
    console.error('❌ Update user status error:', error.response?.data || error.message);
    throw error;
  }
};

// ===== ROLE MANAGEMENT APIs =====

export const changeUserRole = async (userId, newRole, reason = '') => {
  try {
    const response = await axiosInstance.put('/admin/role-management/change-role', {
      user_id: userId,
      new_role: newRole,
      reason: reason,
      bypass_approval: true // Supervisor can bypass approval
    });
    return response.data;
  } catch (error) {
    console.error('❌ Change user role error:', error.response?.data || error.message);
    throw error;
  }
};

export const getRoleManagementDashboard = async () => {
  try {
    const response = await axiosInstance.get('/admin/role-management/dashboard');
    return response.data;
  } catch (error) {
    console.error('❌ Get role management dashboard error:', error.response?.data || error.message);
    throw error;
  }
};
