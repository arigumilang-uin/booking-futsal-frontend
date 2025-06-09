// src/components/UserManagementPanel.jsx
import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import {
  getAllUsersForSupervisor,
  createStaffUser,
  forceUpdateUserRole,
  getRoleManagementDashboard,
  getAllUsersForRoleManagement,
  changeUserRoleDirect
} from '../api';
import axiosInstance from '../api/axiosInstance';

const UserManagementPanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [roleStats, setRoleStats] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    status: '',
    department: '',
    page: 1,
    limit: 20
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff_kasir',
    department: '',
    employee_id: ''
  });
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (user?.role === 'supervisor_sistem') {
      loadUsers();
      loadRoleStats();
    }
  }, [user, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      // Use admin endpoint with axiosInstance for proper authentication
      const response = await axiosInstance.get('/admin/users', { params });
      console.log('✅ Users data loaded:', response.data);
      setUsers(response.data.data?.users || response.data.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoleStats = async () => {
    try {
      // Use supervisor dashboard endpoint for role statistics with axiosInstance
      const response = await axiosInstance.get('/staff/supervisor/dashboard');
      console.log('✅ Role stats data loaded:', response.data);

      // Extract role statistics from supervisor dashboard
      const roleStats = response.data.data?.statistics?.users?.by_role || {};
      setRoleStats({
        supervisor_count: roleStats.supervisor_sistem || 0,
        manager_count: roleStats.manajer_futsal || 0,
        operator_count: roleStats.operator_lapangan || 0,
        kasir_count: roleStats.staff_kasir || 0,
        customer_count: roleStats.penyewa || 0,
        total_users: response.data.data?.overview?.total_users || 0
      });
    } catch (error) {
      console.error('Error loading role stats:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!newUser.name || !newUser.email || !newUser.role) {
        alert('Nama, email, dan role harus diisi');
        return;
      }

      const response = await createStaffUser(newUser);
      if (response.success) {
        await loadUsers();
        await loadRoleStats();
        setNewUser({
          name: '',
          email: '',
          phone: '',
          role: 'staff_kasir',
          department: '',
          employee_id: ''
        });
        setShowCreateForm(false);
        alert('Staff berhasil dibuat');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Gagal membuat staff: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRoleChange = async (userId, newRole, reason = 'Role changed by supervisor') => {
    if (!confirm(`Apakah Anda yakin ingin mengubah role user ini menjadi ${getRoleLabel(newRole)}?`)) {
      return;
    }

    try {
      const response = await changeUserRoleDirect(userId, newRole, reason);
      if (response.success) {
        await loadUsers();
        await loadRoleStats();
        setEditingUser(null);
        alert('Role berhasil diubah');
      } else {
        alert('Gagal mengubah role: ' + response.message);
      }
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Gagal mengubah role: ' + (error.response?.data?.message || error.message));
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'supervisor_sistem': return 'bg-gray-100 text-gray-900';
      case 'manajer_futsal': return 'bg-gray-100 text-gray-900';
      case 'operator_lapangan': return 'bg-gray-100 text-gray-900';
      case 'staff_kasir': return 'bg-gray-100 text-gray-900';
      case 'penyewa': return 'bg-gray-100 text-gray-900';
      default: return 'bg-gray-100 text-gray-900';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'supervisor_sistem': return 'Supervisor Sistem';
      case 'manajer_futsal': return 'Manajer Futsal';
      case 'operator_lapangan': return 'Operator Lapangan';
      case 'staff_kasir': return 'Staff Kasir';
      case 'penyewa': return 'Penyewa';
      default: return role;
    }
  };

  if (user?.role !== 'supervisor_sistem') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Akses ditolak. Hanya supervisor sistem yang dapat mengelola pengguna.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 management-panel">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">User Management</h2>
              <p className="text-sm font-medium text-gray-600">Kelola pengguna dan role sistem</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-medium">Tambah Staff</span>
          </button>
        </div>

        {/* Role Statistics */}
        {roleStats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-gray-900">{roleStats.supervisor_count || 0}</p>
                  <p className="text-sm font-semibold text-purple-700">Supervisor</p>
                </div>
                <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-gray-900">{roleStats.manager_count || 0}</p>
                  <p className="text-sm font-semibold text-blue-700">Manager</p>
                </div>
                <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-gray-900">{roleStats.operator_count || 0}</p>
                  <p className="text-sm font-semibold text-green-700">Operator</p>
                </div>
                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-gray-900">{roleStats.kasir_count || 0}</p>
                  <p className="text-sm font-semibold text-gray-700">Kasir</p>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-gray-900">{roleStats.customer_count || 0}</p>
                  <p className="text-sm font-semibold text-orange-700">Penyewa</p>
                </div>
                <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.role}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Semua Role</option>
            <option value="supervisor_sistem">Supervisor Sistem</option>
            <option value="manajer_futsal">Manajer Futsal</option>
            <option value="operator_lapangan">Operator Lapangan</option>
            <option value="staff_kasir">Staff Kasir</option>
            <option value="penyewa">Penyewa</option>
          </select>

          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>

          <input
            type="text"
            placeholder="Department..."
            value={filters.department}
            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value, page: 1 }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah Staff Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Nama lengkap"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telepon
              </label>
              <input
                type="text"
                value={newUser.phone}
                onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="staff_kasir">Staff Kasir</option>
                <option value="operator_lapangan">Operator Lapangan</option>
                <option value="manajer_futsal">Manajer Futsal</option>
                <option value="supervisor_sistem">Supervisor Sistem</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={newUser.department}
                onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="IT, Operations, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                value={newUser.employee_id}
                onChange={(e) => setNewUser(prev => ({ ...prev, employee_id: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="EMP001"
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleCreateUser}
              className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              Simpan Staff
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewUser({
                  name: '',
                  email: '',
                  phone: '',
                  role: 'staff_kasir',
                  department: '',
                  employee_id: ''
                });
              }}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Daftar Pengguna ({users.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userData) => (
                  <tr key={userData.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {userData.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                          <div className="text-sm text-gray-500">{userData.email}</div>
                          {userData.employee_id && (
                            <div className="text-xs text-gray-400">ID: {userData.employee_id}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userData.role)}`}>
                        {getRoleLabel(userData.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userData.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${userData.is_active
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {userData.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userData.last_login_at
                        ? new Date(userData.last_login_at).toLocaleDateString('id-ID')
                        : 'Belum pernah login'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingUser(userData)}
                          className="text-gray-900 hover:text-gray-900"
                        >
                          Edit Role
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Apakah Anda yakin ingin ${userData.is_active ? 'menonaktifkan' : 'mengaktifkan'} user ini?`)) {
                              try {
                                const response = await axiosInstance.patch(`/admin/users/${userData.id}/status`, {
                                  is_active: !userData.is_active
                                });
                                if (response.data.success) {
                                  await loadUsers();
                                  alert('Status user berhasil diubah');
                                } else {
                                  alert('Gagal mengubah status user: ' + response.data.message);
                                }
                              } catch (error) {
                                console.error('Error updating user status:', error);
                                alert('Gagal mengubah status user: ' + (error.response?.data?.message || error.message));
                              }
                            }
                          }}
                          className={`${userData.is_active ? 'text-red-600 hover:text-red-900' : 'text-gray-900 hover:text-gray-900'}`}
                        >
                          {userData.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('Apakah Anda yakin ingin menghapus user ini? (User akan dinonaktifkan)')) {
                              try {
                                const response = await axiosInstance.delete(`/admin/users/${userData.id}`);
                                if (response.data.success) {
                                  await loadUsers();
                                  alert('User berhasil dihapus (dinonaktifkan)');
                                } else {
                                  alert('Gagal menghapus user: ' + response.data.message);
                                }
                              } catch (error) {
                                console.error('Error deleting user:', error);
                                alert('Gagal menghapus user: ' + (error.response?.data?.message || error.message));
                              }
                            }
                          }}
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

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Ubah Role User</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">User: <strong>{editingUser.name}</strong></p>
                <p className="text-sm text-gray-600">Current Role: <strong>{getRoleLabel(editingUser.role)}</strong></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Role
                </label>
                <select
                  value={editingUser.newRole || editingUser.role}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, newRole: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="staff_kasir">Staff Kasir</option>
                  <option value="operator_lapangan">Operator Lapangan</option>
                  <option value="manajer_futsal">Manajer Futsal</option>
                  <option value="supervisor_sistem">Supervisor Sistem</option>
                  <option value="penyewa">Penyewa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={editingUser.reason || ''}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                  placeholder="Alasan perubahan role..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleRoleChange(editingUser.id, editingUser.newRole || editingUser.role, editingUser.reason)}
                className="bg-gray-800 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-500"
              >
                Ubah Role
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="bg-gray-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-600"
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

export default UserManagementPanel;
