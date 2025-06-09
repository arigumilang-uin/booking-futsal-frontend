// src/components/EnhancedAnalyticsDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { 
  getAdvancedAnalytics, 
  exportAnalyticsData,
  getRevenueAnalytics,
  getBookingTrends,
  getUserAnalytics 
} from '../api/analyticsAPI';
import useAuth from '../hooks/useAuth';

const EnhancedAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState({});
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end_date: new Date().toISOString().split('T')[0] // today
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [chartData, setChartData] = useState({
    revenue: [],
    bookings: [],
    users: []
  });

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      const [analyticsRes, revenueRes, bookingRes, userRes] = await Promise.allSettled([
        getAdvancedAnalytics(dateRange),
        getRevenueAnalytics(dateRange),
        getBookingTrends(dateRange),
        getUserAnalytics(dateRange)
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success) {
        setAnalytics(analyticsRes.value.data);
      }

      if (revenueRes.status === 'fulfilled' && revenueRes.value.success) {
        setChartData(prev => ({ ...prev, revenue: revenueRes.value.data }));
      }

      if (bookingRes.status === 'fulfilled' && bookingRes.value.success) {
        setChartData(prev => ({ ...prev, bookings: bookingRes.value.data }));
      }

      if (userRes.status === 'fulfilled' && userRes.value.success) {
        setChartData(prev => ({ ...prev, users: userRes.value.data }));
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleExport = async (format = 'excel') => {
    try {
      setLoading(true);
      const blob = await exportAnalyticsData({
        ...dateRange,
        format,
        include_charts: true
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics_${dateRange.start_date}_to_${dateRange.end_date}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengexport data analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const SimpleChart = ({ data, type = 'line', title, color = '#3B82F6' }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-gray-500">
          No data available
        </div>
      );
    }

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    return (
      <div className="h-48 relative">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
        <div className="h-40 flex items-end space-x-1">
          {data.map((item, index) => {
            const height = ((item.value - minValue) / range) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${Math.max(height, 2)}%`,
                    backgroundColor: color
                  }}
                  title={`${item.label}: ${item.value}`}
                />
                <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, change, icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-gray-900 border-gray-200',
      green: 'bg-green-50 text-gray-900 border-gray-200',
      purple: 'bg-purple-50 text-gray-900 border-gray-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    };

    return (
      <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {change !== undefined && (
              <p className={`text-sm mt-1 ${
                change >= 0 ? 'text-gray-900' : 'text-red-600'
              }`}>
                {change >= 0 ? '↗' : '↘'} {Math.abs(change).toFixed(1)}%
              </p>
            )}
          </div>
          <div className="text-3xl">{icon}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Enhanced Analytics</h2>
          <p className="text-gray-600">Comprehensive business analytics and insights</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleExport('excel')}
            disabled={loading}
            className="bg-gray-800 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-500 disabled:opacity-50"
          >
            📊 Export Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            📄 Export PDF
          </button>
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => handleDateRangeChange('start_date', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => handleDateRangeChange('end_date', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadAnalytics}
              className="bg-gray-800 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-500"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'revenue', label: 'Revenue', icon: '💰' },
              { id: 'bookings', label: 'Bookings', icon: '📅' },
              { id: 'users', label: 'Users', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-gray-800 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(analytics.total_revenue || 0)}
                  change={analytics.revenue_growth}
                  icon="💰"
                  color="green"
                />
                <StatCard
                  title="Total Bookings"
                  value={analytics.total_bookings || 0}
                  change={analytics.booking_growth}
                  icon="📅"
                  color="blue"
                />
                <StatCard
                  title="Active Users"
                  value={analytics.active_users || 0}
                  change={analytics.user_growth}
                  icon="👥"
                  color="purple"
                />
                <StatCard
                  title="Avg. Booking Value"
                  value={formatCurrency(analytics.avg_booking_value || 0)}
                  change={analytics.avg_value_growth}
                  icon="📈"
                  color="orange"
                />
              </div>

              {/* Quick Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <SimpleChart
                    data={chartData.revenue.slice(0, 7)}
                    title="Revenue Trend (Last 7 Days)"
                    color="#10B981"
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <SimpleChart
                    data={chartData.bookings.slice(0, 7)}
                    title="Booking Trend (Last 7 Days)"
                    color="#3B82F6"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <SimpleChart
                    data={chartData.revenue}
                    title="Revenue Over Time"
                    color="#10B981"
                  />
                </div>
                <div className="space-y-4">
                  <StatCard
                    title="Total Revenue"
                    value={formatCurrency(analytics.total_revenue || 0)}
                    icon="💰"
                    color="green"
                  />
                  <StatCard
                    title="Average Daily"
                    value={formatCurrency(analytics.avg_daily_revenue || 0)}
                    icon="📊"
                    color="blue"
                  />
                  <StatCard
                    title="Peak Day"
                    value={analytics.peak_revenue_day || 'N/A'}
                    icon="🏆"
                    color="orange"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <SimpleChart
                    data={chartData.bookings}
                    title="Booking Trends"
                    color="#3B82F6"
                  />
                </div>
                <div className="space-y-4">
                  <StatCard
                    title="Total Bookings"
                    value={analytics.total_bookings || 0}
                    icon="📅"
                    color="blue"
                  />
                  <StatCard
                    title="Completion Rate"
                    value={formatPercentage(analytics.completion_rate || 0)}
                    icon="✅"
                    color="green"
                  />
                  <StatCard
                    title="Cancellation Rate"
                    value={formatPercentage(analytics.cancellation_rate || 0)}
                    icon="❌"
                    color="red"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <SimpleChart
                    data={chartData.users}
                    title="User Activity"
                    color="#8B5CF6"
                  />
                </div>
                <div className="space-y-4">
                  <StatCard
                    title="Total Users"
                    value={analytics.total_users || 0}
                    icon="👥"
                    color="purple"
                  />
                  <StatCard
                    title="New Users"
                    value={analytics.new_users || 0}
                    icon="🆕"
                    color="green"
                  />
                  <StatCard
                    title="Retention Rate"
                    value={formatPercentage(analytics.retention_rate || 0)}
                    icon="🔄"
                    color="blue"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;
