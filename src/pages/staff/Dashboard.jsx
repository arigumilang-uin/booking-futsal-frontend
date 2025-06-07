// src/pages/staff/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getAllBookings, getBookingAnalyticsBasic } from "../../api";
import { getAllFields } from "../../api/fieldAPI";
import { getAllPayments } from "../../api/paymentAPI";
import {
  getSupervisorDashboard,
  getSystemHealth,
  getSystemConfig,
  formatSystemUptime,
  formatMemoryUsage
} from "../../api";
import UserManagementPanel from "../../components/UserManagementPanel";
import SystemMaintenancePanel from "../../components/SystemMaintenancePanel";
import NotificationsManagementPanel from "../../components/NotificationsManagementPanel";
import PromotionsManagementPanel from "../../components/PromotionsManagementPanel";
import FieldManagementPanel from "../../components/FieldManagementPanel";
import AdvancedAnalyticsPanel from "../../components/AdvancedAnalyticsPanel";
import MinimalistSupervisorDashboard from "../../components/MinimalistSupervisorDashboard";
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

  // Supervisor-specific state
  const [supervisorData, setSupervisorData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [systemConfig, setSystemConfig] = useState(null);
  // Supervisor tab management
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Debug useEffect to monitor stats changes
  useEffect(() => {
    console.log('📊 STATS STATE CHANGED:', stats);
  }, [stats]);

  // Debug useEffect to monitor supervisor data changes
  useEffect(() => {
    if (supervisorData) {
      console.log('🔧 SUPERVISOR DATA STATE CHANGED:', supervisorData);
    }
  }, [supervisorData]);

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

      // Load supervisor-specific data
      if (user?.role === 'supervisor_sistem') {
        try {
          console.log('🔧 Loading supervisor-specific data...');
          const [dashboardRes, healthRes, configRes] = await Promise.allSettled([
            getSupervisorDashboard(),
            getSystemHealth(),
            getSystemConfig()
          ]);

          console.log('🔧 Supervisor API responses:', {
            dashboard: dashboardRes.status,
            health: healthRes.status,
            config: configRes.status
          });

          if (dashboardRes.status === 'fulfilled' && dashboardRes.value.success) {
            const data = dashboardRes.value.data;
            setSupervisorData(data);

            // Fix data mapping to match actual backend response structure
            const newStats = {
              totalUsers: data.overview?.total_users || data.statistics?.users?.total || 0,
              activeUsers: data.statistics?.users?.active || data.overview?.total_users || 0,
              totalBookings: parseInt(data.overview?.total_bookings) || 0,
              totalRevenue: parseFloat(data.overview?.total_revenue) || 0,
              totalFields: parseInt(data.overview?.total_fields) || 0,
              activeFields: parseInt(data.overview?.active_fields) || 0,
              securityAlerts: data.security_alerts?.length || 0
            };

            console.log('🎯 NEW STATS TO SET:', newStats);

            setStats(prev => {
              const updatedStats = { ...prev, ...newStats };
              console.log('📊 PREVIOUS STATS:', prev);
              console.log('📊 UPDATED STATS:', updatedStats);
              return updatedStats;
            });

            console.log('✅ Supervisor dashboard data loaded:', {
              overview: data.overview,
              statistics: data.statistics,
              mappedStats: {
                totalUsers: data.overview?.total_users || data.statistics?.users?.total || 0,
                totalBookings: parseInt(data.overview?.total_bookings) || 0,
                totalRevenue: parseFloat(data.overview?.total_revenue) || 0,
                totalFields: parseInt(data.overview?.total_fields) || 0
              }
            });

            // Log current stats after supervisor data update
            console.log('📊 Stats after supervisor data update:', {
              totalUsers: data.overview?.total_users || data.statistics?.users?.total || 0,
              totalFields: parseInt(data.overview?.total_fields) || 0,
              totalBookings: parseInt(data.overview?.total_bookings) || 0,
              totalRevenue: parseFloat(data.overview?.total_revenue) || 0
            });
          }

          if (healthRes.status === 'fulfilled' && healthRes.value.success) {
            setSystemHealth(healthRes.value.data);
          }

          if (configRes.status === 'fulfilled' && configRes.value.success) {
            setSystemConfig(configRes.value.data);
          }

          // Database stats loaded in SystemMaintenancePanel
        } catch (error) {
          console.log('Supervisor data not available:', error);
        }
      }

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Use minimalist dashboard for supervisor with error boundary
  if (user?.role === 'supervisor_sistem') {
    return (
      <ErrorBoundary>
        <MinimalistSupervisorDashboard />
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
      <div className={`grid grid-cols-1 md:grid-cols-2 ${
        user?.role === 'supervisor_sistem' ? 'lg:grid-cols-6' : 'lg:grid-cols-4'
      } gap-6 mb-8`}>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Supervisor-specific stats */}
        {user?.role === 'supervisor_sistem' && (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Security Alerts</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.securityAlerts}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions & Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/staff/bookings")}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
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

            {/* Supervisor-specific actions - REMOVED DUPLICATE ANALYTICS BUTTON */}
            {user?.role === 'supervisor_sistem' && (
              <div className="text-center py-4 text-gray-600">
                <p className="text-sm">✅ Semua fitur analytics dan audit tersedia di Supervisor Dashboard</p>
                <p className="text-xs mt-1">Tidak perlu halaman terpisah - semua terintegrasi!</p>
              </div>
            )}
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
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => navigate("/staff/bookings")}
                className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium py-2"
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

      {/* System Health Section - Supervisor Only */}
      {user?.role === 'supervisor_sistem' && systemHealth && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 System Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Database Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  systemHealth.system_health?.status === 'healthy'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {systemHealth.system_health?.status || 'Unknown'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">System Uptime:</span>
                <span className="font-medium">
                  {formatSystemUptime(systemHealth.server_info?.uptime || 0)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Memory Usage:</span>
                <span className="font-medium">
                  {formatMemoryUsage(systemHealth.server_info?.memory_usage?.heapUsed || 0)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Environment:</span>
                <span className="font-medium">
                  {systemHealth.server_info?.environment || 'Unknown'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Node Version:</span>
                <span className="font-medium">
                  {systemHealth.server_info?.node_version || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* System Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ System Configuration</h3>
            {systemConfig ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Database:</span>
                  <span className="font-medium">{String(systemConfig.database_url || 'N/A')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">JWT Secret:</span>
                  <span className="font-medium">{String(systemConfig.jwt_secret || 'N/A')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Port:</span>
                  <span className="font-medium">{String(systemConfig.port || 'N/A')}</span>
                </div>

                {systemConfig.features && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Active Features:</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {Object.entries(systemConfig.features).slice(0, 4).map(([feature, enabled]) => (
                        <div key={feature} className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${enabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-sm">{feature.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Memuat konfigurasi sistem...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Revenue Analytics for Manager and Supervisor */}
      {['manajer_futsal', 'supervisor_sistem'].includes(user?.role) && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                Rp {stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {Math.round((stats.totalBookings / 30) * 100) / 100}
              </p>
              <p className="text-sm text-gray-600">Avg Bookings/Day</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {stats.totalRevenue > 0 ? Math.round(stats.totalRevenue / stats.totalBookings).toLocaleString() : 0}
              </p>
              <p className="text-sm text-gray-600">Avg Revenue/Booking</p>
            </div>
          </div>
        </div>
      )}

      {/* Security Alerts - Supervisor Only */}
      {user?.role === 'supervisor_sistem' && supervisorData?.security_alerts && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔒 Security Alerts</h3>
          {supervisorData.security_alerts.length > 0 ? (
            <div className="space-y-3">
              {supervisorData.security_alerts.slice(0, 5).map((alert, index) => (
                <div key={index} className="border-l-4 border-red-500 bg-red-50 p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-red-800">{alert.type}</p>
                      <p className="text-sm text-red-600">{alert.user_email}</p>
                    </div>
                    <span className="text-xs text-red-500">
                      {new Date(alert.timestamp).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    {alert.count} percobaan gagal
                  </p>
                </div>
              ))}

              {supervisorData.security_alerts.length > 5 && (
                <div className="text-center pt-3">
                  <button
                    onClick={() => navigate("/staff/analytics")}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Lihat semua alerts ({supervisorData.security_alerts.length}) →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <p>Tidak ada security alerts</p>
              <p className="text-sm">Sistem aman</p>
            </div>
          )}
        </div>
      )}

      {/* Supervisor Advanced Features */}
      {user?.role === 'supervisor_sistem' && (
        <div className="mt-8 bg-white rounded-lg shadow">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'analytics', label: 'Advanced Analytics', icon: '📈' },
                { id: 'users', label: 'User Management', icon: '👥' },
                { id: 'fields', label: 'Field Management', icon: '🏟️' },
                { id: 'notifications', label: 'Notifications', icon: '🔔' },
                { id: 'promotions', label: 'Promotions', icon: '🎯' },
                { id: 'maintenance', label: 'System Maintenance', icon: '🔧' },
                { id: 'settings', label: 'System Settings', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="text-center py-8 text-gray-500">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Supervisor Overview</h3>
                <p>Dashboard overview sudah ditampilkan di atas. Gunakan tab lain untuk mengakses fitur advanced.</p>
              </div>
            )}

            {activeTab === 'analytics' && <AdvancedAnalyticsPanel />}

            {activeTab === 'users' && <UserManagementPanel />}

            {activeTab === 'fields' && <FieldManagementPanel />}

            {activeTab === 'notifications' && <NotificationsManagementPanel />}

            {activeTab === 'promotions' && <PromotionsManagementPanel />}

            {activeTab === 'maintenance' && <SystemMaintenancePanel />}

            {activeTab === 'settings' && (
              <div className="text-center py-8 text-gray-500">
                <h3 className="text-lg font-medium text-gray-900 mb-2">System Settings</h3>
                <p>Gunakan Analytics & Audit menu untuk mengakses system settings lengkap.</p>
                <button
                  onClick={() => navigate("/staff/analytics")}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Go to Analytics & Settings
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
