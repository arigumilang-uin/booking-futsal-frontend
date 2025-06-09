// src/components/operator/OperatorBookingPanel.jsx
import { useState, useEffect } from 'react';
import {
  getAllBookingsForOperator,
  getBookingDetailForOperator,
  confirmBooking,
  completeBooking,
  getBookingStatusColor,
  formatOperatorTime,
  formatOperatorDate
} from '../../api/operatorAPI';

const OperatorBookingPanel = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filter, setFilter] = useState('all');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await getAllBookingsForOperator(params);
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookingDetail = async (bookingId) => {
    try {
      const response = await getBookingDetailForOperator(bookingId);
      if (response.success) {
        setSelectedBooking(response.data);
      }
    } catch (error) {
      console.error('Error loading booking detail:', error);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      setProcessing(true);
      const response = await confirmBooking(bookingId, 'Booking dikonfirmasi oleh operator');
      if (response.success) {
        await loadBookings();
        if (selectedBooking?.id === bookingId) {
          await loadBookingDetail(bookingId);
        }
        alert('Booking berhasil dikonfirmasi');
      } else {
        alert('Gagal mengkonfirmasi booking: ' + response.error);
        if (response.details) {
          console.log('Details:', response.details);
        }
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Terjadi kesalahan saat mengkonfirmasi booking');
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      setProcessing(true);
      const response = await completeBooking(bookingId, {
        completion_notes: 'Booking selesai dimainkan',
        completed_at: new Date().toISOString()
      });
      if (response.success) {
        await loadBookings();
        if (selectedBooking?.id === bookingId) {
          await loadBookingDetail(bookingId);
        }
        alert('Booking berhasil diselesaikan');
      } else {
        alert('Gagal menyelesaikan booking: ' + response.error);
      }
    } catch (error) {
      console.error('Error completing booking:', error);
      alert('Terjadi kesalahan saat menyelesaikan booking');
    } finally {
      setProcessing(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat data booking...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-2xl text-gray-900">📅</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manajemen Booking</h2>
          <p className="text-gray-600">Kelola booking untuk lapangan yang ditugaskan</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        {[
          { id: 'all', label: 'Semua', count: bookings.length },
          { id: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
          { id: 'confirmed', label: 'Dikonfirmasi', count: bookings.filter(b => b.status === 'confirmed').length },
          { id: 'completed', label: 'Selesai', count: bookings.filter(b => b.status === 'completed').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${filter === tab.id
              ? 'bg-gray-800 text-gray-900'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bookings List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Daftar Booking ({filteredBookings.length})
          </h3>

          {filteredBookings.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Booking</h3>
              <p className="text-gray-600">Tidak ada booking untuk filter yang dipilih</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`bg-white rounded-2xl shadow-lg border p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${selectedBooking?.id === booking.id ? 'ring-2 ring-gray-800 border-gray-200' : 'border-gray-200'
                    }`}
                  onClick={() => loadBookingDetail(booking.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <span className="text-lg">📅</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{booking.customer_name}</h4>
                        <p className="text-sm text-gray-600">{booking.field_name}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBookingStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tanggal:</span>
                      <p className="font-medium">{formatOperatorDate(booking.date)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Waktu:</span>
                      <p className="font-medium">{booking.time_slot}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <p className="font-medium">Rp {booking.total_amount?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment:</span>
                      <p className={`font-medium ${booking.payment_status === 'paid' ? 'text-gray-900' :
                        booking.payment_status === 'pending' ? 'text-gray-900' : 'text-red-600'
                        }`}>
                        {booking.payment_status}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-4">
                    {booking.status === 'pending' && booking.payment_status === 'paid' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmBooking(booking.id);
                        }}
                        disabled={processing}
                        className="flex-1 bg-gray-800 text-gray-900 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        Konfirmasi
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteBooking(booking.id);
                        }}
                        disabled={processing}
                        className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        Selesaikan
                      </button>
                    )}
                    {booking.status === 'pending' && booking.payment_status !== 'paid' && (
                      <div className="flex-1 bg-gray-100 text-white px-3 py-2 rounded-lg text-xs font-medium text-center">
                        Menunggu Pembayaran
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div>
          {selectedBooking ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Detail Booking</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Informasi Customer</h4>
                  <p className="text-sm text-gray-600">{selectedBooking.customer_name}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.customer_email}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Informasi Booking</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                    <div>
                      <span className="text-gray-600">Lapangan:</span>
                      <p className="font-medium">{selectedBooking.field_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tanggal:</span>
                      <p className="font-medium">{formatOperatorDate(selectedBooking.date)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Waktu:</span>
                      <p className="font-medium">{selectedBooking.time_slot}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Durasi:</span>
                      <p className="font-medium">{selectedBooking.duration || 1} jam</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Status & Pembayaran</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                    <div>
                      <span className="text-gray-600">Status Booking:</span>
                      <p className="font-medium">{selectedBooking.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status Pembayaran:</span>
                      <p className="font-medium">{selectedBooking.payment_status}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Bayar:</span>
                      <p className="font-medium">Rp {selectedBooking.total_amount?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Metode Bayar:</span>
                      <p className="font-medium">{selectedBooking.payment_method || 'Transfer'}</p>
                    </div>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900">Catatan</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pilih Booking</h3>
              <p className="text-gray-600">Klik pada booking di sebelah kiri untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperatorBookingPanel;
