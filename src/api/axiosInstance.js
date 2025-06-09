import axios from 'axios';

// API Base URL Configuration
const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development' || import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Determine base URL based on environment
let baseURL;
if (isProduction) {
  // Production: Use direct Railway API URL
  baseURL = 'https://booking-futsal-production.up.railway.app/api';
} else {
  // Development: Use Vite proxy
  baseURL = '/api';
}

// Environment configuration

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // Important for HttpOnly cookie authentication
  timeout: 15000, // 15 seconds timeout for production
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Add Origin header for production CORS
    ...(isProduction && {
      'Origin': 'https://booking-futsal-frontend.vercel.app'
    })
  },
});

// Request interceptor for authentication and debugging
axiosInstance.interceptors.request.use(
  (config) => {
    // Add Authorization header as fallback for cross-domain cookie issues
    const token = localStorage.getItem('auth_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }



    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {

    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login only if not already on login page
      if (!window.location.pathname.includes('/login')) {
        console.warn('⚠️ Unauthorized access - redirecting to login');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      console.warn('⚠️ Access forbidden - insufficient permissions');
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('🚨 Server error:', error.response?.data?.error || 'Internal server error');
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      // Network error
      console.error('🌐 Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
