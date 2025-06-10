// src/components/MinimalistManagerDashboard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import { getManagerDashboard, getManagerBookings } from '../api/managerAPI';
import axiosInstance from '../api/axiosInstance';
import MinimalistManagerHeader from './MinimalistManagerHeader';
import ManagerBookingPanel from './manager/ManagerBookingPanel';
import ManagerStaffPanel from './manager/ManagerStaffPanel';
import ManagerFieldAssignmentPanel from './manager/ManagerFieldAssignmentPanel';



const ReportsPanel = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Laporan Bisnis</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg text-center">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-gray-900">📊</span>
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">Laporan Harian</h3>
        <p className="text-red-700 mb-4">Ringkasan aktivitas harian.</p>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-gray-100 p-6 rounded-lg text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-white">📈</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Laporan Bulanan</h3>
        <p className="text-gray-500 mb-4">Analisis performa bulanan.</p>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-gray-100 p-6 rounded-lg text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-white">💰</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Laporan Keuangan</h3>
        <p className="text-gray-500 mb-4">Detail pendapatan dan transaksi.</p>
      </div>
    </div>
  </div>
);

const MinimalistManagerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [businessMetrics, setBusinessMetrics] = useState(null);
  const [activeView, setActiveView] = useState('overview');

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Load data from multiple endpoints since manager dashboard might not be fully implemented
      const [bookingsResponse, usersResponse] = await Promise.all([
        getManagerBookings({ limit: 10 }),
        axiosInstance.get('/admin/users')
      ]);

      // Process bookings data
      const bookings = bookingsResponse.success ? bookingsResponse.data : [];
      const recentBookings = Array.isArray(bookings) ? bookings.slice(0, 5) : [];

      // Process staff data - Filter only staff roles that manager can manage
      const allUsers = usersResponse.data?.success ? usersResponse.data.data?.users || [] : [];
      const staffOnly = allUsers.filter(user =>
        user.role === 'staff_kasir' || user.role === 'operator_lapangan'
      );

      // Get real staff performance data
      const staffPerformance = await Promise.all(
        staffOnly.slice(0, 5).map(async (staff) => {
          let performanceData = {
            total_amount: 0,
            processed_payments: 0,
            bookings_confirmed: 0,
            tasks_completed: 0
          };

          try {
            if (staff.role === 'staff_kasir') {
              // For kasir: get payment data
              const paymentResponse = await axiosInstance.get('/staff/kasir/statistics');
              if (paymentResponse.data.success) {
                const stats = paymentResponse.data.data;
                performanceData.total_amount = stats.total_revenue || 0;
                performanceData.processed_payments = stats.total_payments || 0;
              }
            } else if (staff.role === 'operator_lapangan') {
              // For operator: get booking confirmation data
              const operatorResponse = await axiosInstance.get(`/staff/operator/performance/${staff.id}`);
              if (operatorResponse.data.success) {
                const stats = operatorResponse.data.data;
                performanceData.bookings_confirmed = stats.bookings_confirmed || 0;
                performanceData.tasks_completed = stats.maintenance_tasks || 0;
              }
            }
          } catch (error) {
            console.log(`⚠️ Performance data not available for ${staff.name}:`, error.message);
          }

          return {
            id: staff.id,
            name: staff.name || 'Staff',
            role: staff.role === 'staff_kasir' ? 'Staff Kasir' :
              staff.role === 'operator_lapangan' ? 'Operator Lapangan' :
                staff.role || 'Staff',
            email: staff.email,
            is_active: staff.is_active,
            ...performanceData,
            last_login: staff.last_login_at,
            status: staff.is_active ? 'Aktif' : 'Nonaktif'
          };
        })
      );

      // Calculate metrics from actual data
      const totalBookings = bookings.length;
      const pendingBookings = bookings.filter(b => b.status === 'pending').length;
      const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

      // Calculate total revenue with proper number conversion
      const totalRevenue = bookings.reduce((sum, b) => {
        const amount = parseFloat(b.total_amount) || 0;
        return sum + amount;
      }, 0);

      console.log('Manager Dashboard - Revenue calculation:', {
        totalBookings,
        bookingsData: bookings.map(b => ({ id: b.id, total_amount: b.total_amount, parsed: parseFloat(b.total_amount) })),
        totalRevenue
      });

      // Format currency properly like supervisor
      const formatCurrency = (amount) => {
        if (isNaN(amount) || amount === null || amount === undefined) {
          return '0';
        }
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(amount).replace('IDR', '').trim();
      };

      setDashboardData({
        business_metrics: {
          total_bookings: totalBookings,
          monthly_revenue: formatCurrency(totalRevenue),
          customer_growth: '15%', // Placeholder
          field_utilization: '75%' // Placeholder
        },
        pending_bookings: bookings.filter(b => b.status === 'pending'),
        confirmed_bookings: bookings.filter(b => b.status === 'confirmed'),
        recent_bookings: recentBookings,
        staff_performance: staffPerformance
      });

    } catch (error) {
      console.error('Error loading manager dashboard data:', error);
      // Fallback to empty data structure
      setDashboardData({
        business_metrics: {
          total_bookings: 0,
          monthly_revenue: '0',
          customer_growth: '0%',
          field_utilization: '0%'
        },
        pending_bookings: [],
        confirmed_bookings: [],
        recent_bookings: [],
        staff_performance: []
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Memoized overview data
  const overview = useMemo(() => {
    if (!dashboardData) return {};

    return {
      total_bookings: dashboardData.business_metrics?.total_bookings || 0,
      monthly_revenue: dashboardData.business_metrics?.monthly_revenue || '0',
      customer_growth: dashboardData.business_metrics?.customer_growth || '0%',
      field_utilization: dashboardData.business_metrics?.field_utilization || '0%',
      pending_bookings: dashboardData.pending_bookings?.length || 0,
      confirmed_bookings: dashboardData.confirmed_bookings?.length || 0,
      staff_performance: dashboardData.staff_performance || []
    };
  }, [dashboardData]);

  // Navigation items for manager - sesuai kapasitas manager
  const navigationItems = [
    { id: 'overview', label: 'Ringkasan Bisnis', icon: '📊', color: 'blue' },
    { id: 'bookings', label: 'Kelola Booking', icon: '📅', color: 'green' },
    { id: 'staff', label: 'Kelola Staff', icon: '👥', color: 'orange' },
    { id: 'fields', label: 'Assignment Lapangan', icon: '🏟️', color: 'indigo' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-gray-800 mx-auto mb-8 shadow-xl"></div>
            <div className="absolute inset-0 rounded-full bg-gray-100 opacity-30 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">Loading Business Center</h2>
            <p className="text-gray-900 font-medium">Preparing your management dashboard...</p>
            <div className="flex justify-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-gray-800 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden" style={{
      backgroundImage: `
        linear-gradient(90deg, rgba(31, 41, 55, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(31, 41, 55, 0.06) 0%, transparent 50%),
        linear-gradient(90deg, rgba(31, 41, 55, 0.04) 1px, transparent 1px),
        linear-gradient(rgba(31, 41, 55, 0.04) 1px, transparent 1px)
      `,
      backgroundSize: '100% 100%, 100% 100%, 30px 30px, 30px 30px'
    }}>
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gray-200 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-gray-800 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-400 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      {/* Manager Header */}
      <MinimalistManagerHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Refresh Button - Manager Style */}
        <div className="flex justify-end">
          <button
            onClick={loadDashboardData}
            className="bg-gradient-to-r from-gray-800 to-gray-800 hover:from-gray-800 hover:to-gray-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>🔄</span>
            <span className="font-medium">Muat Ulang Dashboard</span>
          </button>
        </div>

        {/* Business Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="group bg-white p-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-800 to-gray-800"></div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-bold text-gray-900 mb-1">{overview?.total_bookings || 0}</div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Total Booking</div>
                <div className="text-xs text-gray-500">Bulan ini</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0 ml-2">
                <span className="text-xl">📅</span>
              </div>
            </div>
          </div>

          <div className="group bg-white p-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-800 to-gray-800"></div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold text-gray-900 mb-1 truncate">
                  {overview?.monthly_revenue ? `Rp ${overview.monthly_revenue}` : 'Rp 0'}
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Pendapatan</div>
                <div className="text-xs text-gray-500">Bulan ini</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0 ml-2">
                <span className="text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="group bg-white p-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-800 to-gray-800"></div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-bold text-gray-900 mb-1">{overview?.customer_growth || '0%'}</div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Pertumbuhan</div>
                <div className="text-xs text-gray-500">Customer baru</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0 ml-2">
                <span className="text-xl">📈</span>
              </div>
            </div>
          </div>

          <div className="group bg-white p-4 rounded-2xl shadow-lg border border-orange-100 hover:shadow-2xl hover:border-orange-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-bold text-gray-900 mb-1">{overview?.field_utilization || '0%'}</div>
                <div className="text-sm font-semibold text-orange-600 mb-1">Utilisasi</div>
                <div className="text-xs text-gray-500">Lapangan</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0 ml-2">
                <span className="text-xl">🏟️</span>
              </div>
            </div>
          </div>

          <div className="group bg-white p-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-800 to-gray-800"></div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-bold text-gray-900 mb-1">{overview?.pending_bookings || 0}</div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Menunggu</div>
                <div className="text-xs text-gray-500">Konfirmasi</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0 ml-2">
                <span className="text-xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="group bg-white p-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-800 to-gray-800"></div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-bold text-gray-900 mb-1">{overview?.confirmed_bookings || 0}</div>
                <div className="text-sm font-semibold text-gray-800 mb-1">Terkonfirmasi</div>
                <div className="text-xs text-gray-500">Hari ini</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0 ml-2">
                <span className="text-xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 backdrop-blur-sm">
          <div className="flex flex-wrap gap-3">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`group flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden ${activeView === item.id
                  ? `bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 text-gray-900 shadow-2xl transform scale-105`
                  : `text-${item.color}-600 hover:bg-gradient-to-r hover:from-${item.color}-50 hover:to-${item.color}-100 hover:text-${item.color}-700 hover:shadow-lg hover:-translate-y-0.5`
                  }`}
              >
                {activeView === item.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50"></div>
                )}
                <span className="text-xl relative z-10 group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                <span className="hidden sm:inline relative z-10 font-medium">{item.label}</span>
                {activeView === item.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Panels */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 backdrop-blur-sm">
          {activeView === 'overview' && (
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-gray-900">📊</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Ringkasan Bisnis Manager</h2>
                  <p className="text-gray-600">Overview performa bisnis dan operasional</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Bookings */}
                <div className="bg-gradient-to-br from-green-50 to-gray-100 p-8 rounded-2xl shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-xl text-gray-900">📅</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Booking Terbaru</h3>
                  </div>
                  <div className="space-y-4">
                    {dashboardData?.recent_bookings?.slice(0, 5).map((booking, index) => (
                      <div key={index} className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">👤</span>
                              <p className="font-bold text-gray-900 text-lg">{booking.customer_name || 'Customer'}</p>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <span>🏟️</span>
                                <span>{booking.field_name || 'Lapangan'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>📅</span>
                                <span>{booking.date || 'TBD'}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-2 rounded-xl text-sm font-semibold shadow-sm ${booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              booking.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                                  'bg-gray-100 text-gray-900 border border-gray-200'
                            }`}>
                            {booking.status === 'confirmed' ? 'Dikonfirmasi' :
                              booking.status === 'pending' ? 'Menunggu' :
                                booking.status === 'completed' ? 'Selesai' :
                                  booking.status === 'cancelled' ? 'Dibatalkan' :
                                    booking.status || 'pending'}
                          </span>
                        </div>
                      </div>
                    )) || (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📅</span>
                          </div>
                          <p className="text-gray-500 text-lg font-medium">Belum ada booking terbaru</p>
                          <p className="text-gray-400 text-sm mt-1">Data booking akan muncul di sini</p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Staff Performance */}
                <div className="bg-gradient-to-br from-blue-50 to-gray-100 p-8 rounded-2xl shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-xl text-gray-900">👥</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Performa Staff</h3>
                  </div>
                  <div className="space-y-4">
                    {overview?.staff_performance?.slice(0, 5).map((staff, index) => (
                      <div key={index} className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">
                                {staff.role === 'Staff Kasir' ? '💰' :
                                  staff.role === 'Operator Lapangan' ? '🏟️' : '👤'}
                              </span>
                              <p className="font-bold text-gray-900 text-lg">{staff.name || 'Staff'}</p>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">{staff.role || 'Staff Role'}</p>
                          </div>
                          <div className="text-right">
                            {staff.role === 'Staff Kasir' ? (
                              <>
                                <p className="text-lg font-bold text-gray-900">
                                  Rp {staff.total_amount ? parseFloat(staff.total_amount).toLocaleString('id-ID') : '0'}
                                </p>
                                <p className="text-sm text-gray-600">{staff.processed_payments || 0} pembayaran</p>
                              </>
                            ) : staff.role === 'Operator Lapangan' ? (
                              <>
                                <p className="text-lg font-bold text-gray-900">
                                  {staff.bookings_confirmed || 0} booking
                                </p>
                                <p className="text-sm text-gray-600">dikonfirmasi</p>
                              </>
                            ) : (
                              <>
                                <p className="text-lg font-bold text-gray-900">-</p>
                                <p className="text-sm text-gray-600">No data</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )) || (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">👥</span>
                          </div>
                          <p className="text-gray-500 text-lg font-medium">Data performa staff tidak tersedia</p>
                          <p className="text-gray-400 text-sm mt-1">Performa staff akan ditampilkan di sini</p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'bookings' && <ManagerBookingPanel />}
          {activeView === 'staff' && <ManagerStaffPanel />}
          {activeView === 'fields' && <ManagerFieldAssignmentPanel />}
        </div>
      </div>
    </div>
  );
};

export default MinimalistManagerDashboard;
