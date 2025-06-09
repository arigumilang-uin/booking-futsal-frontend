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
      case 'supervisor_sistem': return 'bg-purple-100 text-purple-800';
      case 'manajer_futsal': return 'bg-blue-100 text-blue-800';
      case 'operator_lapangan': return 'bg-green-100 text-green-800';
      case 'staff_kasir': return 'bg-yellow-100 text-yellow-800';
      case 'penyewa': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            👥 User Management
          </h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ➕ Tambah Staff
          </button>
        </div>

        {/* Role Statistics */}
        {roleStats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{roleStats.supervisor_count || 0}</p>
              <p className="text-sm text-purple-800">Supervisor</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{roleStats.manager_count || 0}</p>
              <p className="text-sm text-blue-800">Manager</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{roleStats.operator_count || 0}</p>
              <p className="text-sm text-green-800">Operator</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{roleStats.kasir_count || 0}</p>
              <p className="text-sm text-yellow-800">Kasir</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-gray-600">{roleStats.customer_count || 0}</p>
              <p className="text-sm text-gray-800">Penyewa</p>
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
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Simpan
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
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                        ? 'bg-green-100 text-green-800'
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
                          className="text-blue-600 hover:text-blue-900"
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
                          className={`${userData.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
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
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Ubah Role
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
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
