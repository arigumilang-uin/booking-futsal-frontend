// src/components/FieldManagementPanel.jsx
import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';

const FieldManagementPanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [newField, setNewField] = useState({
    name: '',
    description: '',
    type: 'indoor',
    price_per_hour: '',
    capacity: '',
    facilities: [],
    location: '',
    is_active: true,
    maintenance_schedule: '',
    operating_hours: {
      start: '06:00',
      end: '23:00'
    }
  });

  useEffect(() => {
    if (user?.role === 'supervisor_sistem') {
      loadFields();
    }
  }, [user, filters]);

  const loadFields = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const response = await axiosInstance.get('/admin/fields', { params });
      console.log('✅ Fields data loaded:', response.data);
      // Backend returns data as array directly, not data.fields
      setFields(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error loading fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateField = async () => {
    try {
      if (!newField.name || !newField.price_per_hour) {
        alert('Name dan price per hour harus diisi');
        return;
      }

      const response = await fetch('/api/admin/fields', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newField,
          price_per_hour: parseFloat(newField.price_per_hour),
          capacity: newField.capacity ? parseInt(newField.capacity) : null,
          facilities: Array.isArray(newField.facilities) ? newField.facilities : newField.facilities.split(',').map(f => f.trim()).filter(f => f)
        })
      });

      if (response.ok) {
        await loadFields();
        resetForm();
        setShowCreateForm(false);
        alert('Lapangan berhasil dibuat');
      }
    } catch (error) {
      console.error('Error creating field:', error);
      alert('Gagal membuat lapangan: ' + error.message);
    }
  };

  const handleUpdateField = async () => {
    try {
      if (!editingField.name || !editingField.price_per_hour) {
        alert('Name dan price per hour harus diisi');
        return;
      }

      const response = await fetch(`/api/admin/fields/${editingField.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...editingField,
          price_per_hour: parseFloat(editingField.price_per_hour),
          capacity: editingField.capacity ? parseInt(editingField.capacity) : null,
          facilities: Array.isArray(editingField.facilities) ? editingField.facilities : editingField.facilities.split(',').map(f => f.trim()).filter(f => f)
        })
      });

      if (response.ok) {
        await loadFields();
        setEditingField(null);
        alert('Lapangan berhasil diupdate');
      }
    } catch (error) {
      console.error('Error updating field:', error);
      alert('Gagal mengupdate lapangan: ' + error.message);
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus lapangan ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/fields/${fieldId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadFields();
        alert('Lapangan berhasil dihapus');
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      alert('Gagal menghapus lapangan: ' + error.message);
    }
  };

  const resetForm = () => {
    setNewField({
      name: '',
      description: '',
      type: 'indoor',
      price_per_hour: '',
      capacity: '',
      facilities: [],
      location: '',
      is_active: true,
      maintenance_schedule: '',
      operating_hours: {
        start: '06:00',
        end: '23:00'
      }
    });
  };

  const getStatusColor = (field) => {
    // Use backend status field instead of is_active/maintenance_mode
    switch (field.status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (field) => {
    // Use backend status field with proper capitalization
    switch (field.status) {
      case 'active': return 'Active';
      case 'maintenance': return 'Maintenance';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  if (user?.role !== 'supervisor_sistem') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Akses ditolak. Hanya supervisor sistem yang dapat mengelola lapangan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            🏟️ Field Management
          </h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ➕ Tambah Lapangan
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Semua Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Semua Type</option>
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="synthetic">Synthetic</option>
            <option value="grass">Grass</option>
          </select>

          <input
            type="text"
            placeholder="Cari lapangan..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />

          <button
            onClick={loadFields}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Create/Edit Field Form */}
      {(showCreateForm || editingField) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingField ? 'Edit Lapangan' : 'Tambah Lapangan Baru'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingField ? editingField.name : newField.name}
                onChange={(e) => {
                  if (editingField) {
                    setEditingField(prev => ({ ...prev, name: e.target.value }));
                  } else {
                    setNewField(prev => ({ ...prev, name: e.target.value }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Lapangan A"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Hour <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={editingField ? editingField.price_per_hour : newField.price_per_hour}
                onChange={(e) => {
                  if (editingField) {
                    setEditingField(prev => ({ ...prev, price_per_hour: e.target.value }));
                  } else {
                    setNewField(prev => ({ ...prev, price_per_hour: e.target.value }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="100000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={editingField ? editingField.type : newField.type}
                onChange={(e) => {
                  if (editingField) {
                    setEditingField(prev => ({ ...prev, type: e.target.value }));
                  } else {
                    setNewField(prev => ({ ...prev, type: e.target.value }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="synthetic">Synthetic</option>
                <option value="grass">Grass</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
              <input
                type="number"
                value={editingField ? editingField.capacity : newField.capacity}
                onChange={(e) => {
                  if (editingField) {
                    setEditingField(prev => ({ ...prev, capacity: e.target.value }));
                  } else {
                    setNewField(prev => ({ ...prev, capacity: e.target.value }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="22"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={editingField ? editingField.description : newField.description}
                onChange={(e) => {
                  if (editingField) {
                    setEditingField(prev => ({ ...prev, description: e.target.value }));
                  } else {
                    setNewField(prev => ({ ...prev, description: e.target.value }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="2"
                placeholder="Deskripsi lapangan"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={editingField ? editingField.location : newField.location}
                onChange={(e) => {
                  if (editingField) {
                    setEditingField(prev => ({ ...prev, location: e.target.value }));
                  } else {
                    setNewField(prev => ({ ...prev, location: e.target.value }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Lantai 1, Sektor A"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facilities (comma separated)</label>
              <input
                type="text"
                value={editingField ? 
                  (Array.isArray(editingField.facilities) ? editingField.facilities.join(', ') : editingField.facilities) :
                  (Array.isArray(newField.facilities) ? newField.facilities.join(', ') : newField.facilities)
                }
                onChange={(e) => {
                  if (editingField) {
                    setEditingField(prev => ({ ...prev, facilities: e.target.value }));
                  } else {
                    setNewField(prev => ({ ...prev, facilities: e.target.value }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="AC, Shower, Parking, Locker"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operating Hours Start</label>
              <input
                type="time"
                value={editingField ? editingField.operating_hours?.start : newField.operating_hours.start}
                onChange={(e) => {
                  if (editingField) {
                    setEditingField(prev => ({ 
                      ...prev, 
                      operating_hours: { ...prev.operating_hours, start: e.target.value }
                    }));
                  } else {
                    setNewField(prev => ({ 
                      ...prev, 
                      operating_hours: { ...prev.operating_hours, start: e.target.value }
                    }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operating Hours End</label>
              <input
                type="time"
                value={editingField ? editingField.operating_hours?.end : newField.operating_hours.end}
                onChange={(e) => {
                  if (editingField) {
                    setEditingField(prev => ({ 
                      ...prev, 
                      operating_hours: { ...prev.operating_hours, end: e.target.value }
                    }));
                  } else {
                    setNewField(prev => ({ 
                      ...prev, 
                      operating_hours: { ...prev.operating_hours, end: e.target.value }
                    }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingField ? editingField.is_active : newField.is_active}
                  onChange={(e) => {
                    if (editingField) {
                      setEditingField(prev => ({ ...prev, is_active: e.target.checked }));
                    } else {
                      setNewField(prev => ({ ...prev, is_active: e.target.checked }));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Aktifkan lapangan</span>
              </label>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={editingField ? handleUpdateField : handleCreateField}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              {editingField ? 'Update' : 'Simpan'}
            </button>
            <button
              onClick={() => {
                if (editingField) {
                  setEditingField(null);
                } else {
                  setShowCreateForm(false);
                  resetForm();
                }
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Fields List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Daftar Lapangan ({fields.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat lapangan...</p>
          </div>
        ) : fields.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Tidak ada lapangan ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lapangan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operating Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fields.map((field) => (
                  <tr key={field.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{field.name}</div>
                        <div className="text-sm text-gray-500">{field.location}</div>
                        {field.description && (
                          <div className="text-xs text-gray-400 mt-1">{field.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{field.type}</div>
                      <div className="text-sm text-gray-500">Rp {field.price_per_hour?.toLocaleString('id-ID')}/jam</div>
                      {field.capacity && (
                        <div className="text-xs text-gray-400">Kapasitas: {field.capacity} orang</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{field.operating_hours?.start} - {field.operating_hours?.end}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(field)}`}>
                        {getStatusText(field)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingField(field)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldManagementPanel;
