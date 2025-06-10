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
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-gray-800 mx-auto mb-8 shadow-xl"></div>
            <div className="absolute inset-0 rounded-full bg-gray-100 opacity-30 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-800">Loading Control Center</h2>
            <p className="text-gray-600 font-medium">Preparing your supervisor dashboard...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 relative overflow-hidden" style={{
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(126, 34, 206, 0.06) 0%, transparent 50%),
        linear-gradient(90deg, rgba(147, 51, 234, 0.04) 1px, transparent 1px),
        linear-gradient(rgba(147, 51, 234, 0.04) 1px, transparent 1px)
      `,
      backgroundSize: '100% 100%, 100% 100%, 30px 30px, 30px 30px'
    }}>
      {/* Soccer Supervisor Header */}
      <MinimalistSupervisorHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-6 supervisor-dashboard">
        {/* Refresh Button - Soccer Style */}
        <div className="flex justify-end">
          <button
            onClick={loadDashboardData}
            className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Muat Ulang Dashboard</span>
          </button>
        </div>

        {/* Soccer Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-gray-800 hover:shadow-md transition-all duration-200 hover:border-l-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">{overview?.total_users || 0}</div>
                <div className="text-sm font-medium text-gray-800 mt-1">Total Pengguna</div>
                <div className="text-xs text-gray-500 mt-1">Semua role sistem</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-gray-800 hover:shadow-md transition-all duration-200 hover:border-l-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">{overview?.total_fields || 0}</div>
                <div className="text-sm font-medium text-gray-800 mt-1">Total Lapangan</div>
                <div className="text-xs text-gray-500 mt-1">{overview?.active_fields || 0} siap main</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-gray-800 hover:shadow-md transition-all duration-200 hover:border-l-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">{overview?.active_fields || 0}</div>
                <div className="text-sm font-medium text-gray-800 mt-1">Lapangan Aktif</div>
                <div className="text-xs text-gray-500 mt-1">Siap pertandingan</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-gray-800 hover:shadow-md transition-all duration-200 hover:border-l-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">{overview?.total_bookings || 0}</div>
                <div className="text-sm font-medium text-gray-800 mt-1">Booking Lapangan</div>
                <div className="text-xs text-gray-500 mt-1">Hari ini</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-gray-800 hover:shadow-md transition-all duration-200 hover:border-l-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {serverInfo?.uptime ? formatUptime(serverInfo.uptime) : 'N/A'}
                </div>
                <div className="text-sm font-medium text-gray-800 mt-1">Waktu Operasi</div>
                <div className="text-xs text-gray-500 mt-1">Sistem berjalan</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-gray-800 hover:shadow-md transition-all duration-200 hover:border-l-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {serverInfo?.memory_usage?.heapUsed ? formatMemory(serverInfo.memory_usage.heapUsed) : 'N/A'}
                </div>
                <div className="text-sm font-medium text-gray-800 mt-1">Performa</div>
                <div className="text-xs text-gray-500 mt-1">Penggunaan memori</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
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
                id: 'users',
                label: 'Manajemen Pengguna',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
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
                id: 'system',
                label: 'Sistem & Audit',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )
              },
              {
                id: 'analytics',
                label: 'Analitik Bisnis',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${activeView === tab.id
                  ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg border">
          {activeView === 'overview' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Ringkasan Sistem</h3>

              {/* Key Business Metrics - NO DUPLICATION */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 text-sm">Total Pengguna</p>
                      <p className="text-3xl font-bold text-white">{overview?.total_users || 0}</p>
                      <p className="text-gray-100 text-xs mt-1">Terdaftar di sistem</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 text-sm">Total Lapangan</p>
                      <p className="text-3xl font-bold text-white">{overview?.total_fields || 0}</p>
                      <p className="text-gray-100 text-xs mt-1">{overview?.active_fields || 0} aktif</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 text-sm">Total Booking</p>
                      <p className="text-3xl font-bold text-white">{overview?.total_bookings || 0}</p>
                      <p className="text-gray-100 text-xs mt-1">Bulan ini</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 text-sm">Status Sistem</p>
                      <p className="text-xl font-bold text-white">{health?.status === 'healthy' ? 'Sehat' : 'Bermasalah'}</p>
                      <p className="text-gray-100 text-xs mt-1">Uptime: {formatUptime(serverInfo?.uptime)}</p>
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
                  className="bg-white border-2 border-gray-200 rounded-lg p-6 text-left hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-3xl group-hover:scale-110 transition-transform">👥</div>
                    <div className="text-gray-900 group-hover:text-gray-900">→</div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Kelola Pengguna</h4>
                  <p className="text-sm text-gray-600">Manajemen user dan role</p>
                </button>

                <button
                  onClick={() => setActiveView('fields')}
                  className="bg-white border-2 border-gray-200 rounded-lg p-6 text-left hover:border-green-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-3xl group-hover:scale-110 transition-transform">🏟️</div>
                    <div className="text-gray-900 group-hover:text-gray-900">→</div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Kelola Lapangan</h4>
                  <p className="text-sm text-gray-600">Status dan maintenance</p>
                </button>

                <button
                  onClick={() => setActiveView('system')}
                  className="bg-white border-2 border-gray-200 rounded-lg p-6 text-left hover:border-purple-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-3xl group-hover:scale-110 transition-transform">⚙️</div>
                    <div className="text-gray-900 group-hover:text-gray-900">→</div>
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
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
              </div>
            }>
              <UserManagementPanel />
            </Suspense>
          )}

          {activeView === 'fields' && (
            <Suspense fallback={
              <div className="p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
              </div>
            }>
              <FieldManagementPanel />
            </Suspense>
          )}

          {activeView === 'system' && (
            <Suspense fallback={
              <div className="p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
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
