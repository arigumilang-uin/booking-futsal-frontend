// src/components/manager/FieldManagement.jsx
import { useState, useEffect } from 'react';
import { getManagerFields, createManagerField, updateManagerField } from '../../api/managerAPI';
import { formatCurrency } from '../../utils/testHelpers';
import LoadingSpinner from '../LoadingSpinner';
import Notification from '../Notification';

const FieldManagement = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [selectedField, setSelectedField] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    type: 'futsal',
    description: '',
    capacity: '',
    location: '',
    price_per_hour: '',
    facilities: '',
    status: 'active'
  });

  const fieldTypes = [
    { value: 'futsal', label: 'Futsal' },
    { value: 'mini_soccer', label: 'Mini Soccer' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'badminton', label: 'Badminton' },
    { value: 'volleyball', label: 'Volleyball' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Aktif' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inactive', label: 'Tidak Aktif' }
  ];

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      setLoading(true);
      const response = await getManagerFields();
      if (response.success) {
        setFields(response.data || []);
      } else {
        showNotification('error', response.error || 'Gagal memuat data lapangan');
      }
    } catch (error) {
      console.error('Error loading fields:', error);
      showNotification('error', 'Terjadi kesalahan saat memuat data lapangan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setProcessing(true);

      const fieldData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        capacity: parseInt(formData.capacity) || 22,
        location: formData.location,
        hourly_rate: parseFloat(formData.price_per_hour) || 0, // Backend expects hourly_rate
        facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f),
        status: formData.status
      };

      let response;
      if (modalType === 'create') {
        response = await createManagerField(fieldData);
      } else {
        response = await updateManagerField(selectedField.id, fieldData);
      }

      if (response.success) {
        showNotification('success', `Lapangan berhasil ${modalType === 'create' ? 'ditambahkan' : 'diperbarui'}`);
        loadFields();
        closeModal();
      } else {
        showNotification('error', response.error || `Gagal ${modalType === 'create' ? 'menambahkan' : 'memperbarui'} lapangan`);
      }
    } catch (error) {
      console.error('Error saving field:', error);
      showNotification('error', `Terjadi kesalahan saat ${modalType === 'create' ? 'menambahkan' : 'memperbarui'} lapangan`);
    } finally {
      setProcessing(false);
    }
  };

  const openCreateModal = () => {
    setModalType('create');
    setSelectedField(null);
    setFormData({
      name: '',
      type: 'futsal',
      description: '',
      capacity: '',
      location: '',
      price_per_hour: '',
      facilities: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const openEditModal = (field) => {
    setModalType('edit');
    setSelectedField(field);
    setFormData({
      name: field.name || '',
      type: field.type || 'futsal',
      description: field.description || '',
      capacity: field.capacity?.toString() || '',
      location: field.location || '',
      price_per_hour: field.price_per_hour?.toString() || '',
      facilities: Array.isArray(field.facilities) ? field.facilities.join(', ') : field.facilities || '',
      status: field.status || 'active'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('create');
    setSelectedField(null);
    setFormData({
      name: '',
      type: 'futsal',
      description: '',
      capacity: '',
      location: '',
      price_per_hour: '',
      facilities: '',
      status: 'active'
    });
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const hideNotification = () => {
    setNotification({ show: false, type: '', message: '' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'futsal':
        return 'bg-blue-100 text-blue-800';
      case 'mini_soccer':
        return 'bg-green-100 text-green-800';
      case 'basketball':
        return 'bg-orange-100 text-orange-800';
      case 'badminton':
        return 'bg-purple-100 text-purple-800';
      case 'volleyball':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat data lapangan..." />;
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
          <h2 className="text-3xl font-bold text-gray-900">Manajemen Lapangan</h2>
          <p className="text-gray-600">Kelola lapangan dan fasilitas dengan kontrol manajer</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={loadFields}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-200 flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Tambah Lapangan</span>
          </button>
        </div>
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
              <p className="text-gray-600 font-semibold mb-1">Lapangan Aktif</p>
              <p className="text-3xl font-bold text-green-900">
                {fields.filter(f => f.status === 'active').length}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold mb-1">Maintenance</p>
              <p className="text-3xl font-bold text-yellow-900">
                {fields.filter(f => f.status === 'maintenance').length}
              </p>
            </div>
            <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🔧</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 font-semibold mb-1">Rata-rata Harga</p>
              <p className="text-3xl font-bold text-purple-900">
                {formatCurrency(fields.reduce((sum, f) => sum + (f.price_per_hour || 0), 0) / Math.max(fields.length, 1))}
              </p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field) => (
          <div key={field.id} className="bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{field.name}</h3>
                  <div className="flex space-x-2 mb-2">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(field.type)}`}>
                      {fieldTypes.find(t => t.value === field.type)?.label || field.type}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(field.status)}`}>
                      {statusOptions.find(s => s.value === field.status)?.label || field.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => openEditModal(field)}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition duration-200"
                >
                  <span>✏️</span>
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Kapasitas:</span>
                  <span className="font-medium">{field.capacity || 'N/A'} orang</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Harga/Jam:</span>
                  <span className="font-bold text-green-600">{formatCurrency(field.price_per_hour || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lokasi:</span>
                  <span className="font-medium text-sm">{field.location || 'N/A'}</span>
                </div>
              </div>

              {field.description && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{field.description}</p>
                </div>
              )}

              {field.facilities && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Fasilitas:</p>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(field.facilities) ? field.facilities : field.facilities.split(',')).map((facility, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {facility.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏟️</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Lapangan</h3>
            <p className="text-gray-500 mb-4">Mulai dengan menambahkan lapangan pertama Anda.</p>
            <button
              onClick={openCreateModal}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200"
            >
              Tambah Lapangan
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">
                {modalType === 'create' ? 'Tambah Lapangan Baru' : 'Edit Lapangan'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lapangan *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Lapangan *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    {fieldTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kapasitas (orang)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harga per Jam (Rp) *</label>
                  <input
                    type="number"
                    value={formData.price_per_hour}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_per_hour: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="0"
                    step="1000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Contoh: Lantai 2, Area A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Deskripsi lapangan..."
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Fasilitas</label>
                <input
                  type="text"
                  value={formData.facilities}
                  onChange={(e) => setFormData(prev => ({ ...prev, facilities: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Pisahkan dengan koma: AC, Toilet, Parkir, dll"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50"
                >
                  {processing ? 'Menyimpan...' : modalType === 'create' ? 'Tambah Lapangan' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldManagement;
