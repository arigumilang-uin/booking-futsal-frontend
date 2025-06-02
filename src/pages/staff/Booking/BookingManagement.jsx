// src/pages/staff/Booking/BookingManagement.jsx
import { useState, useEffect } from 'react';
import { getAllBookings, confirmBooking, rejectBooking, updateBookingStatus } from '../../../api/bookingAPI';
import { getStatusColor, formatDate, formatCurrency } from '../../../utils/testHelpers';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Notification from '../../../components/Notification';
import useAuth from '../../../hooks/useAuth';

const BookingManagement = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Filter states
  const [filters, setFilters] = useState({
    status: 'semua',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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
      const response = await getAllBookings();
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

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.customer_name?.toLowerCase().includes(searchLower) ||
        booking.field_name?.toLowerCase().includes(searchLower) ||
        booking.booking_code?.toLowerCase().includes(searchLower) ||
        booking.id?.toString().includes(searchLower)
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

  const handleConfirmBooking = async (bookingId) => {
    if (!window.confirm('Apakah Anda yakin ingin mengkonfirmasi booking ini?')) {
      return;
    }

    try {
      setProcessing(bookingId);
      const response = await confirmBooking(bookingId);

      if (response.success) {
        showNotification('success', 'Booking berhasil dikonfirmasi');
        loadBookings();
      } else {
        showNotification('error', response.error || 'Gagal mengkonfirmasi booking');
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      showNotification('error', 'Terjadi kesalahan saat mengkonfirmasi booking');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectBooking = async (bookingId, reason) => {
    try {
      setProcessing(bookingId);
      const response = await rejectBooking(bookingId, reason);

      if (response.success) {
        showNotification('success', 'Booking berhasil ditolak');
        loadBookings();
        setRejectReason('');
      } else {
        showNotification('error', response.error || 'Gagal menolak booking');
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      showNotification('error', 'Terjadi kesalahan saat menolak booking');
    } finally {
      setProcessing(null);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      setProcessing(bookingId);
      const response = await updateBookingStatus(bookingId, newStatus);

      if (response.success) {
        showNotification('success', `Status booking berhasil diubah ke ${newStatus}`);
        loadBookings();
      } else {
        showNotification('error', response.error || 'Gagal mengubah status booking');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      showNotification('error', 'Terjadi kesalahan saat mengubah status booking');
    } finally {
      setProcessing(null);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const hideNotification = () => {
    setNotification({ show: false, type: '', message: '' });
  };

  const openDetailModal = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedBooking(null);
    setShowDetailModal(false);
    setRejectReason('');
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const canManageBooking = (booking) => {
    // Check user permissions based on role
    if (user?.role === 'supervisor_sistem') return true;
    if (user?.role === 'manajer_futsal') return true;
    if (user?.role === 'operator_lapangan') return booking.status === 'pending';
    return false;
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Memuat data booking..." />;
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
        <h1 className="text-3xl font-bold text-gray-900">Kelola Booking</h1>
        <p className="text-gray-600 mt-1">Kelola dan pantau semua booking lapangan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Booking</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredBookings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Menunggu Konfirmasi</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredBookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Dikonfirmasi</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredBookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(filteredBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0))}
              </p>
            </div>
          </div>
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
              placeholder="Nama customer, lapangan, atau kode..."
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

      {/* Booking Table */}
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
                    Customer
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
                        {booking.customer_name || 'Customer'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.customer_email || 'N/A'}
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
                        onClick={() => openDetailModal(booking)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Detail
                      </button>
                      {canManageBooking(booking) && booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleConfirmBooking(booking.id)}
                            disabled={processing === booking.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            {processing === booking.id ? 'Proses...' : 'Konfirmasi'}
                          </button>
                          <button
                            onClick={() => openDetailModal(booking)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Tolak
                          </button>
                        </>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Booking</h3>
            <p className="text-gray-500">
              {filters.status !== 'semua' || filters.search || filters.dateFrom || filters.dateTo
                ? 'Tidak ada booking yang sesuai dengan filter yang dipilih.'
                : 'Belum ada booking yang perlu dikelola.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Detail Booking</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Booking</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kode Booking:</span>
                      <span className="font-medium">#{selectedBooking.booking_code || selectedBooking.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                        {getStatusLabel(selectedBooking.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal:</span>
                      <span className="font-medium">{selectedBooking.date ? formatDate(selectedBooking.date) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Waktu:</span>
                      <span className="font-medium">{selectedBooking.time_slot || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durasi:</span>
                      <span className="font-medium">{selectedBooking.duration || 1} jam</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium text-blue-600">
                        {selectedBooking.total_amount ? formatCurrency(selectedBooking.total_amount) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Customer</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nama:</span>
                      <span className="font-medium">{selectedBooking.customer_name || 'Customer'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedBooking.customer_email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telepon:</span>
                      <span className="font-medium">{selectedBooking.customer_phone || 'N/A'}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">Informasi Lapangan</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nama:</span>
                      <span className="font-medium">{selectedBooking.field_name || 'Lapangan'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jenis:</span>
                      <span className="font-medium">{selectedBooking.field_type || 'Futsal'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Catatan</h3>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-4">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {/* Reject Reason Input */}
              {canManageBooking(selectedBooking) && selectedBooking.status === 'pending' && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tolak Booking</h3>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Masukkan alasan penolakan..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={closeDetailModal}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
              >
                Tutup
              </button>
              {canManageBooking(selectedBooking) && selectedBooking.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleConfirmBooking(selectedBooking.id);
                      closeDetailModal();
                    }}
                    disabled={processing === selectedBooking.id}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 disabled:opacity-50"
                  >
                    Konfirmasi
                  </button>
                  <button
                    onClick={() => {
                      if (rejectReason.trim()) {
                        handleRejectBooking(selectedBooking.id, rejectReason);
                        closeDetailModal();
                      } else {
                        showNotification('error', 'Masukkan alasan penolakan');
                      }
                    }}
                    disabled={processing === selectedBooking.id || !rejectReason.trim()}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 disabled:opacity-50"
                  >
                    Tolak
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
