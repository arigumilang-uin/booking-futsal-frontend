// src/components/PromotionsManagementPanel.jsx
import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';

const PromotionsManagementPanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [newPromotion, setNewPromotion] = useState({
    name: '',
    description: '',
    code: '',
    type: 'percentage',
    value: '',
    min_booking_amount: '',
    max_discount: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
    is_active: true,
    applicable_fields: [],
    applicable_roles: ['penyewa']
  });

  useEffect(() => {
    if (user?.role === 'supervisor_sistem') {
      loadPromotions();
    }
  }, [user, filters]);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const response = await fetch('/api/admin/promotions?' + new URLSearchParams(params), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPromotions(data.data?.promotions || []);
      }
    } catch (error) {
      console.error('Error loading promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromotion = async () => {
    try {
      if (!newPromotion.name || !newPromotion.code || !newPromotion.value) {
        alert('Name, code, dan value harus diisi');
        return;
      }

      const response = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newPromotion,
          value: parseFloat(newPromotion.value),
          min_booking_amount: newPromotion.min_booking_amount ? parseFloat(newPromotion.min_booking_amount) : null,
          max_discount: newPromotion.max_discount ? parseFloat(newPromotion.max_discount) : null,
          usage_limit: newPromotion.usage_limit ? parseInt(newPromotion.usage_limit) : null
        })
      });

      if (response.ok) {
        await loadPromotions();
        resetForm();
        setShowCreateForm(false);
        alert('Promosi berhasil dibuat');
      }
    } catch (error) {
      console.error('Error creating promotion:', error);
      alert('Gagal membuat promosi: ' + error.message);
    }
  };

  const handleUpdatePromotion = async () => {
    try {
      if (!editingPromotion.name || !editingPromotion.code || !editingPromotion.value) {
        alert('Name, code, dan value harus diisi');
        return;
      }

      const response = await fetch(`/api/admin/promotions/${editingPromotion.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...editingPromotion,
          value: parseFloat(editingPromotion.value),
          min_booking_amount: editingPromotion.min_booking_amount ? parseFloat(editingPromotion.min_booking_amount) : null,
          max_discount: editingPromotion.max_discount ? parseFloat(editingPromotion.max_discount) : null,
          usage_limit: editingPromotion.usage_limit ? parseInt(editingPromotion.usage_limit) : null
        })
      });

      if (response.ok) {
        await loadPromotions();
        setEditingPromotion(null);
        alert('Promosi berhasil diupdate');
      }
    } catch (error) {
      console.error('Error updating promotion:', error);
      alert('Gagal mengupdate promosi: ' + error.message);
    }
  };

  const resetForm = () => {
    setNewPromotion({
      name: '',
      description: '',
      code: '',
      type: 'percentage',
      value: '',
      min_booking_amount: '',
      max_discount: '',
      usage_limit: '',
      start_date: '',
      end_date: '',
      is_active: true,
      applicable_fields: [],
      applicable_roles: ['penyewa']
    });
  };

  const getStatusColor = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);

    if (!promotion.is_active) return 'bg-gray-100 text-gray-900';
    if (now < startDate) return 'bg-gray-100 text-gray-900';
    if (now > endDate) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-900';
  };

  const getStatusText = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);

    if (!promotion.is_active) return 'Inactive';
    if (now < startDate) return 'Scheduled';
    if (now > endDate) return 'Expired';
    return 'Active';
  };

  if (user?.role !== 'supervisor_sistem') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Akses ditolak. Hanya supervisor sistem yang dapat mengelola promosi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            🎯 Promotions Management
          </h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gray-800 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-500"
          >
            ➕ Buat Promosi
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
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Semua Type</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>

          <input
            type="text"
            placeholder="Cari promosi..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />

          <button
            onClick={loadPromotions}
            className="bg-gray-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Create/Edit Promotion Form */}
      {(showCreateForm || editingPromotion) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingPromotion ? 'Edit Promosi' : 'Buat Promosi Baru'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingPromotion ? editingPromotion.name : newPromotion.name}
                onChange={(e) => {
                  if (editingPromotion) {
                    setEditingPromotion(prev => ({ ...prev, name: e.target.value }));
                  } else {
                    setNewPromotion(prev => ({ ...prev, name: e.target.value }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Nama promosi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingPromotion ? editingPromotion.code : newPromotion.code}
                onChange={(e) => {
                  if (editingPromotion) {
                    setEditingPromotion(prev => ({ ...prev, code: e.target.value.toUpperCase() }));
                  } else {
                    setNewPromotion(prev => ({ ...prev, code: e.target.value.toUpperCase() }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="PROMO2024"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={editingPromotion ? editingPromotion.description : newPromotion.description}
                onChange={(e) => {
                  if (editingPromotion) {
                    setEditingPromotion(prev => ({ ...prev, description: e.target.value }));
                  } else {
                    setNewPromotion(prev => ({ ...prev, description: e.target.value }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="2"
                placeholder="Deskripsi promosi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={editingPromotion ? editingPromotion.type : newPromotion.type}
                onChange={(e) => {
                  if (editingPromotion) {
                    setEditingPromotion(prev => ({ ...prev, type: e.target.value }));
                  } else {
                    setNewPromotion(prev => ({ ...prev, type: e.target.value }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Rp)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={editingPromotion ? editingPromotion.value : newPromotion.value}
                onChange={(e) => {
                  if (editingPromotion) {
                    setEditingPromotion(prev => ({ ...prev, value: e.target.value }));
                  } else {
                    setNewPromotion(prev => ({ ...prev, value: e.target.value }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder={editingPromotion?.type === 'percentage' || newPromotion.type === 'percentage' ? '10' : '50000'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Booking Amount</label>
              <input
                type="number"
                value={editingPromotion ? editingPromotion.min_booking_amount : newPromotion.min_booking_amount}
                onChange={(e) => {
                  if (editingPromotion) {
                    setEditingPromotion(prev => ({ ...prev, min_booking_amount: e.target.value }));
                  } else {
                    setNewPromotion(prev => ({ ...prev, min_booking_amount: e.target.value }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="100000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount</label>
              <input
                type="number"
                value={editingPromotion ? editingPromotion.max_discount : newPromotion.max_discount}
                onChange={(e) => {
                  if (editingPromotion) {
                    setEditingPromotion(prev => ({ ...prev, max_discount: e.target.value }));
                  } else {
                    setNewPromotion(prev => ({ ...prev, max_discount: e.target.value }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit</label>
              <input
                type="number"
                value={editingPromotion ? editingPromotion.usage_limit : newPromotion.usage_limit}
                onChange={(e) => {
                  if (editingPromotion) {
                    setEditingPromotion(prev => ({ ...prev, usage_limit: e.target.value }));
                  } else {
                    setNewPromotion(prev => ({ ...prev, usage_limit: e.target.value }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="datetime-local"
                value={editingPromotion ? editingPromotion.start_date : newPromotion.start_date}
                onChange={(e) => {
                  if (editingPromotion) {
                    setEditingPromotion(prev => ({ ...prev, start_date: e.target.value }));
                  } else {
                    setNewPromotion(prev => ({ ...prev, start_date: e.target.value }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="datetime-local"
                value={editingPromotion ? editingPromotion.end_date : newPromotion.end_date}
                onChange={(e) => {
                  if (editingPromotion) {
                    setEditingPromotion(prev => ({ ...prev, end_date: e.target.value }));
                  } else {
                    setNewPromotion(prev => ({ ...prev, end_date: e.target.value }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingPromotion ? editingPromotion.is_active : newPromotion.is_active}
                  onChange={(e) => {
                    if (editingPromotion) {
                      setEditingPromotion(prev => ({ ...prev, is_active: e.target.checked }));
                    } else {
                      setNewPromotion(prev => ({ ...prev, is_active: e.target.checked }));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Aktifkan promosi</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={editingPromotion ? handleUpdatePromotion : handleCreatePromotion}
              className="bg-gray-800 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-500"
            >
              {editingPromotion ? 'Update' : 'Simpan'}
            </button>
            <button
              onClick={() => {
                if (editingPromotion) {
                  setEditingPromotion(null);
                } else {
                  setShowCreateForm(false);
                  resetForm();
                }
              }}
              className="bg-gray-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Promotions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Daftar Promosi ({promotions.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat promosi...</p>
          </div>
        ) : promotions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Tidak ada promosi ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promosi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
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
                {promotions.map((promotion) => (
                  <tr key={promotion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                        <div className="text-sm text-gray-500">Code: {promotion.code}</div>
                        {promotion.description && (
                          <div className="text-xs text-gray-400 mt-1">{promotion.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {promotion.type === 'percentage' ? `${promotion.value}%` : `Rp ${promotion.value?.toLocaleString('id-ID')}`}
                      </div>
                      {promotion.max_discount && (
                        <div className="text-xs text-gray-500">Max: Rp {promotion.max_discount.toLocaleString('id-ID')}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(promotion.start_date).toLocaleDateString('id-ID')}</div>
                      <div>{new Date(promotion.end_date).toLocaleDateString('id-ID')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{promotion.usage_count || 0} / {promotion.usage_limit || '∞'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(promotion)}`}>
                        {getStatusText(promotion)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingPromotion(promotion)}
                          className="text-gray-900 hover:text-gray-900"
                        >
                          Edit
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

export default PromotionsManagementPanel;
