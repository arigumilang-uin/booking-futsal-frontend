// src/pages/customer/Field/FieldList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicFields } from '../../../api/fieldAPI';
import { formatCurrency } from '../../../utils/testHelpers';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Notification from '../../../components/Notification';

const FieldList = () => {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [filteredFields, setFilteredFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Filter states
  const [filters, setFilters] = useState({
    type: 'semua',
    priceRange: 'semua',
    search: '',
    location: 'semua'
  });

  const [selectedField, setSelectedField] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const typeOptions = [
    { value: 'semua', label: 'Semua Jenis' },
    { value: 'futsal', label: 'Futsal' },
    { value: 'mini_soccer', label: 'Mini Soccer' },
    { value: 'basketball', label: 'Basketball' }
  ];

  const priceRangeOptions = [
    { value: 'semua', label: 'Semua Harga' },
    { value: '0-100000', label: 'Di bawah Rp 100.000' },
    { value: '100000-150000', label: 'Rp 100.000 - Rp 150.000' },
    { value: '150000-200000', label: 'Rp 150.000 - Rp 200.000' },
    { value: '200000+', label: 'Di atas Rp 200.000' }
  ];

  const locationOptions = [
    { value: 'semua', label: 'Semua Lokasi' },
    { value: 'pekanbaru_pusat', label: 'Pekanbaru Pusat' },
    { value: 'pekanbaru_timur', label: 'Pekanbaru Timur' },
    { value: 'pekanbaru_barat', label: 'Pekanbaru Barat' },
    { value: 'pekanbaru_selatan', label: 'Pekanbaru Selatan' },
    { value: 'pekanbaru_utara', label: 'Pekanbaru Utara' }
  ];

  useEffect(() => {
    loadFields();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [fields, filters]);

  const loadFields = async () => {
    try {
      setLoading(true);
      const response = await getPublicFields();
      if (response.success) {
        setFields(response.data || []);
      } else {
        showNotification('error', 'Gagal memuat data lapangan');
      }
    } catch (error) {
      console.error('Error loading fields:', error);
      showNotification('error', 'Terjadi kesalahan saat memuat data lapangan');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...fields];

    // Filter by type
    if (filters.type !== 'semua') {
      filtered = filtered.filter(field => field.type === filters.type);
    }

    // Filter by price range
    if (filters.priceRange !== 'semua') {
      const [min, max] = filters.priceRange.split('-').map(p => p.replace('+', ''));
      filtered = filtered.filter(field => {
        const price = field.price_per_hour || 0;
        if (filters.priceRange.includes('+')) {
          return price >= parseInt(min);
        } else {
          return price >= parseInt(min) && price <= parseInt(max);
        }
      });
    }

    // Filter by search (name or description)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(field =>
        field.name?.toLowerCase().includes(searchLower) ||
        field.description?.toLowerCase().includes(searchLower) ||
        field.location?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by location
    if (filters.location !== 'semua') {
      filtered = filtered.filter(field => field.location === filters.location);
    }

    setFilteredFields(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const hideNotification = () => {
    setNotification({ show: false, type: '', message: '' });
  };

  const openDetailModal = (field) => {
    setSelectedField(field);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedField(null);
    setShowDetailModal(false);
  };

  const handleBookField = (field) => {
    navigate('/bookings/new', { state: { selectedField: field } });
  };

  const getFieldImage = (field) => {
    // Placeholder image based on field type
    const imageMap = {
      futsal: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
      mini_soccer: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop',
      basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop'
    };
    return imageMap[field.type] || imageMap.futsal;
  };

  const getAvailabilityStatus = (field) => {
    // Mock availability - in real app this would come from API
    const statuses = ['Tersedia', 'Hampir Penuh', 'Penuh'];
    const colors = ['text-green-600', 'text-yellow-600', 'text-red-600'];
    const randomIndex = Math.floor(Math.random() * statuses.length);
    return {
      status: statuses[randomIndex],
      color: colors[randomIndex]
    };
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Memuat daftar lapangan..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Notification
        type={notification.type}
        message={notification.message}
        show={notification.show}
        onClose={hideNotification}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Daftar Lapangan</h1>
        <p className="text-gray-600 mt-1">Temukan lapangan terbaik untuk kebutuhan olahraga Anda</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter & Pencarian</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Lapangan
            </label>
            <input
              type="text"
              placeholder="Nama lapangan atau lokasi..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Lapangan
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rentang Harga
            </label>
            <select
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {priceRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {locationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({ type: 'semua', priceRange: 'semua', search: '', location: 'semua' })}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Bersihkan Filter
          </button>
        </div>
      </div>

      {/* Field Grid */}
      {filteredFields.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((field) => {
            const availability = getAvailabilityStatus(field);
            return (
              <div key={field.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
                {/* Field Image */}
                <div className="relative h-48">
                  <img
                    src={getFieldImage(field)}
                    alt={field.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                      {field.type?.toUpperCase() || 'FUTSAL'}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`bg-white px-2 py-1 rounded text-sm font-medium ${availability.color}`}>
                      {availability.status}
                    </span>
                  </div>
                </div>

                {/* Field Info */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{field.name || 'Lapangan Futsal'}</h3>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(field.price_per_hour || 100000)}
                      </p>
                      <p className="text-sm text-gray-500">per jam</p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {field.description || 'Lapangan berkualitas dengan fasilitas lengkap untuk pengalaman bermain yang optimal.'}
                  </p>

                  {/* Location */}
                  <div className="flex items-center text-gray-500 mb-3">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span className="text-sm">{field.location || 'Pekanbaru, Riau'}</span>
                  </div>

                  {/* Facilities */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(field.facilities || ['AC', 'Toilet', 'Parkir']).slice(0, 3).map((facility, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {facility}
                      </span>
                    ))}
                    {(field.facilities || []).length > 3 && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        +{(field.facilities || []).length - 3} lainnya
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openDetailModal(field)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition duration-200 text-sm font-medium"
                    >
                      Lihat Detail
                    </button>
                    <button
                      onClick={() => handleBookField(field)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 text-sm font-medium"
                    >
                      Booking Sekarang
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Lapangan</h3>
          <p className="text-gray-500 mb-6">
            Tidak ada lapangan yang sesuai dengan filter yang dipilih.
          </p>
          <button
            onClick={() => setFilters({ type: 'semua', priceRange: 'semua', search: '', location: 'semua' })}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Field Detail Modal */}
      {showDetailModal && selectedField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{selectedField.name}</h2>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Field Image */}
              <img
                src={getFieldImage(selectedField)}
                alt={selectedField.name}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />

              {/* Field Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Lapangan</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jenis:</span>
                      <span className="font-medium">{selectedField.type?.toUpperCase() || 'FUTSAL'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Harga:</span>
                      <span className="font-medium text-blue-600">
                        {formatCurrency(selectedField.price_per_hour || 100000)}/jam
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lokasi:</span>
                      <span className="font-medium">{selectedField.location || 'Pekanbaru, Riau'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kapasitas:</span>
                      <span className="font-medium">{selectedField.capacity || '10-12'} orang</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Fasilitas</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(selectedField.facilities || ['AC', 'Toilet', 'Parkir', 'Sound System', 'Ruang Ganti', 'Kantin']).map((facility, index) => (
                      <div key={index} className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-sm">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi</h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedField.description || 'Lapangan berkualitas tinggi dengan fasilitas lengkap dan modern. Cocok untuk berbagai kegiatan olahraga dengan standar internasional. Dilengkapi dengan sistem pencahayaan yang baik dan permukaan lapangan yang aman.'}
                </p>
              </div>

              {/* Operating Hours */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Jam Operasional</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Senin - Jumat:</span>
                      <span className="ml-2">08:00 - 22:00</span>
                    </div>
                    <div>
                      <span className="font-medium">Sabtu - Minggu:</span>
                      <span className="ml-2">07:00 - 23:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={closeDetailModal}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  closeDetailModal();
                  handleBookField(selectedField);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Booking Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldList;
