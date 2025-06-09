// src/components/manager/ManagerBookingPanel.jsx
import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { formatCurrency, formatDate } from '../../utils/testHelpers';
import LoadingSpinner from '../LoadingSpinner';
import Notification from '../Notification';
import BookingTimeline from '../tracking/BookingTimeline';
import PaymentLogs from '../tracking/PaymentLogs';

const ManagerBookingPanel = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showPaymentLogsModal, setShowPaymentLogsModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [actionType, setActionType] = useState('');
  const [reason, setReason] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'pending', label: 'Menunggu Konfirmasi' },
    { value: 'confirmed', label: 'Dikonfirmasi' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' }
  ];

  useEffect(() => {
    loadBookings();
  }, [filters]);

  const loadBookings = async () => {
    try {
      setLoading(true);

      const params = {
        status: filters.status !== 'all' ? filters.status : undefined,
        search: filters.search || undefined,
        date_from: filters.dateFrom || undefined,
        date_to: filters.dateTo || undefined
      };

      // Remove undefined values
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await axiosInstance.get('/staff/manager/bookings', { params });

      if (response.data.success) {
        const bookingData = response.data.data?.bookings || response.data.data || [];
        setBookings(Array.isArray(bookingData) ? bookingData : []);
      } else {
        showNotification('error', 'Gagal memuat data booking');
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      showNotification('error', 'Terjadi kesalahan saat memuat data booking');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus, reason = '') => {
    try {
      setProcessing(bookingId);
      const response = await axiosInstance.put(`/staff/manager/bookings/${bookingId}/status`, {
        status: newStatus,
        reason: reason
      });

      if (response.data.success) {
        showNotification('success', `Booking berhasil ${newStatus === 'confirmed' ? 'dikonfirmasi' : 'ditolak'}`);
        loadBookings();
        closeModal();
      } else {
        showNotification('error', response.data.error || 'Gagal memperbarui status booking');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-900';
      case 'confirmed': return 'bg-gray-100 text-gray-900';
      case 'completed': return 'bg-gray-100 text-gray-900';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-900';
    }
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
          <p className="text-gray-600">Manajemen booking dengan kontrol manajer</p>
        </div>
        <button
          onClick={loadBookings}
          className="bg-gray-800 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-500 transition duration-200 flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
            <div className="text-sm font-medium text-gray-600">Total Booking</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{statusCounts.pending || 0}</div>
            <div className="text-sm font-medium text-gray-600">Pending</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{statusCounts.confirmed || 0}</div>
            <div className="text-sm font-medium text-gray-600">Dikonfirmasi</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{statusCounts.completed || 0}</div>
            <div className="text-sm font-medium text-gray-600">Selesai</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Booking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cari Booking</label>
            <input
              type="text"
              placeholder="Nama customer atau kode..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Booking Table */}
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        {bookings.length > 0 ? (
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
                    Confirmed By
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
                {bookings.map((booking) => (
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
                          {booking.customer_name || booking.name || 'Customer'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.customer_email || booking.email || 'N/A'}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {booking.status === 'confirmed' ? (
                          <>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.confirmed_by_name || booking.confirmed_by || 'Staff'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {booking.confirmed_at ? formatDate(booking.confirmed_at) : 'Dikonfirmasi'}
                            </div>
                          </>
                        ) : booking.status === 'completed' ? (
                          <>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.completed_by_name || booking.completed_by || 'Staff'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Completed: {booking.completed_at ? formatDate(booking.completed_at) : 'Diselesaikan'}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-400">
                            {booking.status === 'pending' ? 'Menunggu konfirmasi' : '-'}
                          </div>
                        )}
                      </div>
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
                              className="bg-gray-800 text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-500 transition duration-200 disabled:opacity-50 text-xs"
                            >
                              Konfirmasi
                            </button>
                            <button
                              onClick={() => openModal(booking, 'reject')}
                              disabled={processing === booking.id}
                              className="bg-red-600 text-gray-900 px-3 py-1 rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 text-xs"
                            >
                              Tolak
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openModal(booking, 'view')}
                          className="bg-gray-800 text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-500 transition duration-200 text-xs"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowTimelineModal(true);
                          }}
                          className="bg-gray-800 text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-500 transition duration-200 text-xs"
                        >
                          📊 Timeline
                        </button>
                        {booking.payment_id && (
                          <button
                            onClick={() => {
                              setSelectedPaymentId(booking.payment_id);
                              setShowPaymentLogsModal(true);
                            }}
                            className="bg-gray-800 text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-500 transition duration-200 text-xs"
                          >
                            💳 Payment
                          </button>
                        )}
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
            <p className="text-gray-500">Belum ada booking yang perlu dikelola.</p>
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
                      <span className="font-medium text-gray-900">{formatCurrency(selectedBooking.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status Booking:</span>
                      <span className={`font-medium ${selectedBooking.status === 'confirmed' ? 'text-gray-900' :
                        selectedBooking.status === 'pending' ? 'text-gray-900' :
                          selectedBooking.status === 'completed' ? 'text-gray-900' : 'text-red-600'}`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status Payment:</span>
                      <span className={`font-medium ${selectedBooking.payment_status === 'paid' ? 'text-gray-900' :
                        selectedBooking.payment_status === 'pending' ? 'text-gray-900' : 'text-red-600'}`}>
                        {selectedBooking.payment_status || 'pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Info Customer</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nama:</span>
                      <span className="font-medium">{selectedBooking.customer_name || selectedBooking.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedBooking.customer_email || selectedBooking.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lapangan:</span>
                      <span className="font-medium">{selectedBooking.field_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Confirmation Info */}
              {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'completed') && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Info Konfirmasi</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {(selectedBooking.confirmed_by || selectedBooking.status === 'confirmed') && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Dikonfirmasi oleh:</span>
                          <span className="font-medium text-gray-900">
                            {selectedBooking.confirmed_by_name || selectedBooking.confirmed_by || 'Staff'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tanggal konfirmasi:</span>
                          <span className="font-medium text-gray-900">
                            {selectedBooking.confirmed_at ? formatDate(selectedBooking.confirmed_at) : 'Dikonfirmasi'}
                          </span>
                        </div>
                      </>
                    )}
                    {selectedBooking.completed_by && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Diselesaikan oleh:</span>
                          <span className="font-medium text-gray-900">{selectedBooking.completed_by_name || 'Staff'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tanggal selesai:</span>
                          <span className="font-medium text-gray-900">
                            {selectedBooking.completed_at ? formatDate(selectedBooking.completed_at) : 'N/A'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
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
                className="px-6 py-2 bg-gray-800 text-gray-900 rounded-lg hover:bg-gray-500 transition duration-200 disabled:opacity-50"
              >
                {processing === selectedBooking.id ? 'Memproses...' : 'Konfirmasi Booking'}
              </button>
            )}
            {actionType === 'reject' && (
              <button
                onClick={() => handleStatusUpdate(selectedBooking.id, 'rejected', reason)}
                disabled={processing === selectedBooking.id || !reason.trim()}
                className="px-6 py-2 bg-red-600 text-gray-900 rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50"
              >
                {processing === selectedBooking.id ? 'Memproses...' : 'Tolak Booking'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      <BookingTimeline
        bookingId={selectedBooking?.id}
        isOpen={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
      />

      {/* Payment Logs Modal */}
      <PaymentLogs
        paymentId={selectedPaymentId}
        isOpen={showPaymentLogsModal}
        onClose={() => setShowPaymentLogsModal(false)}
      />
    </div>
  );
};

export default ManagerBookingPanel;
