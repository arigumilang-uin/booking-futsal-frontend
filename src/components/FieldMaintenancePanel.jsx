// src/components/FieldMaintenancePanel.jsx
import { useState, useEffect, useCallback } from 'react';
import { 
  getMaintenanceSchedule,
  createMaintenanceTask,
  updateMaintenanceTask,
  getMaintenanceHistory,
  getEquipmentInventory,
  reportFieldIssue
} from '../api/fieldAPI';
import useAuth from '../hooks/useAuth';

const FieldMaintenancePanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [formData, setFormData] = useState({
    field_id: '',
    maintenance_type: 'routine',
    title: '',
    description: '',
    scheduled_date: '',
    estimated_duration: 60,
    priority: 'medium',
    assigned_to: '',
    equipment_needed: [],
    cost_estimate: 0
  });
  const [issueData, setIssueData] = useState({
    field_id: '',
    issue_type: 'equipment',
    title: '',
    description: '',
    severity: 'medium',
    location: '',
    photo_url: ''
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [scheduleRes, historyRes, equipmentRes] = await Promise.allSettled([
        getMaintenanceSchedule(),
        getMaintenanceHistory({ limit: 20 }),
        getEquipmentInventory()
      ]);

      if (scheduleRes.status === 'fulfilled' && scheduleRes.value.success) {
        setMaintenanceSchedule(scheduleRes.value.data || []);
      }

      if (historyRes.status === 'fulfilled' && historyRes.value.success) {
        setMaintenanceHistory(historyRes.value.data || []);
      }

      if (equipmentRes.status === 'fulfilled' && equipmentRes.value.success) {
        setEquipment(equipmentRes.value.data || []);
      }

    } catch (error) {
      console.error('Error loading maintenance data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateMaintenance = async () => {
    try {
      if (!formData.field_id || !formData.title || !formData.scheduled_date) {
        alert('Field, title, dan scheduled date harus diisi');
        return;
      }

      const response = await createMaintenanceTask(formData);
      if (response.success) {
        await loadData();
        setFormData({
          field_id: '',
          maintenance_type: 'routine',
          title: '',
          description: '',
          scheduled_date: '',
          estimated_duration: 60,
          priority: 'medium',
          assigned_to: '',
          equipment_needed: [],
          cost_estimate: 0
        });
        setShowCreateForm(false);
        alert('Maintenance task berhasil dibuat');
      }
    } catch (error) {
      console.error('Error creating maintenance task:', error);
      alert('Gagal membuat maintenance task: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReportIssue = async () => {
    try {
      if (!issueData.field_id || !issueData.title || !issueData.description) {
        alert('Field, title, dan description harus diisi');
        return;
      }

      const response = await reportFieldIssue(issueData);
      if (response.success) {
        await loadData();
        setIssueData({
          field_id: '',
          issue_type: 'equipment',
          title: '',
          description: '',
          severity: 'medium',
          location: '',
          photo_url: ''
        });
        setShowIssueForm(false);
        alert('Issue berhasil dilaporkan');
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      alert('Gagal melaporkan issue: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateMaintenanceStatus = async (taskId, status) => {
    try {
      const response = await updateMaintenanceTask(taskId, { status });
      if (response.success) {
        await loadData();
        alert('Status maintenance berhasil diupdate');
      }
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      alert('Gagal mengupdate status: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'overdue': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🔧 Field Maintenance</h2>
          <p className="text-gray-600">Kelola maintenance lapangan dan equipment</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowIssueForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            🚨 Report Issue
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ➕ Schedule Maintenance
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'schedule', label: 'Maintenance Schedule', icon: '📅' },
              { id: 'history', label: 'History', icon: '📋' },
              { id: 'equipment', label: 'Equipment', icon: '🛠️' }
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

        <div className="p-6">
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Scheduled Maintenance</h3>
              {maintenanceSchedule.length > 0 ? (
                <div className="space-y-4">
                  {maintenanceSchedule.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>🏟️ {task.field_name}</span>
                            <span>📅 {formatDate(task.scheduled_date)}</span>
                            <span>⏱️ {task.estimated_duration} min</span>
                            {task.assigned_to && <span>👤 {task.assigned_to}</span>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {task.status === 'scheduled' && (
                            <button
                              onClick={() => handleUpdateMaintenanceStatus(task.id, 'in_progress')}
                              className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                            >
                              Start
                            </button>
                          )}
                          {task.status === 'in_progress' && (
                            <button
                              onClick={() => handleUpdateMaintenanceStatus(task.id, 'completed')}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada maintenance yang dijadwalkan
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Maintenance History</h3>
              {maintenanceHistory.length > 0 ? (
                <div className="space-y-4">
                  {maintenanceHistory.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>🏟️ {task.field_name}</span>
                            <span>📅 {formatDate(task.completed_date || task.scheduled_date)}</span>
                            <span>💰 {task.actual_cost ? `Rp ${task.actual_cost.toLocaleString()}` : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada history maintenance
                </div>
              )}
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Equipment Inventory</h3>
              {equipment.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {equipment.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'available' ? 'bg-green-100 text-green-800' :
                          item.status === 'in_use' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                      <div className="text-sm text-gray-500">
                        <div>📦 Quantity: {item.quantity}</div>
                        <div>📍 Location: {item.location}</div>
                        <div>🔧 Last Maintenance: {item.last_maintenance ? formatDate(item.last_maintenance) : 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada equipment terdaftar
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Maintenance Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Schedule New Maintenance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field</label>
                <select
                  value={formData.field_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, field_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select Field</option>
                  <option value="1">Field A</option>
                  <option value="2">Field B</option>
                  <option value="3">Field C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Type</label>
                <select
                  value={formData.maintenance_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, maintenance_type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="routine">Routine</option>
                  <option value="preventive">Preventive</option>
                  <option value="corrective">Corrective</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Maintenance task title"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                  placeholder="Detailed description of maintenance work"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="15"
                  step="15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost Estimate</label>
                <input
                  type="number"
                  value={formData.cost_estimate}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost_estimate: parseFloat(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateMaintenance}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Schedule
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Form Modal */}
      {showIssueForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Report Field Issue</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field</label>
                <select
                  value={issueData.field_id}
                  onChange={(e) => setIssueData(prev => ({ ...prev, field_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select Field</option>
                  <option value="1">Field A</option>
                  <option value="2">Field B</option>
                  <option value="3">Field C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
                <select
                  value={issueData.issue_type}
                  onChange={(e) => setIssueData(prev => ({ ...prev, issue_type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="equipment">Equipment</option>
                  <option value="surface">Surface</option>
                  <option value="lighting">Lighting</option>
                  <option value="safety">Safety</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={issueData.title}
                  onChange={(e) => setIssueData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={issueData.description}
                  onChange={(e) => setIssueData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                  placeholder="Detailed description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  value={issueData.severity}
                  onChange={(e) => setIssueData(prev => ({ ...prev, severity: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={issueData.location}
                  onChange={(e) => setIssueData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Specific location within the field"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleReportIssue}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Report Issue
              </button>
              <button
                onClick={() => setShowIssueForm(false)}
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

export default FieldMaintenancePanel;
