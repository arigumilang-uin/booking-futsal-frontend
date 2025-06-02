// src/pages/customer/Booking/BookingList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerBookings, cancelBooking } from '../../../api/bookingAPI';
import { getStatusColor, formatDate, formatCurrency } from '../../../utils/testHelpers';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Notification from '../../../components/Notification';

const BookingList = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Filter states
  const [filters, setFilters] = useState({
    status: 'semua',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  const statusOptions = [
    { value: 'semua', label: 'Semua Status' },
    { value: 'pending', label: 'Menunggu Konfirmasi' },
    { value: 'confirmed', label: 'Dikonfirmasi' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
    { value: 'rejected', label: 'Ditolak' }
  ];

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await getCustomerBookings();
      if (response.success) {
        setBookings(response.data || []);
      } else {
        showNotification('error', 'Gagal memuat data booking');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      showNotification('error', 'Terjadi kesalahan saat memuat data booking');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Filter by status
    if (filters.status !== 'semua') {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Filter by search (field name or booking ID)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.field_name?.toLowerCase().includes(searchLower) ||
        booking.id?.toString().includes(searchLower) ||
        booking.booking_code?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(booking =>
        new Date(booking.date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(booking =>
        new Date(booking.date) <= new Date(filters.dateTo)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan booking ini?')) {
      return;
    }

    try {
      setCancelling(bookingId);
      const response = await cancelBooking(bookingId);

      if (response.success) {
        showNotification('success', 'Booking berhasil dibatalkan');
        loadBookings(); // Reload data
      } else {
        showNotification('error', response.error || 'Gagal membatalkan booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showNotification('error', 'Terjadi kesalahan saat membatalkan booking');
    } finally {
      setCancelling(null);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const hideNotification = () => {
    setNotification({ show: false, type: '', message: '' });
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Memuat daftar booking..." />;
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daftar Booking Saya</h1>
            <p className="text-gray-600 mt-1">Kelola dan pantau semua booking lapangan Anda</p>
          </div>
          <button
            onClick={() => navigate('/bookings/new')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Booking Baru
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter & Pencarian</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Booking
            </label>
            <input
              type="text"
              placeholder="Nama lapangan atau kode booking..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({ status: 'semua', search: '', dateFrom: '', dateTo: '' })}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Bersihkan Filter
          </button>
        </div>
      </div>

      {/* Booking List */}
      <div className="bg-white rounded-lg shadow">
        {filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lapangan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal & Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{booking.booking_code || booking.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.created_at ? formatDate(booking.created_at) : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.field_name || 'Lapangan'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.field_type || 'Futsal'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.date ? formatDate(booking.date) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.time_slot || 'N/A'} ({booking.duration || 1} jam)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.total_amount ? formatCurrency(booking.total_amount) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => navigate(`/bookings/${booking.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Detail
                      </button>
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancelling === booking.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {cancelling === booking.id ? 'Membatalkan...' : 'Batal'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Booking</h3>
            <p className="text-gray-500 mb-6">
              {filters.status !== 'semua' || filters.search || filters.dateFrom || filters.dateTo
                ? 'Tidak ada booking yang sesuai dengan filter yang dipilih.'
                : 'Anda belum memiliki booking apapun. Mulai booking lapangan sekarang!'
              }
            </p>
            <button
              onClick={() => navigate('/bookings/new')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Buat Booking Pertama
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredBookings.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{filteredBookings.length}</p>
              <p className="text-sm text-gray-600">Total Booking</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {filteredBookings.filter(b => b.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Menunggu Konfirmasi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {filteredBookings.filter(b => b.status === 'confirmed').length}
              </p>
              <p className="text-sm text-gray-600">Dikonfirmasi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(filteredBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0))}
              </p>
              <p className="text-sm text-gray-600">Total Nilai</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;
