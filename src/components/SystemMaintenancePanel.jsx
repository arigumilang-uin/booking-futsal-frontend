// src/components/SystemMaintenancePanel.jsx
// OPTIMIZED VERSION - NO DUPLICATION WITH OVERVIEW TAB
import { useState, useEffect, Suspense, lazy } from 'react';
import useAuth from '../hooks/useAuth';
import { 
  getDatabaseStats,
  getSystemHealth,
  triggerSystemMaintenance,
  cleanOldAuditLogs,
  formatSystemUptime,
  formatMemoryUsage,
  getSystemHealthStatus
} from '../api';

// Lazy load AuditLogsPanel untuk audit logs management
const AuditLogsPanel = lazy(() => import('./AuditLogsPanel'));

const SystemMaintenancePanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [databaseStats, setDatabaseStats] = useState(null);
  const [activeTab, setActiveTab] = useState('monitoring'); // monitoring, maintenance, audit
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState({
    type: 'database_cleanup',
    description: '',
    scheduled_time: '',
    notify_users: true
  });

  useEffect(() => {
    if (user?.role === 'supervisor_sistem') {
      loadSystemData();
    }
  }, [user]);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      
      const [healthRes, dbStatsRes] = await Promise.allSettled([
        getSystemHealth(),
        getDatabaseStats()
      ]);

      if (healthRes.status === 'fulfilled' && healthRes.value.success) {
        setSystemHealth(healthRes.value.data);
      }
      
      if (dbStatsRes.status === 'fulfilled' && dbStatsRes.value.success) {
        setDatabaseStats(dbStatsRes.value.data);
      }

    } catch (error) {
      console.error('Error loading system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerMaintenance = async () => {
    try {
      if (!maintenanceData.type || !maintenanceData.description) {
        alert('Type dan description harus diisi');
        return;
      }

      const response = await triggerSystemMaintenance(maintenanceData);
      if (response.success) {
        await loadSystemData();
        setMaintenanceData({
          type: 'database_cleanup',
          description: '',
          scheduled_time: '',
          notify_users: true
        });
        setShowMaintenanceForm(false);
        alert('Maintenance berhasil dijadwalkan');
      }
    } catch (error) {
      console.error('Error triggering maintenance:', error);
      alert('Gagal menjadwalkan maintenance: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCleanAuditLogs = async (daysToKeep = 90) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus audit logs yang lebih lama dari ${daysToKeep} hari?`)) {
      return;
    }

    try {
      const response = await cleanOldAuditLogs(daysToKeep);
      if (response.success) {
        await loadSystemData();
        alert(`Audit logs berhasil dibersihkan. ${response.data?.deleted_count || 0} records dihapus.`);
      }
    } catch (error) {
      console.error('Error cleaning audit logs:', error);
      alert('Gagal membersihkan audit logs: ' + (error.response?.data?.message || error.message));
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthStatusText = (status) => {
    switch (status) {
      case 'excellent': return 'Sangat Baik';
      case 'good': return 'Baik';
      case 'warning': return 'Perhatian';
      case 'critical': return 'Kritis';
      default: return 'Tidak Diketahui';
    }
  };

  if (user?.role !== 'supervisor_sistem') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Akses ditolak. Hanya supervisor sistem yang dapat mengakses panel ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header dengan Tabs - OPTIMIZED STRUCTURE */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">
            ⚙️ Sistem & Audit
          </h2>
          {activeTab === 'maintenance' && (
            <button
              onClick={() => setShowMaintenanceForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              🛠️ Schedule Maintenance
            </button>
          )}
        </div>

        {/* Navigation Tabs - CLEAR SEPARATION */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'monitoring', label: 'System Monitoring', icon: '📊' },
              { id: 'maintenance', label: 'Database & Maintenance', icon: '🛠️' },
              { id: 'audit', label: 'Audit Trail', icon: '🔍' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
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
      </div>

      {/* Content Area berdasarkan Active Tab - NO DUPLICATION */}
      {activeTab === 'monitoring' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">📊 System Monitoring</h3>
          
          {/* System Health Overview - DETAILED MONITORING (NOT IN OVERVIEW) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <div className="flex items-center mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getHealthStatusColor(getSystemHealthStatus(systemHealth?.system_health, systemHealth?.server_info))
                    }`}>
                      {getHealthStatusText(getSystemHealthStatus(systemHealth?.system_health, systemHealth?.server_info))}
                    </span>
                  </div>
                </div>
                <div className="text-2xl">
                  {getSystemHealthStatus(systemHealth?.system_health, systemHealth?.server_info) === 'excellent' ? '✅' :
                   getSystemHealthStatus(systemHealth?.system_health, systemHealth?.server_info) === 'good' ? '🟢' :
                   getSystemHealthStatus(systemHealth?.system_health, systemHealth?.server_info) === 'warning' ? '🟡' : '🔴'}
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Database</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {systemHealth?.system_health?.status || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {databaseStats?.tables?.length || 0} tables
                  </p>
                </div>
                <div className="text-2xl">🗄️</div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatMemoryUsage(systemHealth?.server_info?.memory_usage?.heapUsed || 0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    dari {formatMemoryUsage(systemHealth?.server_info?.memory_usage?.heapTotal || 0)}
                  </p>
                </div>
                <div className="text-2xl">💾</div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatSystemUptime(systemHealth?.server_info?.uptime || 0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Node.js {systemHealth?.server_info?.node_version}
                  </p>
                </div>
                <div className="text-2xl">⏱️</div>
              </div>
            </div>
          </div>

          {/* Detailed System Performance - ONLY IN MONITORING TAB */}
          {systemHealth && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Server Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Environment:</span>
                    <span className="font-medium">{systemHealth.server_info?.environment || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Node Version:</span>
                    <span className="font-medium">{systemHealth.server_info?.node_version || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform:</span>
                    <span className="font-medium">{systemHealth.server_info?.platform || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CPU Usage:</span>
                    <span className="font-medium">
                      {systemHealth.server_info?.cpu_usage
                        ? `${((systemHealth.server_info.cpu_usage.user + systemHealth.server_info.cpu_usage.system) / 1000000).toFixed(2)}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Memory Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heap Used:</span>
                    <span className="font-medium">
                      {formatMemoryUsage(systemHealth.server_info?.memory_usage?.heapUsed || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heap Total:</span>
                    <span className="font-medium">
                      {formatMemoryUsage(systemHealth.server_info?.memory_usage?.heapTotal || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">External:</span>
                    <span className="font-medium">
                      {formatMemoryUsage(systemHealth.server_info?.memory_usage?.external || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">RSS:</span>
                    <span className="font-medium">
                      {formatMemoryUsage(systemHealth.server_info?.memory_usage?.rss || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MAINTENANCE TAB - DATABASE & CLEANUP OPERATIONS */}
      {activeTab === 'maintenance' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">🛠️ Database & Maintenance</h3>

          {/* Database Statistics - ONLY IN MAINTENANCE TAB */}
          {databaseStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{databaseStats?.tables?.length || 0}</p>
                <p className="text-sm text-blue-800">Total Tables</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {databaseStats?.tables?.reduce((total, table) => total + parseInt(table.live_tuples || 0), 0) || 0}
                </p>
                <p className="text-sm text-green-800">Total Records</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {databaseStats?.database_info?.database_size || 'N/A'}
                </p>
                <p className="text-sm text-purple-800">Database Size</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cleanup Operations */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">🧹 Cleanup Operations</h4>
              <div className="space-y-3">
                <button
                  onClick={() => handleCleanAuditLogs(30)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">Clean Audit Logs (30 days)</div>
                  <div className="text-sm text-gray-600">Hapus audit logs lebih dari 30 hari</div>
                </button>

                <button
                  onClick={() => handleCleanAuditLogs(90)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">Clean Audit Logs (90 days)</div>
                  <div className="text-sm text-gray-600">Hapus audit logs lebih dari 90 hari</div>
                </button>

                <button
                  onClick={() => handleCleanAuditLogs(365)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">Clean Audit Logs (1 year)</div>
                  <div className="text-sm text-gray-600">Hapus audit logs lebih dari 1 tahun</div>
                </button>
              </div>
            </div>

            {/* Database Health */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">📊 Database Health</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Connection Status:</span>
                  <span className={`font-medium ${
                    systemHealth?.system_health?.status === 'healthy'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {systemHealth?.system_health?.status || 'Unknown'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-medium">
                    {systemHealth?.system_health?.response_time || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Active Connections:</span>
                  <span className="font-medium">
                    {databaseStats?.connections?.active_connections || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Last Backup:</span>
                  <span className="font-medium">N/A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT TAB - INTEGRATED AUDIT LOGS */}
      {activeTab === 'audit' && (
        <Suspense fallback={
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat audit logs...</p>
          </div>
        }>
          <AuditLogsPanel />
        </Suspense>
      )}

      {/* Maintenance Form Modal */}
      {showMaintenanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Schedule System Maintenance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance Type
                </label>
                <select
                  value={maintenanceData.type}
                  onChange={(e) => setMaintenanceData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="database_cleanup">Database Cleanup</option>
                  <option value="system_restart">System Restart</option>
                  <option value="cache_clear">Cache Clear</option>
                  <option value="log_rotation">Log Rotation</option>
                  <option value="security_scan">Security Scan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={maintenanceData.description}
                  onChange={(e) => setMaintenanceData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                  placeholder="Deskripsi maintenance yang akan dilakukan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={maintenanceData.scheduled_time}
                  onChange={(e) => setMaintenanceData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={maintenanceData.notify_users}
                    onChange={(e) => setMaintenanceData(prev => ({ ...prev, notify_users: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Notify users about maintenance</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleTriggerMaintenance}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Schedule
              </button>
              <button
                onClick={() => setShowMaintenanceForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMaintenancePanel;
