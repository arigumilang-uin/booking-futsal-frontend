// src/api/authAPI.js
import axiosInstance from './axiosInstance';

/**
 * Authentication API calls
 * Updated to match backend enhanced authentication system
 */

export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login', credentials);

    // Handle backend response structure: { success: true, message: "Login berhasil", data: { user: {...}, token: "..." } }
    if (response.data.success) {
      // Store token from response data
      if (response.data.data?.token) {
        localStorage.setItem('auth_token', response.data.data.token);
      } else if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }

      // Return normalized response
      return {
        success: true,
        user: response.data.data?.user || response.data.user,
        message: response.data.message || 'Login successful'
      };
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

    // Handle backend response structure: { success: true, message: "Registration successful", data: { user: {...}, token: "..." } }
    if (response.data.success) {
      // Store token from response data
      if (response.data.data?.token) {
        localStorage.setItem('auth_token', response.data.data.token);
      } else if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }

      // Return normalized response
      return {
        success: true,
        user: response.data.data?.user || response.data.user,
        message: response.data.message || 'Registration successful'
      };
    }

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

    // Handle backend response structure: { success: true, data: { user: {...} } }
    if (response.data.success && response.data.data?.user) {
      return {
        success: true,
        user: response.data.data.user
      };
    }

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

export const refreshToken = async () => {
  try {
    const response = await axiosInstance.post('/auth/refresh');

    // Update stored token if provided
    if (response.data.success && response.data.data?.token) {
      localStorage.setItem('auth_token', response.data.data.token);
    }

    return response.data;
  } catch (error) {
    console.error('❌ Refresh token error:', error.response?.data || error.message);
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

// Email verification functions
export const sendEmailVerification = async () => {
  try {
    const response = await axiosInstance.post('/auth/send-verification');
    return response.data;
  } catch (error) {
    console.error('❌ Send verification error:', error.response?.data || error.message);
    throw error;
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await axiosInstance.post('/auth/verify-email', { token });
    return response.data;
  } catch (error) {
    console.error('❌ Verify email error:', error.response?.data || error.message);
    throw error;
  }
};

// Password reset functions
export const requestPasswordReset = async (email) => {
  try {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('❌ Request password reset error:', error.response?.data || error.message);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axiosInstance.post('/auth/reset-password', {
      token,
      password: newPassword
    });
    return response.data;
  } catch (error) {
    console.error('❌ Reset password error:', error.response?.data || error.message);
    throw error;
  }
};

export const validateResetToken = async (token) => {
  try {
    const response = await axiosInstance.get(`/auth/reset-password/${token}`);
    return response.data;
  } catch (error) {
    console.error('❌ Validate reset token error:', error.response?.data || error.message);
    throw error;
  }
};