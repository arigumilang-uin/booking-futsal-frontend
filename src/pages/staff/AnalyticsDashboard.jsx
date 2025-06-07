// src/pages/staff/AnalyticsDashboard.jsx
import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { 
  getDashboardStats,
  getBookingAnalytics,
  getRevenueAnalytics,
  getFieldAnalytics,
  getUserAnalytics,
  getPerformanceMetrics,
  formatCurrency,
  calculateGrowthPercentage,
  getDateRangeOptions
} from '../../api';
import AuditTrailViewer from '../../components/AuditTrailViewer';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [analytics, setAnalytics] = useState({
    dashboard: null,
    bookings: null,
    revenue: null,
    fields: null,
    users: null,
    performance: null
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats
      const dashboardResponse = await getDashboardStats(user.role, { period: dateRange });
      if (dashboardResponse.success) {
        setAnalytics(prev => ({ ...prev, dashboard: dashboardResponse.data }));
      }

      // Load additional analytics for admin roles
      if (['supervisor_sistem', 'manajer_futsal'].includes(user.role)) {
        const [bookingRes, revenueRes, fieldRes, userRes, performanceRes] = await Promise.allSettled([
          getBookingAnalytics({ period: dateRange }),
          getRevenueAnalytics({ period: dateRange }),
          getFieldAnalytics({ period: dateRange }),
          getUserAnalytics({ period: dateRange }),
          getPerformanceMetrics({ period: dateRange })
        ]);

        setAnalytics(prev => ({
          ...prev,
          bookings: bookingRes.status === 'fulfilled' ? bookingRes.value.data : null,
          revenue: revenueRes.status === 'fulfilled' ? revenueRes.value.data : null,
          fields: fieldRes.status === 'fulfilled' ? fieldRes.value.data : null,
          users: userRes.status === 'fulfilled' ? userRes.value.data : null,
          performance: performanceRes.status === 'fulfilled' ? performanceRes.value.data : null
        }));
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      {analytics.dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Bookings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Booking</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics.dashboard.statistics?.total_bookings || 0}
                </p>
                {analytics.dashboard.statistics?.booking_growth && (
                  <p className={`text-sm ${analytics.dashboard.statistics.booking_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.dashboard.statistics.booking_growth >= 0 ? '↗' : '↘'} {Math.abs(analytics.dashboard.statistics.booking_growth)}%
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(analytics.dashboard.statistics?.total_revenue || 0)}
                </p>
                {analytics.dashboard.statistics?.revenue_growth && (
                  <p className={`text-sm ${analytics.dashboard.statistics.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.dashboard.statistics.revenue_growth >= 0 ? '↗' : '↘'} {Math.abs(analytics.dashboard.statistics.revenue_growth)}%
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics.dashboard.statistics?.active_users || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics.dashboard.statistics?.occupancy_rate || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Trends</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Chart akan ditampilkan di sini</p>
            <p className="text-sm">(Implementasi Chart.js/Recharts)</p>
          </div>
        </div>

        {/* Revenue Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Chart akan ditampilkan di sini</p>
            <p className="text-sm">(Implementasi Chart.js/Recharts)</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {analytics.dashboard?.recent_bookings?.slice(0, 5).map((booking, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Booking #{booking.id} - {booking.field_name}
                </p>
                <p className="text-xs text-gray-500">
                  {booking.user_name} • {new Date(booking.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {booking.status}
              </span>
            </div>
          )) || (
            <p className="text-gray-500 text-center py-4">Tidak ada aktivitas terbaru</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderBookingsTab = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Analytics</h3>
      {analytics.bookings ? (
        <div className="space-y-6">
          {/* Booking Status Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-green-600">
                {analytics.bookings.confirmed || 0}
              </p>
              <p className="text-sm text-gray-600">Confirmed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-yellow-600">
                {analytics.bookings.pending || 0}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-red-600">
                {analytics.bookings.cancelled || 0}
              </p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </div>
          
          {/* Additional booking metrics */}
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Detailed booking analytics charts</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Booking analytics data tidak tersedia</p>
        </div>
      )}
    </div>
  );

  const renderAuditTab = () => {
    if (!['supervisor_sistem'].includes(user.role)) {
      return (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Akses audit trail hanya untuk Supervisor Sistem</p>
        </div>
      );
    }
    
    return <AuditTrailViewer />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              📊 Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive business analytics and insights
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {getDateRangeOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={loadAnalytics}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'bookings', label: 'Bookings', icon: '📅' },
              { id: 'revenue', label: 'Revenue', icon: '💰' },
              { id: 'fields', label: 'Fields', icon: '🏟️' },
              ...(user.role === 'supervisor_sistem' ? [{ id: 'audit', label: 'Audit Trail', icon: '🔍' }] : [])
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
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'bookings' && renderBookingsTab()}
          {activeTab === 'revenue' && (
            <div className="text-center py-8 text-gray-500">
              <p>Revenue analytics akan diimplementasikan</p>
            </div>
          )}
          {activeTab === 'fields' && (
            <div className="text-center py-8 text-gray-500">
              <p>Field analytics akan diimplementasikan</p>
            </div>
          )}
          {activeTab === 'audit' && renderAuditTab()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
