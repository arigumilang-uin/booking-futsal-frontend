// src/components/manager/ManagerStaffPanel.jsx
import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import LoadingSpinner from '../LoadingSpinner';
import Notification from '../Notification';

const ManagerStaffPanel = () => {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  });

  // Manager can only manage staff below their level
  const managedRoles = [
    { value: 'all', label: 'Semua Staff' },
    { value: 'staff_kasir', label: 'Staff Kasir' },
    { value: 'operator_lapangan', label: 'Operator Lapangan' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak Aktif' }
  ];

  // Load staff data once on mount
  useEffect(() => {
    loadStaff();
  }, []);

  // Apply filters when data or filters change - like supervisor implementation
  useEffect(() => {
    applyFilters();
  }, [staff, filters]);

  const loadStaff = async () => {
    try {
      setLoading(true);

      // Load all users without filters - we'll filter client-side like supervisor
      const response = await axiosInstance.get('/admin/users');

      if (response.data.success) {
        const users = response.data.data?.users || response.data.data || [];

        // Filter only staff that manager can manage
        const managedStaff = users.filter(user =>
          ['staff_kasir', 'operator_lapangan'].includes(user.role)
        );

        setStaff(managedStaff);
      } else {
        showNotification('error', 'Gagal memuat data staff');
        setStaff([]);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
      showNotification('error', 'Terjadi kesalahan saat memuat data staff');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering like supervisor implementation
  const applyFilters = () => {
    let filtered = [...staff];

    // Filter by role
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Filter by status - use is_active field
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => {
        if (filters.status === 'active') {
          return user.is_active === true;
        } else {
          return user.is_active === false;
        }
      });
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.employee_id?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredStaff(filtered);
  };

  const handleRoleUpdate = async (userId, newRole) => {
    if (!['staff_kasir', 'operator_lapangan'].includes(newRole)) {
      showNotification('error', 'Manager hanya dapat mengatur role Staff Kasir dan Operator Lapangan');
      return;
    }

    const currentStaff = staff.find(s => s.id === userId);
    if (!currentStaff) {
      showNotification('error', 'Staff tidak ditemukan');
      return;
    }

    if (currentStaff.role === newRole) {
      showNotification('info', 'Role staff sudah sesuai');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin mengubah role "${currentStaff.name}" dari ${getRoleLabel(currentStaff.role)} menjadi ${getRoleLabel(newRole)}?`)) {
      return;
    }

    try {
      const response = await axiosInstance.put(`/staff/manager/users/${userId}/role`, {
        new_role: newRole
      });

      if (response.data.success) {
        showNotification('success', `Role ${currentStaff.name} berhasil diubah menjadi ${getRoleLabel(newRole)}`);
        // Update local state instead of reloading
        setStaff(prevStaff =>
          prevStaff.map(s =>
            s.id === userId ? { ...s, role: newRole } : s
          )
        );
      } else {
        showNotification('error', response.data.error || 'Gagal memperbarui role staff');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      showNotification('error', error.response?.data?.error || 'Terjadi kesalahan saat memperbarui role staff');
    }
  };

  const handleStatusUpdate = async (userId, isActive) => {
    const currentStaff = staff.find(s => s.id === userId);
    if (!currentStaff) {
      showNotification('error', 'Staff tidak ditemukan');
      return;
    }

    if (currentStaff.is_active === isActive) {
      showNotification('info', `Staff sudah ${isActive ? 'aktif' : 'tidak aktif'}`);
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin ${isActive ? 'mengaktifkan' : 'menonaktifkan'} staff "${currentStaff.name}"?`)) {
      return;
    }

    try {
      const response = await axiosInstance.put(`/staff/manager/users/${userId}/status`, {
        is_active: isActive
      });

      if (response.data.success) {
        showNotification('success', `${currentStaff.name} berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
        // Update local state instead of reloading
        setStaff(prevStaff =>
          prevStaff.map(s =>
            s.id === userId ? { ...s, is_active: isActive } : s
          )
        );
      } else {
        showNotification('error', response.data.error || 'Gagal memperbarui status staff');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('error', error.response?.data?.error || 'Terjadi kesalahan saat memperbarui status staff');
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const hideNotification = () => {
    setNotification({ show: false, type: '', message: '' });
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'staff_kasir': return 'Staff Kasir';
      case 'operator_lapangan': return 'Operator Lapangan';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'staff_kasir': return 'bg-blue-100 text-blue-800';
      case 'operator_lapangan': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat data staff..." />;
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
          <h2 className="text-3xl font-bold text-gray-900">Kelola Staff</h2>
          <p className="text-gray-600">Manajemen staff kasir dan operator lapangan</p>
        </div>
        <button
          onClick={loadStaff}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold mb-1">Total Staff</p>
              <p className="text-3xl font-bold text-gray-900">{staff.length}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold mb-1">Staff Kasir</p>
              <p className="text-3xl font-bold text-blue-900">
                {staff.filter(s => s.role === 'staff_kasir').length}
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold mb-1">Operator Lapangan</p>
              <p className="text-3xl font-bold text-green-900">
                {staff.filter(s => s.role === 'operator_lapangan').length}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🏟️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Staff</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cari Staff</label>
            <input
              type="text"
              placeholder="Nama atau email..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {managedRoles.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({ role: 'all', status: 'all', search: '' })}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        {filteredStaff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi Manager
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((staffMember) => (
                  <tr key={staffMember.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          {staffMember.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{staffMember.name || 'Staff'}</div>
                          <div className="text-sm text-gray-500">{staffMember.email}</div>
                          {staffMember.employee_id && (
                            <div className="text-xs text-gray-400">ID: {staffMember.employee_id}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(staffMember.role)}`}>
                        {getRoleLabel(staffMember.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${staffMember.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {staffMember.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {staffMember.last_login_at
                        ? new Date(staffMember.last_login_at).toLocaleDateString('id-ID')
                        : 'Belum pernah login'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <select
                          value={staffMember.role}
                          onChange={(e) => handleRoleUpdate(staffMember.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                          <option value="staff_kasir">Staff Kasir</option>
                          <option value="operator_lapangan">Operator Lapangan</option>
                        </select>
                        <button
                          onClick={() => handleStatusUpdate(staffMember.id, !staffMember.is_active)}
                          className={`px-3 py-1 rounded text-xs font-medium transition duration-200 ${staffMember.is_active
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                        >
                          {staffMember.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
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
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Staff</h3>
            <p className="text-gray-500">
              Belum ada staff yang dapat dikelola oleh manager.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerStaffPanel;
