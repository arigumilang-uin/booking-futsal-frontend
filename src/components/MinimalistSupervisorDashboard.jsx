// src/components/MinimalistSupervisorDashboard.jsx
import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import { getSupervisorDashboard, getSystemHealth } from '../api/supervisorAPI';
import SupervisorHeader from './SupervisorHeader';

// Lazy load management components
const UserManagementPanel = lazy(() => import('./UserManagementPanel'));
const FieldManagementPanel = lazy(() => import('./FieldManagementPanel'));
const SystemMaintenancePanel = lazy(() => import('./SystemMaintenancePanel'));
const AdvancedAnalyticsPanel = lazy(() => import('./AdvancedAnalyticsPanel'));

const MinimalistSupervisorDashboard = () => {
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL RETURNS
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [activeView, setActiveView] = useState('overview');

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardRes, healthRes] = await Promise.allSettled([
        getSupervisorDashboard(),
        getSystemHealth()
      ]);

      if (dashboardRes.status === 'fulfilled' && dashboardRes.value.success) {
        setDashboardData(dashboardRes.value.data);
      }

      if (healthRes.status === 'fulfilled' && healthRes.value.success) {
        console.log('🔧 System Health Data Loaded:', healthRes.value.data);
        console.log('🗄️ Database Tables Count:', healthRes.value.data?.database_stats?.tables?.length);
        setSystemHealth(healthRes.value.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'supervisor_sistem') {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  // Memoized computed values
  const overview = useMemo(() => dashboardData?.overview, [dashboardData]);
  const health = useMemo(() => systemHealth?.system_health, [systemHealth]);
  const serverInfo = useMemo(() => systemHealth?.server_info, [systemHealth]);



  // Helper functions (not hooks)
  const formatUptime = (seconds) => {
    if (!seconds || typeof seconds !== 'number') return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);
    return days > 0 ? `${days}d ${hours % 24}h` : `${hours}h`;
  };

  const formatMemory = (bytes) => {
    if (!bytes || typeof bytes !== 'number') return 'N/A';
    return `${(bytes / 1024 / 1024).toFixed(0)}MB`;
  };

  // CONDITIONAL RETURNS AFTER ALL HOOKS
  if (user?.role !== 'supervisor_sistem') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Akses ditolak. Hanya supervisor sistem yang dapat mengakses dashboard ini.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      {/* Modern Supervisor Header */}
      <SupervisorHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Refresh Button */}
        <div className="flex justify-end">
          <button
            onClick={loadDashboardData}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-2xl hover:from-purple-700 hover:to-blue-700 flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <span className="text-lg">🔄</span>
            <span className="font-medium">Refresh Data</span>
          </button>
        </div>

      {/* Enhanced Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-900">{overview?.total_users || 0}</div>
              <div className="text-sm font-medium text-blue-600 mt-1">Total Users</div>
              <div className="text-xs text-blue-700 mt-1">Terdaftar di sistem</div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-900">{overview?.total_fields || 0}</div>
              <div className="text-sm font-medium text-green-600 mt-1">Total Fields</div>
              <div className="text-xs text-green-700 mt-1">{overview?.active_fields || 0} aktif</div>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🏟️</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-900">{overview?.active_fields || 0}</div>
              <div className="text-sm font-medium text-purple-600 mt-1">Active Fields</div>
              <div className="text-xs text-purple-700 mt-1">Siap digunakan</div>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl shadow-lg border border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-orange-900">{overview?.total_bookings || 0}</div>
              <div className="text-sm font-medium text-orange-600 mt-1">Bookings</div>
              <div className="text-xs text-orange-700 mt-1">Hari ini</div>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl shadow-lg border border-red-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-red-900">
                {serverInfo?.uptime ? formatUptime(serverInfo.uptime) : 'N/A'}
              </div>
              <div className="text-sm font-medium text-red-600 mt-1">Uptime</div>
              <div className="text-xs text-red-700 mt-1">Server aktif</div>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl shadow-lg border border-indigo-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-indigo-900">
                {serverInfo?.memory_usage?.heapUsed ? formatMemory(serverInfo.memory_usage.heapUsed) : 'N/A'}
              </div>
              <div className="text-sm font-medium text-indigo-600 mt-1">Memory</div>
              <div className="text-xs text-indigo-700 mt-1">Penggunaan RAM</div>
            </div>
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">💾</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
        <nav className="flex space-x-2">
          {[
            { id: 'overview', label: 'Ringkasan', icon: '📊', color: 'blue' },
            { id: 'users', label: 'Pengguna', icon: '👥', color: 'green' },
            { id: 'fields', label: 'Lapangan', icon: '🏟️', color: 'purple' },
            { id: 'system', label: 'Sistem & Audit', icon: '⚙️', color: 'indigo' },
            { id: 'analytics', label: 'Analitik Bisnis', icon: '📈', color: 'orange' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex-1 py-4 px-6 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeView === tab.id
                  ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg transform scale-105`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg border">
        {activeView === 'overview' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Ringkasan Sistem</h3>

            {/* Key Business Metrics - NO DUPLICATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Pengguna</p>
                    <p className="text-3xl font-bold">{overview?.total_users || 0}</p>
                    <p className="text-blue-100 text-xs mt-1">Terdaftar di sistem</p>
                  </div>
                  <div className="text-4xl opacity-80">👥</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Lapangan</p>
                    <p className="text-3xl font-bold">{overview?.total_fields || 0}</p>
                    <p className="text-green-100 text-xs mt-1">{overview?.active_fields || 0} aktif</p>
                  </div>
                  <div className="text-4xl opacity-80">🏟️</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Booking</p>
                    <p className="text-3xl font-bold">{overview?.total_bookings || 0}</p>
                    <p className="text-purple-100 text-xs mt-1">Bulan ini</p>
                  </div>
                  <div className="text-4xl opacity-80">📅</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Status Sistem</p>
                    <p className="text-xl font-bold">{health?.status === 'healthy' ? 'Sehat' : 'Bermasalah'}</p>
                    <p className="text-orange-100 text-xs mt-1">Uptime: {formatUptime(serverInfo?.uptime)}</p>
                  </div>
                  <div className="text-4xl opacity-80">
                    {health?.status === 'healthy' ? '✅' : '⚠️'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Navigation - ENHANCED */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveView('users')}
                className="bg-white border-2 border-blue-200 rounded-lg p-6 text-left hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl group-hover:scale-110 transition-transform">👥</div>
                  <div className="text-blue-600 group-hover:text-blue-800">→</div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Kelola Pengguna</h4>
                <p className="text-sm text-gray-600">Manajemen user dan role</p>
              </button>

              <button
                onClick={() => setActiveView('fields')}
                className="bg-white border-2 border-green-200 rounded-lg p-6 text-left hover:border-green-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl group-hover:scale-110 transition-transform">🏟️</div>
                  <div className="text-green-600 group-hover:text-green-800">→</div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Kelola Lapangan</h4>
                <p className="text-sm text-gray-600">Status dan maintenance</p>
              </button>

              <button
                onClick={() => setActiveView('system')}
                className="bg-white border-2 border-purple-200 rounded-lg p-6 text-left hover:border-purple-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl group-hover:scale-110 transition-transform">⚙️</div>
                  <div className="text-purple-600 group-hover:text-purple-800">→</div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Sistem & Audit</h4>
                <p className="text-sm text-gray-600">Monitoring dan logs</p>
              </button>

              <button
                onClick={() => setActiveView('analytics')}
                className="bg-white border-2 border-orange-200 rounded-lg p-6 text-left hover:border-orange-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl group-hover:scale-110 transition-transform">📈</div>
                  <div className="text-orange-600 group-hover:text-orange-800">→</div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Analitik Bisnis</h4>
                <p className="text-sm text-gray-600">Revenue dan performance</p>
              </button>
            </div>
          </div>
        )}

        {activeView === 'users' && (
          <Suspense fallback={
            <div className="p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          }>
            <UserManagementPanel />
          </Suspense>
        )}

        {activeView === 'fields' && (
          <Suspense fallback={
            <div className="p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            </div>
          }>
            <FieldManagementPanel />
          </Suspense>
        )}

        {activeView === 'system' && (
          <Suspense fallback={
            <div className="p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            </div>
          }>
            <SystemMaintenancePanel />
          </Suspense>
        )}

        {activeView === 'analytics' && (
          <Suspense fallback={
            <div className="p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
            </div>
          }>
            <AdvancedAnalyticsPanel />
          </Suspense>
        )}
      </div>
      </div>
    </div>
  );
};

export default MinimalistSupervisorDashboard;
