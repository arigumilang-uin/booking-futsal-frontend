import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Users, Clock, BarChart3, PieChart } from 'lucide-react';
import { trackingApi } from '../../services/trackingApi';

const TrackingDashboard = () => {
  const [dailyChanges, setDailyChanges] = useState([]);
  const [statusFlow, setStatusFlow] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchTrackingData();
  }, [timeRange]);

  const fetchTrackingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dailyResponse, flowResponse] = await Promise.all([
        trackingApi.getDailyBookingChanges(timeRange),
        trackingApi.getBookingStatusFlow(timeRange)
      ]);

      if (dailyResponse.success) {
        setDailyChanges(dailyResponse.data || []);
      }
      if (flowResponse.success) {
        setStatusFlow(flowResponse.data || []);
      }
    } catch (err) {
      setError('Gagal memuat data tracking');
      console.error('Tracking data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalStats = () => {
    const totals = dailyChanges.reduce((acc, day) => ({
      totalChanges: acc.totalChanges + (day.total_changes || 0),
      confirmations: acc.confirmations + (day.confirmations || 0),
      cancellations: acc.cancellations + (day.cancellations || 0),
      completions: acc.completions + (day.completions || 0),
      uniqueBookings: acc.uniqueBookings + (day.unique_bookings || 0)
    }), {
      totalChanges: 0,
      confirmations: 0,
      cancellations: 0,
      completions: 0,
      uniqueBookings: 0
    });

    return totals;
  };

  const getTopTransitions = () => {
    return statusFlow
      .sort((a, b) => (b.transition_count || 0) - (a.transition_count || 0))
      .slice(0, 5);
  };

  const stats = getTotalStats();
  const topTransitions = getTopTransitions();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Analytics Tracking</h2>
            <p className="text-gray-600">Analisis aktivitas booking dan performa sistem</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={7}>7 Hari Terakhir</option>
            <option value={30}>30 Hari Terakhir</option>
            <option value={90}>90 Hari Terakhir</option>
          </select>
          <button
            onClick={fetchTrackingData}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Memuat data analytics...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">Total Perubahan</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalChanges}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Konfirmasi</p>
                  <p className="text-3xl font-bold text-green-900">{stats.confirmations}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-700 text-sm font-medium">Pembatalan</p>
                  <p className="text-3xl font-bold text-red-900">{stats.cancellations}</p>
                </div>
                <PieChart className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium">Penyelesaian</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.completions}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Changes Chart */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Aktivitas Harian</h3>
              </div>
              
              {dailyChanges.length > 0 ? (
                <div className="space-y-3">
                  {dailyChanges.slice(0, 7).map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{day.date}</p>
                        <p className="text-sm text-gray-600">{day.unique_bookings} booking unik</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{day.total_changes}</p>
                        <p className="text-xs text-gray-500">perubahan</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Belum ada data aktivitas harian</p>
                </div>
              )}
            </div>

            {/* Status Flow Chart */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Transisi Status Teratas</h3>
              </div>
              
              {topTransitions.length > 0 ? (
                <div className="space-y-3">
                  {topTransitions.map((transition, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {transition.status_from} → {transition.status_to}
                        </p>
                        <p className="text-sm text-gray-600">
                          {transition.unique_bookings} booking unik
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{transition.transition_count}</p>
                        <p className="text-xs text-gray-500">transisi</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Belum ada data transisi status</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-6 h-6" />
              <h3 className="text-xl font-bold">Ringkasan Analytics</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.uniqueBookings}</p>
                <p className="text-purple-100">Total Booking Unik</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {stats.totalChanges > 0 ? Math.round((stats.confirmations / stats.totalChanges) * 100) : 0}%
                </p>
                <p className="text-purple-100">Tingkat Konfirmasi</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {stats.totalChanges > 0 ? Math.round((stats.completions / stats.totalChanges) * 100) : 0}%
                </p>
                <p className="text-purple-100">Tingkat Penyelesaian</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TrackingDashboard;
