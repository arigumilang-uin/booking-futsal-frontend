// src/components/manager/ManagerFieldAssignmentPanel.jsx
import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { assignOperatorToField, unassignOperatorFromField } from '../../api/fieldAPI';
import LoadingSpinner from '../LoadingSpinner';
import Notification from '../Notification';

const ManagerFieldAssignmentPanel = () => {
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]);
  const [operators, setOperators] = useState([]);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [assignmentLoading, setAssignmentLoading] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load fields and operators in parallel
      const [fieldsResponse, operatorsResponse, usersResponse] = await Promise.all([
        axiosInstance.get('/admin/fields'),
        axiosInstance.get('/admin/operators'),
        axiosInstance.get('/admin/users') // Debug: get all users to see roles
      ]);

      console.log('🏟️ Fields response:', fieldsResponse.data);
      console.log('👥 Operators response:', operatorsResponse.data);
      console.log('👤 All users response (for debug):', usersResponse.data);

      // Debug: Check all users and their roles
      if (usersResponse.data.success) {
        const allUsers = usersResponse.data.data?.users || usersResponse.data.data || [];
        console.log('👤 All users roles:', allUsers.map(u => ({ id: u.id, name: u.name, role: u.role, is_active: u.is_active })));
        console.log('👤 Users with operator_lapangan role:', allUsers.filter(u => u.role === 'operator_lapangan'));
      }

      // Process fields data
      if (fieldsResponse.data.success) {
        const fieldsData = fieldsResponse.data.data?.fields || fieldsResponse.data.data || [];
        setFields(fieldsData);
      } else {
        showNotification('error', 'Gagal memuat data lapangan');
        setFields([]);
      }

      // Process operators data
      if (operatorsResponse.data.success) {
        const operatorsData = operatorsResponse.data.data || [];
        console.log('👥 Operators data processed:', operatorsData);
        console.log('👥 Operators with role operator_lapangan:', operatorsData.filter(o => o.role === 'operator_lapangan'));
        setOperators(operatorsData);
      } else {
        console.error('❌ Operators API failed:', operatorsResponse.data);
        showNotification('error', 'Gagal memuat data operator');
        setOperators([]);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('error', 'Terjadi kesalahan saat memuat data');
      setFields([]);
      setOperators([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOperator = async (fieldId, operatorId) => {
    const fieldName = fields.find(f => f.id === fieldId)?.name || 'Lapangan';
    const operatorName = operators.find(o => o.id === operatorId)?.name || 'Operator';

    if (!confirm(`Apakah Anda yakin ingin menugaskan "${operatorName}" ke "${fieldName}"?`)) {
      return;
    }

    try {
      setAssignmentLoading(prev => ({ ...prev, [fieldId]: true }));

      await assignOperatorToField(fieldId, operatorId);

      // Update local state
      setFields(prevFields =>
        prevFields.map(field =>
          field.id === fieldId
            ? { ...field, assigned_operator: operatorId, operator_name: operatorName }
            : field
        )
      );

      showNotification('success', `${operatorName} berhasil ditugaskan ke ${fieldName}`);
    } catch (error) {
      console.error('Error assigning operator:', error);
      showNotification('error', error.response?.data?.error || 'Gagal menugaskan operator');
    } finally {
      setAssignmentLoading(prev => ({ ...prev, [fieldId]: false }));
    }
  };

  const handleUnassignOperator = async (fieldId) => {
    const field = fields.find(f => f.id === fieldId);
    const fieldName = field?.name || 'Lapangan';
    const operatorName = field?.operator_name || 'Operator';

    if (!confirm(`Apakah Anda yakin ingin membatalkan penugasan "${operatorName}" dari "${fieldName}"?`)) {
      return;
    }

    try {
      setAssignmentLoading(prev => ({ ...prev, [fieldId]: true }));

      await unassignOperatorFromField(fieldId);

      // Update local state
      setFields(prevFields =>
        prevFields.map(field =>
          field.id === fieldId
            ? { ...field, assigned_operator: null, operator_name: null }
            : field
        )
      );

      showNotification('success', `Penugasan operator dari ${fieldName} berhasil dibatalkan`);
    } catch (error) {
      console.error('Error unassigning operator:', error);
      showNotification('error', error.response?.data?.error || 'Gagal membatalkan penugasan operator');
    } finally {
      setAssignmentLoading(prev => ({ ...prev, [fieldId]: false }));
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const hideNotification = () => {
    setNotification({ show: false, type: '', message: '' });
  };

  const getAvailableOperators = (currentFieldId) => {
    // Get operators that are not assigned to any field, or assigned to current field
    const assignedOperatorIds = fields
      .filter(field => field.id !== currentFieldId && field.assigned_operator)
      .map(field => field.assigned_operator);

    // Filter operators: must be operator_lapangan role, active, and not assigned to other fields
    const availableOps = operators.filter(operator => {
      const isOperatorRole = operator.role === 'operator_lapangan';
      const isNotAssigned = !assignedOperatorIds.includes(operator.id);
      const isActive = operator.is_active !== false; // Handle undefined as true

      console.log(`🔍 Operator ${operator.name} (${operator.id}):`, {
        role: operator.role,
        isOperatorRole,
        isNotAssigned,
        isActive,
        available: isOperatorRole && isNotAssigned && isActive
      });

      return isOperatorRole && isNotAssigned && isActive;
    });

    console.log(`📋 Available operators for field ${currentFieldId}:`, availableOps);
    return availableOps;
  };

  if (loading) {
    return <LoadingSpinner text="Memuat data assignment..." />;
  }

  return (
    <div className="p-6">
      <Notification
        type={notification.type}
        message={notification.message}
        show={notification.show}
        onClose={hideNotification}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Assignment Operator ke Lapangan</h2>
          <p className="text-gray-600">Kelola penugasan operator lapangan ke setiap lapangan</p>
        </div>
        <button
          onClick={loadData}
          className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-200 flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold mb-1">Total Lapangan</p>
              <p className="text-3xl font-bold text-gray-900">{fields.length}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🏟️</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold mb-1">Total Operator</p>
              <p className="text-3xl font-bold text-gray-900">
                {operators.filter(o => o.role === 'operator_lapangan').length}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold mb-1">Sudah Ditugaskan</p>
              <p className="text-3xl font-bold text-gray-900">
                {fields.filter(f => f.assigned_operator).length}
              </p>
            </div>
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold mb-1">Belum Ditugaskan</p>
              <p className="text-3xl font-bold text-gray-900">
                {fields.filter(f => !f.assigned_operator).length}
              </p>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Table */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        {fields.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lapangan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis & Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operator Ditugaskan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi Assignment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fields.map((field) => (
                  <tr key={field.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {field.name?.charAt(0).toUpperCase() || 'L'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{field.name}</div>
                          <div className="text-sm text-gray-500">{field.location}</div>
                          <div className="text-xs text-gray-400">ID: {field.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {field.type === 'futsal' ? 'Futsal' :
                            field.type === 'mini_soccer' ? 'Mini Soccer' :
                              field.type || 'Unknown'}
                        </span>
                        <br />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${field.status === 'active' ? 'bg-green-100 text-green-800' :
                          field.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {field.status === 'active' ? 'Aktif' :
                            field.status === 'maintenance' ? 'Maintenance' :
                              field.status === 'inactive' ? 'Tidak Aktif' :
                                field.status || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {field.assigned_operator ? (
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {field.operator_name?.charAt(0).toUpperCase() || 'O'}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {field.operator_name || 'Operator'}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {field.assigned_operator}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Belum ditugaskan</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {field.assigned_operator ? (
                          <button
                            onClick={() => handleUnassignOperator(field.id)}
                            disabled={assignmentLoading[field.id]}
                            className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs font-medium hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                          >
                            {assignmentLoading[field.id] ? 'Loading...' : 'Batalkan'}
                          </button>
                        ) : (
                          <select
                            onChange={(e) => {
                              const operatorId = e.target.value ? parseInt(e.target.value) : null;
                              if (operatorId) {
                                handleAssignOperator(field.id, operatorId);
                              }
                            }}
                            disabled={assignmentLoading[field.id]}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-600 disabled:opacity-50"
                          >
                            <option value="">-- Pilih Operator --</option>
                            {getAvailableOperators(field.id).map(operator => (
                              <option key={operator.id} value={operator.id}>
                                {operator.name} ({operator.employee_id || operator.id})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏟️</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Lapangan</h3>
            <p className="text-gray-500">
              Belum ada lapangan yang dapat dikelola assignment-nya.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerFieldAssignmentPanel;
