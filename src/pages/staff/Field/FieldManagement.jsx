// src/pages/staff/Field/FieldManagement.jsx
import { useState, useEffect } from 'react';
import {
  getAllFields,
  createField,
  updateField,
  deleteField,
  getOperators,
  assignOperatorToField,
  unassignOperatorFromField
} from '../../../api/fieldAPI';

const FieldManagement = () => {
  const [fields, setFields] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  });

  // Load fields and operators
  const loadFields = async () => {
    try {
      setLoading(true);
      const [fieldsResponse, operatorsResponse] = await Promise.all([
        getAllFields(filters),
        getOperators()
      ]);
      setFields(fieldsResponse.data || []);
      setOperators(operatorsResponse.data || []);
    } catch (err) {
      setError('Gagal memuat data lapangan');
      console.error('Load fields error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, [filters]);

  // Handle operator assignment
  const handleAssignOperator = async (fieldId, operatorId) => {
    try {
      if (operatorId) {
        await assignOperatorToField(fieldId, operatorId);
      } else {
        await unassignOperatorFromField(fieldId);
      }
      await loadFields(); // Reload data
      setShowAssignModal(false);
    } catch (err) {
      setError('Gagal menugaskan operator');
      console.error('Assign operator error:', err);
    }
  };

  // Handle field edit
  const handleEditField = (field) => {
    setSelectedField(field);
    setShowEditModal(true);
  };

  // Handle field delete
  const handleDeleteField = async (fieldId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus lapangan ini?')) {
      try {
        await deleteField(fieldId);
        await loadFields(); // Reload data
      } catch (err) {
        setError('Gagal menghapus lapangan');
        console.error('Delete field error:', err);
      }
    }
  };

  // Handle assign modal
  const handleShowAssignModal = (field) => {
    setSelectedField(field);
    setShowAssignModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-gray-900">Manajemen Lapangan</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
        >
          + Tambah Lapangan
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter Tipe
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Tipe</option>
              <option value="futsal">Futsal</option>
              <option value="mini_soccer">Mini Soccer</option>
              <option value="basketball">Basketball</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cari Lapangan
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Nama lapangan..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Fields Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Lapangan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Operator
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fields.map((field) => (
                <tr key={field.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {field.name?.charAt(0)?.toUpperCase() || 'L'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{field.name}</div>
                        <div className="text-sm text-gray-500">{field.type} • {field.capacity} orang</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${field.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : field.status === 'maintenance'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {field.status === 'active' ? 'Aktif' :
                        field.status === 'maintenance' ? 'Maintenance' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {field.operator_name ? (
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">{field.operator_name}</div>
                        <div className="text-gray-500">ID: {field.operator_employee_id}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Belum ditugaskan</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rp {field.price?.toLocaleString('id-ID') || '0'}/jam
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleShowAssignModal(field)}
                      className="text-purple-600 hover:text-purple-900 font-semibold"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => handleEditField(field)}
                      className="text-blue-600 hover:text-blue-900 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="text-red-600 hover:text-red-900 font-semibold"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Operator Modal */}
      {showAssignModal && selectedField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-black text-gray-900 mb-4">
              Assign Operator - {selectedField.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pilih Operator
                </label>
                <select
                  defaultValue={selectedField.assigned_operator || ''}
                  onChange={(e) => {
                    const operatorId = e.target.value ? parseInt(e.target.value) : null;
                    handleAssignOperator(selectedField.id, operatorId);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Pilih Operator --</option>
                  {operators.map(operator => (
                    <option key={operator.id} value={operator.id}>
                      {operator.name} ({operator.employee_id})
                      {operator.is_available ? '' : ' - Sudah Ditugaskan'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedField.assigned_operator && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Operator Saat Ini:</strong> {selectedField.operator_name}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Pilih operator baru untuk mengganti, atau pilih "-- Pilih Operator --" untuk menghapus penugasan.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldManagement;
