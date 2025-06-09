// src/components/manager/StaffManagement.jsx
import { useState, useEffect } from 'react';
import { getManagerUsers, updateManagerUserRole, updateManagerUserStatus } from '../../api/managerAPI';
import LoadingSpinner from '../LoadingSpinner';
import Notification from '../Notification';

const StaffManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  });

  // Manager can only manage staff below their level
  const roleOptions = [
    { value: 'all', label: 'Semua Role' },
    { value: 'staff_kasir', label: 'Staff Kasir' },
    { value: 'operator_lapangan', label: 'Operator Lapangan' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak Aktif' },
    { value: 'suspended', label: 'Suspended' }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getManagerUsers();
      if (response.success) {
        setUsers(response.data || []);
      } else {
        showNotification('error', 'Gagal memuat data pengguna');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      showNotification('error', 'Terjadi kesalahan saat memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Filter by role
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status);
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

    setFilteredUsers(filtered);
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      setProcessing(userId);
      const response = await updateManagerUserRole(userId, newRole);

      if (response.success) {
        showNotification('success', 'Role pengguna berhasil diperbarui');
        loadUsers();
        closeModal();
      } else {
        showNotification('error', response.error || 'Gagal memperbarui role pengguna');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      showNotification('error', 'Terjadi kesalahan saat memperbarui role pengguna');
    } finally {
      setProcessing(null);
    }
  };

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      setProcessing(userId);
      const response = await updateManagerUserStatus(userId, newStatus);

      if (response.success) {
        showNotification('success', 'Status pengguna berhasil diperbarui');
        loadUsers();
        closeModal();
      } else {
        showNotification('error', response.error || 'Gagal memperbarui status pengguna');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      showNotification('error', 'Terjadi kesalahan saat memperbarui status pengguna');
    } finally {
      setProcessing(null);
    }
  };

  const openModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType('');
    setShowModal(false);
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const hideNotification = () => {
    setNotification({ show: false, type: '', message: '' });
  };

  const getRoleLabel = (role) => {
    const option = roleOptions.find(opt => opt.value === role);
    return option ? option.label : role;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-gray-100 text-gray-900';
      case 'inactive':
        return 'bg-gray-100 text-gray-900';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'manajer_futsal':
        return 'bg-gray-100 text-gray-900';
      case 'staff_kasir':
        return 'bg-gray-100 text-gray-900';
      case 'operator_lapangan':
        return 'bg-gray-100 text-gray-900';
      case 'penyewa':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat data pengguna..." />;
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
          <h2 className="text-3xl font-bold text-gray-900">Manajemen Staff</h2>
          <p className="text-gray-600">Kelola pengguna dan staff dengan kontrol manajer</p>
        </div>
        <button
          onClick={loadUsers}
          className="bg-gray-800 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-500 transition duration-200 flex items-center space-x-2"
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
              <p className="text-gray-600 font-semibold mb-1">Total Pengguna</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold mb-1">Staff Aktif</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active' && ['staff_kasir', 'operator_lapangan', 'manajer_futsal'].includes(u.role)).length}
              </p>
            </div>
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold mb-1">Total Staff</p>
              <p className="text-3xl font-bold text-orange-900">
                {users.filter(u => ['staff_kasir', 'operator_lapangan'].includes(u.role)).length}
              </p>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">👨‍💼</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold mb-1">Suspended</p>
              <p className="text-3xl font-bold text-red-900">
                {users.filter(u => u.status === 'suspended').length}
              </p>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Pengguna</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cari Pengguna</label>
            <input
              type="text"
              placeholder="Nama, email, atau ID..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
            >
              {roleOptions.map(option => (
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
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
            className="text-gray-900 hover:text-gray-900 text-sm font-medium"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bergabung
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi Manager
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-gray-800 rounded-full flex items-center justify-center text-gray-900 font-bold">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || 'User'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.employee_id && (
                            <div className="text-xs text-gray-400">ID: {user.employee_id}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal(user, 'role')}
                          className="bg-gray-800 text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-500 transition duration-200"
                        >
                          Ubah Role
                        </button>
                        <button
                          onClick={() => openModal(user, 'status')}
                          className="bg-gray-800 text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-500 transition duration-200"
                        >
                          Ubah Status
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Pengguna</h3>
            <p className="text-gray-500">
              {Object.values(filters).some(v => v && v !== 'all')
                ? 'Tidak ada pengguna yang sesuai dengan filter yang dipilih.'
                : 'Belum ada pengguna yang terdaftar.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {modalType === 'role' ? 'Ubah Role Pengguna' : 'Ubah Status Pengguna'}
              </h3>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Pengguna: <span className="font-medium">{selectedUser.name}</span></p>
                <p className="text-sm text-gray-600">Email: <span className="font-medium">{selectedUser.email}</span></p>
              </div>

              {modalType === 'role' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Role Baru</label>
                  <select
                    id="newRole"
                    defaultValue={selectedUser.role}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
                  >
                    {roleOptions.filter(opt => opt.value !== 'all').map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Manager hanya dapat mengatur role Staff Kasir dan Operator Lapangan
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Status Baru</label>
                  <select
                    id="newStatus"
                    defaultValue={selectedUser.status}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
                  >
                    {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={closeModal}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const newValue = modalType === 'role'
                    ? document.getElementById('newRole').value
                    : document.getElementById('newStatus').value;

                  if (modalType === 'role') {
                    handleRoleUpdate(selectedUser.id, newValue);
                  } else {
                    handleStatusUpdate(selectedUser.id, newValue);
                  }
                }}
                disabled={processing === selectedUser.id}
                className="px-6 py-2 bg-gray-800 text-gray-900 rounded-lg hover:bg-gray-500 transition duration-200 disabled:opacity-50"
              >
                {processing === selectedUser.id ? 'Memproses...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
