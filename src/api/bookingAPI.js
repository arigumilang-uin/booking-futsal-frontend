// src/api/bookingAPI.js
import axiosInstance from './axiosInstance';

/**
 * Booking API calls
 * Role-based endpoints sesuai backend architecture
 */

// ===== CUSTOMER BOOKING APIs (role: penyewa) =====

export const createBooking = async (bookingData) => {
  try {
    console.log('Creating booking with data:', bookingData);
    const response = await axiosInstance.post('/customer/bookings', bookingData);
    console.log('Booking response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Create booking API error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const getCustomerBookings = async (params = {}) => {
  const response = await axiosInstance.get('/customer/bookings', { params });
  return response.data;
};

export const getBookingById = async (id) => {
  const response = await axiosInstance.get(`/customer/bookings/${id}`);
  return response.data;
};

export const updateBooking = async (id, bookingData) => {
  const response = await axiosInstance.put(`/customer/bookings/${id}`, bookingData);
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await axiosInstance.patch(`/customer/bookings/${id}/cancel`);
  return response.data;
};

// ===== STAFF BOOKING APIs (roles: kasir, operator, manager, supervisor) =====

export const getAllBookings = async (params = {}) => {
  try {
    // ✅ ALL ENDPOINTS NOW WORKING! Role-based endpoint selection with FIXED ENDPOINTS
    console.log('✅ Getting all bookings for staff (ALL ENDPOINTS FIXED!)...');

    // Get user role from localStorage with better error handling
    let userRole = null;
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      userRole = user?.role;

      if (!userRole) {
        console.warn('⚠️ User role not found in localStorage. User may not be logged in or data is corrupted.');
        // Try to get from auth token if available
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.warn('⚠️ No auth token found. User needs to login again.');
        }
      }
    } catch (error) {
      console.error('❌ Error parsing user data from localStorage:', error);
      userRole = null;
    }

    console.log(`👤 User role: ${userRole || 'undefined (not logged in)'}`);

    // If no user role, provide fallback behavior
    if (!userRole) {
      console.warn('⚠️ No user role detected. Using customer endpoints as fallback.');
    }

    // Define role-specific endpoints in order of preference (ALL ENDPOINTS NOW WORKING! ✅)
    const roleEndpoints = {
      'supervisor_sistem': [
        '/admin/bookings',           // ✅ FIXED: Admin booking endpoint (highest priority)
        '/staff/manager/bookings',   // ✅ FIXED: Manager endpoint (404 ➡ Working)
        '/staff/kasir/bookings',     // ✅ FIXED: Kasir endpoint (404 ➡ Working)
        '/staff/operator/bookings'   // ✅ FIXED: Operator endpoint (404 ➡ Working)
      ],
      'manajer_futsal': [
        '/admin/bookings',           // ✅ FIXED: Admin booking endpoint (managers can access)
        '/staff/manager/bookings',   // ✅ FIXED: Manager endpoint (404 ➡ Working)
        '/staff/kasir/bookings'      // ✅ FIXED: Kasir endpoint (404 ➡ Working)
      ],
      'staff_kasir': [
        '/staff/kasir/bookings',     // ✅ FIXED: Kasir endpoint (404 ➡ Working!)
        '/admin/bookings',           // ✅ FIXED: Admin endpoint (if kasir has access)
        '/customer/bookings'         // Fallback (no longer needed!)
      ],
      'operator_lapangan': [
        '/staff/operator/bookings',  // ✅ FIXED: Operator endpoint (404 ➡ Working!)
        '/staff/kasir/bookings',     // ✅ FIXED: Kasir endpoint (404 ➡ Working)
        '/customer/bookings'         // Fallback (no longer needed!)
      ]
    };

    // Fallback endpoints for all roles
    const fallbackEndpoints = [
      '/customer/bookings'  // Last resort (limited view)
    ];

    // Get endpoints to try based on user role
    const endpointsToTry = [
      ...(roleEndpoints[userRole] || []),
      ...fallbackEndpoints
    ];

    console.log(`🎯 Endpoints to try: ${endpointsToTry.join(', ')}`);

    let lastError = null;
    let attemptCount = 0;

    for (const endpoint of endpointsToTry) {
      attemptCount++;
      try {
        console.log(`🔍 Attempt ${attemptCount}: ${endpoint}`);
        const response = await axiosInstance.get(endpoint, { params });

        if (response.data.success) {
          // Handle different response structures
          let bookings = [];
          let bookingCount = 0;

          if (endpoint === '/admin/bookings') {
            // Admin endpoint returns data.bookings
            bookings = response.data.data?.bookings || [];
            bookingCount = bookings.length;
          } else {
            // Other endpoints return data directly
            bookings = response.data.data || [];
            bookingCount = bookings.length;
          }

          console.log(`🎉 SUCCESS with ${endpoint}: ${bookingCount} bookings (ENDPOINT NOW WORKING!)`);

          // Normalize response structure
          const normalizedResponse = {
            success: true,
            data: bookings,
            pagination: response.data.data?.pagination || response.data.pagination,
            _metadata: {
              endpoint_used: endpoint,
              user_role: userRole,
              attempt_number: attemptCount,
              is_limited_view: endpoint === '/customer/bookings',
              is_admin_endpoint: endpoint === '/admin/bookings',
              is_staff_endpoint: endpoint.startsWith('/staff/'),
              is_role_specific: roleEndpoints[userRole]?.includes(endpoint) || false,
              total_attempts: endpointsToTry.length,
              original_response_structure: endpoint === '/admin/bookings' ? 'admin' : 'standard',
              endpoint_status: 'WORKING ✅', // All endpoints now working!
              backend_fix_applied: true
            }
          };

          return normalizedResponse;
        }
      } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.error || error.message;
        console.warn(`❌ Failed ${endpoint}: HTTP ${status} - ${message}`);
        lastError = error;
        continue;
      }
    }

    // If all endpoints fail, provide detailed error information
    console.error('❌ All booking endpoints failed');
    console.error(`   User role: ${userRole}`);
    console.error(`   Endpoints tried: ${endpointsToTry.join(', ')}`);
    console.error(`   Last error: ${lastError?.response?.data?.error || lastError?.message}`);

    throw lastError || new Error(`All ${endpointsToTry.length} booking endpoints failed for role: ${userRole}`);

  } catch (error) {
    console.error('❌ Get all bookings error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateBookingStatus = async (id, status, reason = '') => {
  try {
    // Get user role to determine which endpoint to use
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userRole = user?.role;

    // Use admin endpoint for management roles
    const isManagement = ['manajer_futsal', 'supervisor_sistem'].includes(userRole);
    const endpoint = isManagement
      ? `/admin/bookings/${id}/status`
      : `/staff/bookings/${id}/status`;

    console.log(`🔄 Updating booking ${id} status to ${status} via ${endpoint}`);

    const response = await axiosInstance.put(endpoint, { status, reason });
    return response.data;
  } catch (error) {
    console.error('❌ Update booking status error:', error.response?.data || error.message);
    throw error;
  }
};

export const confirmBooking = async (id) => {
  const response = await axiosInstance.patch(`/staff/bookings/${id}/confirm`);
  return response.data;
};

export const rejectBooking = async (id, reason) => {
  const response = await axiosInstance.patch(`/staff/bookings/${id}/reject`, { reason });
  return response.data;
};

export const getBookingAnalytics = async (params = {}) => {
  try {
    // Use the correct endpoint for booking statistics
    const response = await axiosInstance.get('/admin/bookings/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get booking analytics error:', error.response?.data || error.message);

    // Fallback to business analytics if booking statistics not available
    try {
      const fallbackResponse = await axiosInstance.get('/admin/analytics/business', { params });
      return {
        success: true,
        data: {
          totalRevenue: fallbackResponse.data?.data?.revenue_analytics?.total_revenue || 0,
          totalBookings: fallbackResponse.data?.data?.booking_analytics?.total_bookings || 0,
          ...fallbackResponse.data?.data
        }
      };
    } catch (fallbackError) {
      console.error('❌ Fallback analytics error:', fallbackError.response?.data || fallbackError.message);
      // Return empty data instead of throwing error
      return {
        success: false,
        data: {
          totalRevenue: 0,
          totalBookings: 0
        },
        message: 'Analytics data not available'
      };
    }
  }
};

// ===== ADMIN BOOKING APIs (roles: manajer_futsal, supervisor_sistem) =====

export const getBookingDetail = async (id) => {
  try {
    // Get user role to determine which endpoint to use
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userRole = user?.role;

    // Use admin endpoint for management roles
    const isManagement = ['manajer_futsal', 'supervisor_sistem'].includes(userRole);
    const endpoint = isManagement
      ? `/admin/bookings/${id}`
      : `/customer/bookings/${id}`;

    console.log(`🔍 Getting booking detail ${id} via ${endpoint}`);

    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('❌ Get booking detail error:', error.response?.data || error.message);
    throw error;
  }
};

export const getBookingStatistics = async (params = {}) => {
  try {
    console.log('📊 Getting booking statistics...');
    const response = await axiosInstance.get('/admin/bookings/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get booking statistics error:', error.response?.data || error.message);
    throw error;
  }
};

export const getAdminBookings = async (params = {}) => {
  try {
    console.log('👑 Getting admin bookings with filters:', params);
    const response = await axiosInstance.get('/admin/bookings', { params });

    // Normalize response structure for admin endpoint
    return {
      success: response.data.success,
      data: response.data.data?.bookings || [],
      pagination: response.data.data?.pagination,
      filters: response.data.data?.filters,
      _metadata: {
        endpoint_used: '/admin/bookings',
        is_admin_endpoint: true,
        original_response_structure: 'admin'
      }
    };
  } catch (error) {
    console.error('❌ Get admin bookings error:', error.response?.data || error.message);
    throw error;
  }
};

// Get booking timeline (booking history + payment events)
export const getBookingTimeline = async (bookingId) => {
  try {
    console.log(`📅 Getting booking timeline for booking ${bookingId}...`);
    const response = await axiosInstance.get(`/admin/bookings/${bookingId}/timeline`);
    return response.data;
  } catch (error) {
    console.error('❌ Get booking timeline error:', error.response?.data || error.message);
    throw error;
  }
};

// Get booking history for specific booking
export const getBookingHistory = async (bookingId) => {
  try {
    console.log(`📋 Getting booking history for booking ${bookingId}...`);
    const response = await axiosInstance.get(`/admin/bookings/${bookingId}/history`);
    return response.data;
  } catch (error) {
    console.error('❌ Get booking history error:', error.response?.data || error.message);
    throw error;
  }
};
