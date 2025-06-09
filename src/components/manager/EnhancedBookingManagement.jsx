// src/components/manager/EnhancedBookingManagement.jsx
import { useState, useEffect } from 'react';
import { getManagerBookings, updateManagerBookingStatus } from '../../api/managerAPI';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/testHelpers';
import LoadingSpinner from '../LoadingSpinner';
import Notification from '../Notification';

const EnhancedBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [reason, setReason] = useState('');

  // Enhanced filters
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
    field: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const statusOptions = [
    { value: 'all', label: 'Semua Status', count: 0 },
    { value: 'pending', label: 'Menunggu Konfirmasi', count: 0 },
    { value: 'confirmed', label: 'Dikonfirmasi', count: 0 },
    { value: 'completed', label: 'Selesai', count: 0 },
    { value: 'cancelled', label: 'Dibatalkan', count: 0 },
    { value: 'rejected', label: 'Ditolak', count: 0 }
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
      const response = await getManagerBookings();
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
    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.customer_name?.toLowerCase().includes(searchLower) ||
        booking.field_name?.toLowerCase().includes(searchLower) ||
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

    // Filter by field
    if (filters.field !== 'all') {
      filtered = filtered.filter(booking => booking.field_id === parseInt(filters.field));
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'customer':
          aValue = a.customer_name || '';
          bValue = b.customer_name || '';
          break;
        case 'amount':
          aValue = a.total_amount || 0;
          bValue = b.total_amount || 0;
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredBookings(filtered);
  };

  const handleStatusUpdate = async (bookingId, newStatus, reason = '') => {
    try {
      setProcessing(bookingId);
      const response = await updateManagerBookingStatus(bookingId, newStatus, reason);
      
      if (response.success) {
        showNotification('success', `Booking berhasil ${newStatus === 'confirmed' ? 'dikonfirmasi' : newStatus === 'rejected' ? 'ditolak' : 'diperbarui'}`);
        loadBookings();
        closeModal();
      } else {
        showNotification('error', response.error || 'Gagal memperbarui status booking');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      showNotification('error', 'Terjadi kesalahan saat memperbarui status booking');
    } finally {
      setProcessing(null);
    }
  };

  const openModal = (booking, action) => {
    setSelectedBooking(booking);
    setActionType(action);
    setShowModal(true);
    setReason('');
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setActionType('');
    setShowModal(false);
    setReason('');
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const hideNotification = () => {
    setNotification({ show: false, type: '', message: '' });
  };

  const getStatusCounts = () => {
    const counts = {};
    bookings.forEach(booking => {
      counts[booking.status] = (counts[booking.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return <LoadingSpinner text="Memuat data booking..." />;
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
          <h2 className="text-3xl font-bold text-gray-900">Kelola Booking</h2>
          <p className="text-gray-600">Manajemen booking dengan kontrol penuh untuk manajer</p>
        </div>
        <button
          onClick={loadBookings}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statusOptions.map(status => (
          <div
            key={status.value}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              filters.status === status.value
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-green-300'
            }`}
            onClick={() => setFilters(prev => ({ ...prev, status: status.value }))}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {status.value === 'all' ? bookings.length : statusCounts[status.value] || 0}
              </div>
              <div className="text-sm font-medium text-gray-600">{status.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-2xl shadow-lg border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Pencarian</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cari Booking</label>
            <input
              type="text"
              placeholder="Nama, lapangan, atau kode..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Urutkan</label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters(prev => ({ ...prev, sortBy, sortOrder }));
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="date-desc">Tanggal (Terbaru)</option>
              <option value="date-asc">Tanggal (Terlama)</option>
              <option value="customer-asc">Customer (A-Z)</option>
              <option value="customer-desc">Customer (Z-A)</option>
              <option value="amount-desc">Nilai (Tertinggi)</option>
              <option value="amount-asc">Nilai (Terendah)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({
              status: 'all',
              search: '',
              dateFrom: '',
              dateTo: '',
              field: 'all',
              sortBy: 'date',
              sortOrder: 'desc'
            })}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Booking Table */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        {filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lapangan & Waktu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi Manager
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          #{booking.booking_code || booking.id}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(booking.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.customer_name || 'Customer'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.customer_email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.field_name || 'Lapangan'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(booking.date)} • {booking.time_slot || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatCurrency(booking.total_amount || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openModal(booking, 'confirm')}
                              disabled={processing === booking.id}
                              className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50"
                            >
                              Konfirmasi
                            </button>
                            <button
                              onClick={() => openModal(booking, 'reject')}
                              disabled={processing === booking.id}
                              className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50"
                            >
                              Tolak
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openModal(booking, 'view')}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                          Detail
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
              <span className="text-3xl">📅</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Booking</h3>
            <p className="text-gray-500">
              {Object.values(filters).some(v => v && v !== 'all')
                ? 'Tidak ada booking yang sesuai dengan filter yang dipilih.'
                : 'Belum ada booking yang perlu dikelola.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">
                {actionType === 'confirm' ? 'Konfirmasi Booking' :
                 actionType === 'reject' ? 'Tolak Booking' : 'Detail Booking'}
              </h3>
            </div>
            
            <div className="p-6">
              {/* Booking details */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Info Booking</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kode:</span>
                      <span className="font-medium">#{selectedBooking.booking_code || selectedBooking.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal:</span>
                      <span className="font-medium">{formatDate(selectedBooking.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Waktu:</span>
                      <span className="font-medium">{selectedBooking.time_slot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium text-green-600">{formatCurrency(selectedBooking.total_amount)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Info Customer</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nama:</span>
                      <span className="font-medium">{selectedBooking.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedBooking.customer_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lapangan:</span>
                      <span className="font-medium">{selectedBooking.field_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action specific content */}
              {(actionType === 'confirm' || actionType === 'reject') && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {actionType === 'confirm' ? 'Catatan Konfirmasi (Opsional)' : 'Alasan Penolakan'}
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={actionType === 'confirm' ? 'Tambahkan catatan...' : 'Masukkan alasan penolakan...'}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required={actionType === 'reject'}
                  />
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
              {actionType === 'confirm' && (
                <button
                  onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed', reason)}
                  disabled={processing === selectedBooking.id}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50"
                >
                  {processing === selectedBooking.id ? 'Memproses...' : 'Konfirmasi Booking'}
                </button>
              )}
              {actionType === 'reject' && (
                <button
                  onClick={() => handleStatusUpdate(selectedBooking.id, 'rejected', reason)}
                  disabled={processing === selectedBooking.id || !reason.trim()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50"
                >
                  {processing === selectedBooking.id ? 'Memproses...' : 'Tolak Booking'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedBookingManagement;
