// src/components/MinimalistOperatorDashboard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import { getAllBookings } from '../api/bookingAPI';
import MinimalistOperatorHeader from './MinimalistOperatorHeader';

// Simple placeholder components for Operator
const FieldManagementPanel = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Lapangan</h2>
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg text-center">
      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl text-white">🏟️</span>
      </div>
      <h3 className="text-lg font-semibold text-blue-900 mb-2">Kelola Lapangan</h3>
      <p className="text-blue-700 mb-4">Monitor kondisi dan maintenance lapangan futsal.</p>
    </div>
  </div>
);

const ScheduleManagementPanel = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Jadwal</h2>
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg text-center">
      <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl text-white">📅</span>
      </div>
      <h3 className="text-lg font-semibold text-purple-900 mb-2">Jadwal Lapangan</h3>
      <p className="text-purple-700 mb-4">Atur jadwal dan ketersediaan lapangan.</p>
    </div>
  </div>
);

const MaintenancePanel = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Maintenance & Operasional</h2>
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg text-center">
      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl text-white">🔧</span>
      </div>
      <h3 className="text-lg font-semibold text-orange-900 mb-2">Maintenance</h3>
      <p className="text-orange-700 mb-4">Kelola maintenance dan operasional harian.</p>
    </div>
  </div>
);

const MinimalistOperatorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [dashboardData, setDashboardData] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load basic booking data for operator
      const bookingsResponse = await getAllBookings({ limit: 20 });
      if (bookingsResponse.success) {
        const bookings = bookingsResponse.data;
        
        // Calculate field-related stats
        const totalBookings = bookings.length;
        const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
        const todayBookings = bookings.filter(b => {
          const today = new Date().toISOString().split('T')[0];
          return b.date === today;
        }).length;
        
        setDashboardData({
          field_metrics: {
            total_fields: 4, // Mock data
            active_bookings: activeBookings,
            today_bookings: todayBookings,
            utilization_rate: Math.round((activeBookings / Math.max(totalBookings, 1)) * 100) + '%'
          },
          today_schedule: bookings.filter(b => {
            const today = new Date().toISOString().split('T')[0];
            return b.date === today;
          }),
          upcoming_bookings: bookings.filter(b => b.status === 'confirmed'),
          maintenance_tasks: [] // Mock data
        });
      }
    } catch (error) {
      console.error('Error loading operator dashboard data:', error);
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
      title: 'Total Lapangan',
      value: dashboardData.field_metrics?.total_fields || 4,
      icon: '🏟️',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Booking Aktif',
      value: dashboardData.field_metrics?.active_bookings || 0,
      icon: '📅',
      color: 'bg-green-500',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Booking Hari Ini',
      value: dashboardData.field_metrics?.today_bookings || 0,
      icon: '📊',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Tingkat Utilisasi',
      value: dashboardData.field_metrics?.utilization_rate || '0%',
      icon: '📈',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Lapangan Tersedia',
      value: '3 Lapangan',
      icon: '✅',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Maintenance',
      value: '1 Pending',
      icon: '🔧',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100'
    }
  ], [dashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">Loading Operator Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <MinimalistOperatorHeader />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Selamat datang, {user?.name || 'Operator'}! ⚙️
              </h1>
              <p className="text-gray-600">
                Kelola operasional dan maintenance lapangan futsal
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                refreshing 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 shadow-lg'
              }`}
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <span className="text-lg">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'fields', label: 'Lapangan', icon: '🏟️' },
                { id: 'schedule', label: 'Jadwal', icon: '📅' },
                { id: 'maintenance', label: 'Maintenance', icon: '🔧' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeView === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {activeView === 'overview' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview Operator</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Status Lapangan</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total Lapangan:</span>
                      <span className="font-bold text-blue-900">{dashboardData.field_metrics?.total_fields || 4}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Booking Aktif:</span>
                      <span className="font-bold text-blue-900">{dashboardData.field_metrics?.active_bookings || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Utilisasi:</span>
                      <span className="font-bold text-blue-900">{dashboardData.field_metrics?.utilization_rate || '0%'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Operasional Hari Ini</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-green-700">Booking Hari Ini:</span>
                      <span className="font-bold text-green-900">{dashboardData.field_metrics?.today_bookings || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Lapangan Tersedia:</span>
                      <span className="font-bold text-green-900">3 Lapangan</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Maintenance:</span>
                      <span className="font-bold text-green-900">1 Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeView === 'fields' && <FieldManagementPanel />}
          {activeView === 'schedule' && <ScheduleManagementPanel />}
          {activeView === 'maintenance' && <MaintenancePanel />}
        </div>
      </div>
    </div>
  );
};

export default MinimalistOperatorDashboard;
