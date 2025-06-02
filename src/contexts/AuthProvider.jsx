// src/contexts/AuthProvider.jsx
import { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import { getProfile, loginUser, logoutUser } from '../api/authAPI';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth check for public routes
    const publicRoutes = ['/login', '/register'];
    if (publicRoutes.includes(window.location.pathname)) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.log('🔑 No token found in localStorage');
          setUser(null);
          setLoading(false);
          return;
        }

        console.log('🔑 Token found in localStorage, attempting to load profile...');
        const response = await getProfile();
        if (response.success) {
          setUser(response.user);
          console.log('✅ Profile loaded successfully');
        } else {
          console.log('❌ Profile load failed:', response.error);
          // Clear invalid token
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        // Clear invalid token on error
        localStorage.removeItem('auth_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      if (response.success) {
        setUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, error: response.error };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
