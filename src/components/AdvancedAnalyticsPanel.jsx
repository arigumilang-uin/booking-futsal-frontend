// src/components/AdvancedAnalyticsPanel.jsx
import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';

const AdvancedAnalyticsPanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    business: null,
    system: null,
    performance: null
  });
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [activeMetric, setActiveMetric] = useState('business');

  useEffect(() => {
    if (user?.role === 'supervisor_sistem') {
      loadAnalyticsData();
    }
  }, [user, dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Load multiple analytics endpoints in parallel using correct endpoints
      const [businessRes, systemRes, performanceRes] = await Promise.allSettled([
        axiosInstance.get('/admin/analytics/business', { params: dateRange }),
        axiosInstance.get('/admin/analytics/system', { params: dateRange }),
        axiosInstance.get('/admin/analytics/performance', { params: dateRange })
      ]);

      const newData = { ...analyticsData };

      if (businessRes.status === 'fulfilled' && businessRes.value.data.success) {
        newData.business = businessRes.value.data.data;
        console.log('✅ Business Analytics loaded:', businessRes.value.data.data);
      }

      if (systemRes.status === 'fulfilled' && systemRes.value.data.success) {
        newData.system = systemRes.value.data.data;
        console.log('✅ System Analytics loaded:', systemRes.value.data.data);
      }

      if (performanceRes.status === 'fulfilled' && performanceRes.value.data.success) {
        newData.performance = performanceRes.value.data.data;
        console.log('✅ Performance Analytics loaded:', performanceRes.value.data.data);
      }

      setAnalyticsData(newData);
      console.log('✅ Analytics data loaded:', newData);
    } catch (error) {
      console.error('❌ Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-gray-900';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return '📈';
    if (growth < 0) return '📉';
    return '➡️';
  };

  if (user?.role !== 'supervisor_sistem') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Akses ditolak. Hanya supervisor sistem yang dapat mengakses advanced analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Date Range */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            📈 Analitik Bisnis
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={loadAnalyticsData}
              className="bg-gray-800 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-500 text-sm"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Metric Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'business', label: 'Business Analytics', icon: '💼' },
              { id: 'system', label: 'System Analytics', icon: '⚙️' },
              { id: 'performance', label: 'Performance Metrics', icon: '📈' }
            ].map((metric) => (
              <button
                key={metric.id}
                onClick={() => setActiveMetric(metric.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeMetric === metric.id
                    ? 'border-gray-800 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{metric.icon}</span>
                {metric.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data analytics...</p>
        </div>
      ) : (
        <>
          {/* Business Overview */}
          {activeMetric === 'business' && analyticsData.business && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-900 text-sm">💰</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatCurrency(analyticsData.business.revenue_analytics?.total_revenue)}
                      </p>
                      <p className={`text-sm ${getGrowthColor(analyticsData.business.revenue_analytics?.growth_rate)}`}>
                        {getGrowthIcon(analyticsData.business.revenue_analytics?.growth_rate)} 
                        {analyticsData.business.revenue_analytics?.growth_rate?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-900 text-sm">📅</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatNumber(analyticsData.business.booking_analytics?.total_bookings)}
                      </p>
                      <p className={`text-sm ${getGrowthColor(analyticsData.business.booking_analytics?.growth_rate)}`}>
                        {getGrowthIcon(analyticsData.business.booking_analytics?.growth_rate)} 
                        {analyticsData.business.booking_analytics?.growth_rate?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-900 text-sm">👥</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">New Customers</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatNumber(analyticsData.business.customer_analytics?.new_customers)}
                      </p>
                      <p className={`text-sm ${getGrowthColor(analyticsData.business.customer_analytics?.growth_rate)}`}>
                        {getGrowthIcon(analyticsData.business.customer_analytics?.growth_rate)} 
                        {analyticsData.business.customer_analytics?.growth_rate?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-900 text-sm">🏟️</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Field Utilization</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {analyticsData.business.field_analytics?.utilization_rate?.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatNumber(analyticsData.business.field_analytics?.total_hours)} hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Field Bookings</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatCurrency(analyticsData.business.revenue_analytics?.field_revenue)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Additional Services</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatCurrency(analyticsData.business.revenue_analytics?.service_revenue)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Average per Booking</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatCurrency(analyticsData.business.revenue_analytics?.avg_booking_value)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Analytics */}
          {activeMetric === 'system' && analyticsData.system && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">User Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Users:</span>
                      <span className="font-medium">{formatNumber(analyticsData.system.system_analytics?.users?.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Users:</span>
                      <span className="font-medium text-gray-900">{formatNumber(analyticsData.system.system_analytics?.users?.active)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Inactive Users:</span>
                      <span className="font-medium text-red-600">{formatNumber(analyticsData.system.system_analytics?.users?.inactive)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">System Health</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Bookings:</span>
                      <span className="font-medium">{formatNumber(analyticsData.system.system_analytics?.bookings?.total_bookings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-medium">{formatCurrency(analyticsData.system.system_analytics?.revenue?.total_revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Fields:</span>
                      <span className="font-medium">{formatNumber(analyticsData.system.system_analytics?.fields?.total_fields)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          {activeMetric === 'performance' && analyticsData.performance && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Performance Indicators</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occupancy Rate:</span>
                      <span className="font-medium">{analyticsData.performance.performance_metrics?.occupancy_rate?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue per Booking:</span>
                      <span className="font-medium">{formatCurrency(analyticsData.performance.performance_metrics?.revenue_per_booking)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Booking Value:</span>
                      <span className="font-medium">{formatCurrency(analyticsData.performance.performance_metrics?.average_booking_value)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Field Utilization:</span>
                      <span className="font-medium">{analyticsData.performance.performance_metrics?.field_utilization?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Raw Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Bookings:</span>
                      <span className="font-medium">{formatNumber(analyticsData.performance.raw_statistics?.bookings?.total_bookings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-medium">{formatCurrency(analyticsData.performance.raw_statistics?.revenue?.total_revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Fields:</span>
                      <span className="font-medium">{formatNumber(analyticsData.performance.raw_statistics?.fields?.total_fields)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Fields:</span>
                      <span className="font-medium text-gray-900">{formatNumber(analyticsData.performance.raw_statistics?.fields?.active_fields)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdvancedAnalyticsPanel;
