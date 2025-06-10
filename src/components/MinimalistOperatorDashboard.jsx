// src/components/MinimalistOperatorDashboard.jsx
// MODERN OPERATOR DASHBOARD - SESUAI TEMA SUPERVISOR/MANAGER
import { useState, useEffect, useCallback, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import {
  getOperatorDashboard,
  getAllBookingsForOperator,
  getAssignedFields,
  getOperatorStatistics
} from '../api/operatorAPI';
import MinimalistOperatorHeader from './MinimalistOperatorHeader';
import OperatorFieldPanel from './operator/OperatorFieldPanel';
import OperatorBookingPanel from './operator/OperatorBookingPanel';



const MinimalistOperatorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    operator_info: {},
    assigned_fields: [],
    today_bookings: [],
    upcoming_bookings: [],
    pending_bookings: [],
    statistics: {},
    field_metrics: {}
  });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      setError(null);

      // Load operator dashboard data from backend
      const [dashboardResponse, bookingsResponse, fieldsResponse, statisticsResponse] = await Promise.all([
        getOperatorDashboard(),
        getAllBookingsForOperator({ limit: 20 }),
        getAssignedFields(),
        getOperatorStatistics()
      ]);

      // Process dashboard data
      if (dashboardResponse.success) {
        const dashboardInfo = dashboardResponse.data;

        // Process bookings data with validation
        const bookingsData = bookingsResponse.success ? bookingsResponse.data : [];
        const fieldsData = fieldsResponse.success ? fieldsResponse.data : [];
        const statsData = statisticsResponse.success ? statisticsResponse.data : {};

        // Ensure data is in array format
        const bookings = Array.isArray(bookingsData) ? bookingsData : [];
        const fields = Array.isArray(fieldsData) ? fieldsData : [];
        const stats = statsData || {};

        console.log('📊 Operator Dashboard Data:', {
          bookings: bookings.length,
          fields: fields.length,
          bookingsType: typeof bookingsData,
          fieldsType: typeof fieldsData
        });

        // Calculate metrics with safe array operations
        const todayBookings = bookings.filter(b => {
          const today = new Date().toISOString().split('T')[0];
          return b && b.date === today;
        });

        const activeBookings = bookings.filter(b => b && b.status === 'confirmed');
        const pendingBookings = bookings.filter(b => b && b.status === 'pending');

        setDashboardData({
          operator_info: dashboardInfo.operator_info || {},
          assigned_fields: fields,
          today_bookings: todayBookings,
          upcoming_bookings: activeBookings.slice(0, 10),
          pending_bookings: pendingBookings,
          statistics: stats.statistics || stats,
          field_metrics: {
            total_fields: fields.length || 0,
            active_bookings: activeBookings.length || 0,
            today_bookings: todayBookings.length || 0,
            pending_bookings: pendingBookings.length || 0,
            utilization_rate: Math.round((activeBookings.length / Math.max(bookings.length, 1)) * 100) + '%'
          }
        });
      } else {
        setError(dashboardResponse.error || 'Gagal memuat data dashboard');
      }
    } catch (error) {
      console.error('Error loading operator dashboard data:', error);
      setError('Terjadi kesalahan saat memuat data dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadDashboardData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const statsData = useMemo(() => [
    {
      title: 'Lapangan Ditugaskan',
      value: dashboardData.field_metrics?.total_fields || 0,
      icon: '🏟️',
      color: 'bg-gray-800',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'Booking Aktif',
      value: dashboardData.field_metrics?.active_bookings || 0,
      icon: '📅',
      color: 'bg-gray-800',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'Booking Hari Ini',
      value: dashboardData.field_metrics?.today_bookings || 0,
      icon: '📊',
      color: 'bg-gray-800',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'Booking Pending',
      value: dashboardData.field_metrics?.pending_bookings || 0,
      icon: '⏳',
      color: 'bg-gray-800',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'Tingkat Utilisasi',
      value: dashboardData.field_metrics?.utilization_rate || '0%',
      icon: '📈',
      color: 'bg-gray-800',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'Status Operasional',
      value: 'Aktif',
      icon: '✅',
      color: 'bg-gray-800',
      bgColor: 'bg-gray-100'
    }
  ], [dashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-800 font-medium">Loading Operator Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <MinimalistOperatorHeader />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 relative overflow-hidden" style={{
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(126, 34, 206, 0.06) 0%, transparent 50%),
        linear-gradient(90deg, rgba(147, 51, 234, 0.04) 1px, transparent 1px),
        linear-gradient(rgba(147, 51, 234, 0.04) 1px, transparent 1px)
      `,
      backgroundSize: '100% 100%, 100% 100%, 30px 30px, 30px 30px'
    }}>
      <MinimalistOperatorHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Refresh Button - Soccer Style */}
        <div className="flex justify-end">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{refreshing ? 'Memuat Dashboard...' : 'Muat Ulang Dashboard'}</span>
          </button>
        </div>

        {/* Soccer Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-gray-800 hover:shadow-md transition-all duration-200 hover:border-l-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-800 mt-1">{stat.title}</div>
                  <div className="text-xs text-gray-500 mt-1">Operator aktif</div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-2xl text-white">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Soccer Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <nav className="flex space-x-1">
            {[
              {
                id: 'overview',
                label: 'Ringkasan',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                id: 'fields',
                label: 'Lapangan',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )
              },
              {
                id: 'bookings',
                label: 'Booking',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${activeView === tab.id
                  ? 'bg-gray-800 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100">
          {activeView === 'overview' && (
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">📊</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Overview Operator</h2>
                  <p className="text-gray-600">Ringkasan operasional dan performa lapangan</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-blue-50 to-gray-100 p-8 rounded-2xl shadow-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Status Lapangan</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Lapangan Ditugaskan:</span>
                      <span className="font-bold text-gray-800 text-lg">{dashboardData.field_metrics?.total_fields || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Booking Aktif:</span>
                      <span className="font-bold text-gray-800 text-lg">{dashboardData.field_metrics?.active_bookings || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Tingkat Utilisasi:</span>
                      <span className="font-bold text-gray-800 text-lg">{dashboardData.field_metrics?.utilization_rate || '0%'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Operasional Hari Ini</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Booking Hari Ini:</span>
                      <span className="font-bold text-gray-800 text-lg">{dashboardData.field_metrics?.today_bookings || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Booking Pending:</span>
                      <span className="font-bold text-gray-800 text-lg">{dashboardData.field_metrics?.pending_bookings || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Status Operasional:</span>
                      <span className="font-bold text-gray-800 text-lg">Aktif</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              {dashboardData.today_bookings?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Booking Hari Ini</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardData.today_bookings.slice(0, 6).map((booking) => (
                      <div key={booking.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-800">{booking.customer_name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{booking.field_name}</p>
                        <p className="text-sm text-gray-600">{booking.time_slot}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'fields' && <OperatorFieldPanel />}
          {activeView === 'bookings' && <OperatorBookingPanel />}
        </div>
      </div>
    </div>
  );
};

export default MinimalistOperatorDashboard;
