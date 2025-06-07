// src/contexts/AuthProvider.jsx
import { useState, useEffect, useCallback } from 'react';
import AuthContext from './AuthContext';
import { getProfile, loginUser, logoutUser, refreshToken, registerUser } from '../api/authAPI';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles) => {
    return roles.includes(user?.role);
  }, [user]);

  // Check if user is staff (any staff role)
  const isStaff = useCallback(() => {
    const staffRoles = ['staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem'];
    return staffRoles.includes(user?.role);
  }, [user]);

  // Check if user is management (manager or supervisor)
  const isManagement = useCallback(() => {
    const managementRoles = ['manajer_futsal', 'supervisor_sistem'];
    return managementRoles.includes(user?.role);
  }, [user]);

  // Load user profile
  const loadUser = useCallback(async () => {
    try {
      // Check if token exists in localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('🔑 No token found in localStorage');
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }

      console.log('🔑 Token found, attempting to load profile...');
      const response = await getProfile();

      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        console.log('✅ Profile loaded successfully:', response.user.role);
        return true;
      } else {
        console.log('❌ Profile load failed:', response.error);
        // Clear invalid token
        localStorage.removeItem('auth_token');
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (err) {
      console.error('Error loading profile:', err);

      // Try to refresh token if profile load fails
      try {
        console.log('🔄 Attempting token refresh...');
        const refreshResponse = await refreshToken();
        if (refreshResponse.success) {
          // Retry loading profile after refresh
          const retryResponse = await getProfile();
          if (retryResponse.success && retryResponse.user) {
            setUser(retryResponse.user);
            setIsAuthenticated(true);
            console.log('✅ Profile loaded after token refresh');
            return true;
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      // Clear invalid token on error
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  useEffect(() => {
    // Skip auth check for public routes
    const publicRoutes = ['/login', '/register'];
    if (publicRoutes.includes(window.location.pathname)) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      await loadUser();
      setLoading(false);
    };

    initAuth();
  }, [loadUser]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await loginUser(credentials);

      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        console.log('✅ Login successful:', response.user.role);
        return { success: true, user: response.user };
      }

      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await registerUser(userData);

      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        console.log('✅ Registration successful:', response.user.role);
        return { success: true, user: response.user };
      }

      return { success: false, error: response.error || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const contextValue = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    loadUser,
    updateUser,
    setUser,
    // Role checking utilities
    hasRole,
    hasAnyRole,
    isStaff,
    isManagement
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
