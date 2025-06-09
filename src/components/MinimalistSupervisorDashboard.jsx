// src/components/MinimalistSupervisorDashboard.jsx
import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import { getSupervisorDashboard, getSystemHealth } from '../api/supervisorAPI';
import MinimalistSupervisorHeader from './MinimalistSupervisorHeader';

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
        console.log('⏱️ Server Uptime:', healthRes.value.data?.server_info?.uptime);
        console.log('💾 Memory Usage:', healthRes.value.data?.server_info?.memory_usage);
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
    if (!seconds || typeof seconds !== 'number' || isNaN(seconds)) {
      console.log('⚠️ Invalid uptime value:', seconds);
      return 'N/A';
    }

    const totalSeconds = Math.floor(seconds);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 border-t-purple-600 mx-auto mb-8 shadow-xl"></div>
            <div className="absolute inset-0 rounded-full bg-purple-100 opacity-30 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-purple-800">Loading Control Center</h2>
            <p className="text-purple-600 font-medium">Preparing your supervisor dashboard...</p>
            <div className="flex justify-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
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
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-300 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-400 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      {/* Futsal Supervisor Header */}
      <MinimalistSupervisorHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Refresh Button - Futsal Style */}
        <div className="flex justify-end">
          <button
            onClick={loadDashboardData}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>🔄</span>
            <span className="font-medium">Muat Ulang Dashboard</span>
          </button>
        </div>

        {/* Futsal Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-green-500 hover:shadow-md transition-all duration-200 hover:border-l-green-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{overview?.total_users || 0}</div>
                <div className="text-sm font-medium text-green-600 mt-1">Total Pengguna</div>
                <div className="text-xs text-gray-500 mt-1">Semua role sistem</div>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-200 hover:border-l-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{overview?.total_fields || 0}</div>
                <div className="text-sm font-medium text-blue-600 mt-1">Total Lapangan</div>
                <div className="text-xs text-gray-500 mt-1">{overview?.active_fields || 0} siap main</div>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">🏟️</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-emerald-500 hover:shadow-md transition-all duration-200 hover:border-l-emerald-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{overview?.active_fields || 0}</div>
                <div className="text-sm font-medium text-emerald-600 mt-1">Lapangan Aktif</div>
                <div className="text-xs text-gray-500 mt-1">Siap pertandingan</div>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">🥅</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-orange-500 hover:shadow-md transition-all duration-200 hover:border-l-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{overview?.total_bookings || 0}</div>
                <div className="text-sm font-medium text-orange-600 mt-1">Booking Lapangan</div>
                <div className="text-xs text-gray-500 mt-1">Hari ini</div>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">📅</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-purple-500 hover:shadow-md transition-all duration-200 hover:border-l-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {serverInfo?.uptime ? formatUptime(serverInfo.uptime) : 'N/A'}
                </div>
                <div className="text-sm font-medium text-purple-600 mt-1">Waktu Operasi</div>
                <div className="text-xs text-gray-500 mt-1">Sistem berjalan</div>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">⏱️</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-indigo-500 hover:shadow-md transition-all duration-200 hover:border-l-indigo-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {serverInfo?.memory_usage?.heapUsed ? formatMemory(serverInfo.memory_usage.heapUsed) : 'N/A'}
                </div>
                <div className="text-sm font-medium text-indigo-600 mt-1">Performa</div>
                <div className="text-xs text-gray-500 mt-1">Penggunaan memori</div>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Futsal Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-1">
          <nav className="flex space-x-1">
            {[
              { id: 'overview', label: 'Ringkasan', icon: '🏆' },
              { id: 'users', label: 'Manajemen Pengguna', icon: '👥' },
              { id: 'fields', label: 'Lapangan', icon: '🏟️' },
              { id: 'system', label: 'Sistem & Audit', icon: '⚙️' },
              { id: 'analytics', label: 'Analitik Bisnis', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${activeView === tab.id
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
              >
                <span>{tab.icon}</span>
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
