// src/pages/staff/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getAllBookings, getBookingAnalyticsBasic } from "../../api";
import { getAllFields } from "../../api/fieldAPI";
import { getAllPayments } from "../../api/paymentAPI";
// Minimalist dashboards for all staff roles
import MinimalistSupervisorDashboard from "../../components/MinimalistSupervisorDashboard";
import MinimalistManagerDashboard from "../../components/MinimalistManagerDashboard";
import MinimalistKasirDashboard from "../../components/MinimalistKasirDashboard";
import MinimalistOperatorDashboard from "../../components/MinimalistOperatorDashboard";
import ErrorBoundary from "../../components/ErrorBoundary";

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    totalFields: 0,
    pendingPayments: 0,
    totalUsers: 0,
    activeUsers: 0,
    securityAlerts: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);

  // Supervisor-specific state - REMOVED: Using dedicated dashboard

  useEffect(() => {
    // Skip data loading for roles that use dedicated dashboards
    const rolesWithDedicatedDashboards = [
      'supervisor_sistem',
      'manajer_futsal',
      'staff_kasir',
      'operator_lapangan'
    ];

    // Only load data for roles that don't have dedicated dashboards
    if (!rolesWithDedicatedDashboards.includes(user?.role)) {
      loadDashboardData();
    } else {
      // For dedicated dashboards, just set loading to false
      console.log(`🎯 Skipping data loading for ${user?.role} - using dedicated dashboard`);
      setLoading(false);
    }
  }, []);

  // Debug useEffect to monitor stats changes
  useEffect(() => {
    console.log('📊 STATS STATE CHANGED:', stats);
  }, [stats]);

  // Debug useEffect to monitor supervisor data changes
  // Supervisor data effect removed - using dedicated dashboard

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading dashboard data for role:', user?.role);

      // Load bookings data
      console.log('📅 Loading bookings data...');
      const bookingsResponse = await getAllBookings({ limit: 5 });
      console.log('📅 Bookings response:', bookingsResponse);
      if (bookingsResponse.success) {
        setRecentBookings(bookingsResponse.data);
        setStats(prev => ({
          ...prev,
          totalBookings: bookingsResponse.total || bookingsResponse.data.length,
          pendingBookings: bookingsResponse.data.filter(b => b.status === 'pending').length
        }));
        console.log('✅ Bookings data loaded:', {
          total: bookingsResponse.total || bookingsResponse.data.length,
          pending: bookingsResponse.data.filter(b => b.status === 'pending').length
        });
      }

      // Load analytics if user has permission
      if (['manajer_futsal', 'supervisor_sistem'].includes(user?.role)) {
        try {
          console.log('📈 Loading analytics data...');
          const analyticsResponse = await getBookingAnalyticsBasic();
          console.log('📈 Analytics response:', analyticsResponse);
          if (analyticsResponse.success) {
            setStats(prev => ({
              ...prev,
              totalRevenue: analyticsResponse.data.totalRevenue || 0
            }));
            console.log('✅ Analytics data loaded:', analyticsResponse.data.totalRevenue || 0);
          }
        } catch (error) {
          console.log('❌ Analytics not available for this role:', error);
        }
      }

      // Supervisor data loading removed - using dedicated dashboard

      // Load fields count
      try {
        console.log('🏟️ Loading fields data...');
        const fieldsResponse = await getAllFields({ limit: 1 });
        console.log('🏟️ Fields response:', fieldsResponse);
        if (fieldsResponse.success) {
          // Only update fields count if supervisor data hasn't already set it
          setStats(prev => {
            const newFieldsCount = fieldsResponse.total || 4;
            console.log('🏟️ Fields count from API:', newFieldsCount);
            console.log('🏟️ Current totalFields in state:', prev.totalFields);

            // Don't overwrite supervisor data if it's already set
            if (prev.totalFields > 0 && user?.role === 'supervisor_sistem') {
              console.log('🏟️ Keeping supervisor fields count:', prev.totalFields);
              return prev;
            }

            return {
              ...prev,
              totalFields: newFieldsCount
            };
          });
          console.log('✅ Fields data loaded:', fieldsResponse.total || 4);
        }
      } catch (error) {
        console.log('❌ Fields data not available:', error);
      }

      // Load payments data for kasir and above
      if (['staff_kasir', 'manajer_futsal', 'supervisor_sistem'].includes(user?.role)) {
        try {
          console.log('💰 Loading payments data...');
          const paymentsResponse = await getAllPayments({ status: 'pending', limit: 1 });
          console.log('💰 Payments response:', paymentsResponse);
          if (paymentsResponse.success) {
            setStats(prev => ({
              ...prev,
              pendingPayments: paymentsResponse.total || 0
            }));
            console.log('✅ Payments data loaded:', paymentsResponse.total || 0);
          }
        } catch (error) {
          console.log('❌ Payments data not available:', error);
        }
      }

      // Final stats summary
      console.log('📊 FINAL DASHBOARD STATS SUMMARY:', stats);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get role-specific title and features
  const getRoleInfo = (role) => {
    switch (role) {
      case 'staff_kasir':
        return {
          title: 'Dashboard Kasir',
          description: 'Kelola pembayaran dan transaksi',
          color: 'green',
          features: ['Verifikasi Pembayaran', 'Laporan Keuangan']
        };
      case 'operator_lapangan':
        return {
          title: 'Dashboard Operator Lapangan',
          description: 'Kelola lapangan dan booking',
          color: 'blue',
          features: ['Status Lapangan', 'Konfirmasi Booking']
        };
      case 'manajer_futsal':
        return {
          title: 'Dashboard Manager',
          description: 'Analytics dan manajemen bisnis',
          color: 'purple',
          features: ['Business Analytics', 'Laporan Lengkap']
        };
      case 'supervisor_sistem':
        return {
          title: 'Dashboard Supervisor',
          description: 'Full system administration',
          color: 'red',
          features: ['System Admin', 'User Management']
        };
      default:
        return {
          title: 'Dashboard Staff',
          description: 'Staff dashboard',
          color: 'gray',
          features: ['Basic Access']
        };
    }
  };

  const roleInfo = getRoleInfo(user?.role);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Use minimalist dashboard for supervisor with error boundary - NO OLD DASHBOARD
  if (user?.role === 'supervisor_sistem') {
    return (
      <ErrorBoundary>
        <MinimalistSupervisorDashboard />
      </ErrorBoundary>
    );
  }

  // Use minimalist dashboard for manager with error boundary
  if (user?.role === 'manajer_futsal') {
    return (
      <ErrorBoundary>
        <MinimalistManagerDashboard />
      </ErrorBoundary>
    );
  }

  // Use minimalist dashboard for kasir with error boundary
  if (user?.role === 'staff_kasir') {
    return (
      <ErrorBoundary>
        <MinimalistKasirDashboard />
      </ErrorBoundary>
    );
  }

  // Use minimalist dashboard for operator with error boundary
  if (user?.role === 'operator_lapangan') {
    return (
      <ErrorBoundary>
        <MinimalistOperatorDashboard />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{roleInfo.title}</h1>
        <p className="text-gray-600 mt-1">Selamat datang, {user?.name || "Staff"} • {roleInfo.description}</p>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${user?.role === 'supervisor_sistem' ? 'lg:grid-cols-6' : 'lg:grid-cols-4'
        } gap-6 mb-8`}>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Booking</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Lapangan</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalFields}</p>
            </div>
          </div>
        </div>

        {['staff_kasir', 'manajer_futsal', 'supervisor_sistem'].includes(user?.role) && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payment</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingPayments}</p>
              </div>
            </div>
          </div>
        )}

        {/* Supervisor-specific stats - REMOVED: Using new dashboard */}
      </div>

      {/* Quick Actions & Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/staff/bookings")}
              className="w-full bg-gray-800 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-500 transition duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Kelola Booking
            </button>

            {['operator_lapangan', 'manajer_futsal', 'supervisor_sistem'].includes(user?.role) && (
              <button
                onClick={() => navigate("/staff/fields")}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                Kelola Lapangan
              </button>
            )}

            {['staff_kasir', 'manajer_futsal', 'supervisor_sistem'].includes(user?.role) && (
              <button
                onClick={() => navigate("/staff/payments")}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                Kelola Pembayaran
              </button>
            )}

            {['manajer_futsal', 'supervisor_sistem'].includes(user?.role) && (
              <button
                onClick={() => navigate("/staff/users")}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
                Kelola Pengguna
              </button>
            )}

            {/* Supervisor-specific actions - REMOVED: Using new dashboard */}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Terbaru</h2>
          {recentBookings.length > 0 ? (
            <div className="space-y-3">
              {recentBookings.slice(0, 5).map((booking, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.customer_name || 'Customer'} - Lapangan {booking.field_name || `#${index + 1}`}
                      </p>
                      <p className="text-sm text-gray-600">{booking.date || 'TBD'} • {booking.time_slot || 'TBD'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'confirmed' ? 'bg-gray-100 text-gray-900' :
                      booking.status === 'pending' ? 'bg-gray-100 text-gray-900' :
                        booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-900'
                      }`}>
                      {booking.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => navigate("/staff/bookings")}
                className="w-full text-gray-900 hover:text-gray-900 text-sm font-medium py-2"
              >
                Lihat Semua →
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <p className="text-gray-500">Belum ada booking terbaru</p>
            </div>
          )}
        </div>
      </div>

      {/* System Health, Revenue Analytics, Security Alerts, Advanced Features - REMOVED: Using new supervisor dashboard */}
    </div>
  );
};

export default StaffDashboard;
