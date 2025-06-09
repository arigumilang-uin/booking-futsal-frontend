// src/components/kasir/ManualPaymentModal.jsx
import { useState, useEffect } from 'react';
import {
  processManualPayment,
  getPaymentMethods,
  getAllBookingsForKasir,
  validatePaymentAmount,
  validateReferenceNumber
} from '../../api/kasirAPI';
import { formatCurrency } from '../../api/analyticsAPI';
import { X, CreditCard, Search, AlertCircle, CheckCircle } from 'lucide-react';

const ManualPaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    booking_id: '',
    method: '',
    amount: '',
    reference_number: '',
    notes: ''
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchBooking, setSearchBooking] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
      loadBookings();
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    try {
      const response = await getPaymentMethods();
      if (response.success) {
        setPaymentMethods(response.data?.manual_methods || []);
      }
    } catch (err) {
      console.error('Error loading payment methods:', err);
    }
  };

  const loadBookings = async () => {
    try {
      const response = await getAllBookingsForKasir({
        payment_status: 'pending',
        limit: 50
      });
      if (response.success) {
        setBookings(response.data || []);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
    }
  };

  const handleBookingSelect = (booking) => {
    setSelectedBooking(booking);
    setFormData(prev => ({
      ...prev,
      booking_id: booking.id,
      amount: booking.total_amount || ''
    }));
    setSearchBooking('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.booking_id || !formData.method || !formData.amount) {
      setError('Semua field wajib harus diisi');
      return;
    }

    const amountError = validatePaymentAmount(
      parseFloat(formData.amount),
      selectedBooking?.total_amount
    );
    if (amountError) {
      setError(amountError);
      return;
    }

    const referenceError = validateReferenceNumber(formData.method, formData.reference_number);
    if (referenceError) {
      setError(referenceError);
      return;
    }

    try {
      setLoading(true);
      const response = await processManualPayment({
        booking_id: parseInt(formData.booking_id),
        method: formData.method,
        amount: parseFloat(formData.amount),
        reference_number: formData.reference_number || null,
        notes: formData.notes || null
      });

      if (response.success) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        setError(response.message || 'Gagal memproses pembayaran');
      }
    } catch (err) {
      console.error('Error processing manual payment:', err);
      setError('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      booking_id: '',
      method: '',
      amount: '',
      reference_number: '',
      notes: ''
    });
    setSelectedBooking(null);
    setError('');
    setSearchBooking('');
  };

  const filteredBookings = bookings.filter(booking =>
    booking.id.toString().includes(searchBooking) ||
    booking.customer_name?.toLowerCase().includes(searchBooking.toLowerCase())
  );

  const selectedMethod = paymentMethods.find(method => method.value === formData.method);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Proses Pembayaran Manual</h3>
              <p className="text-gray-600">Input pembayaran cash atau transfer manual</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Booking Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Booking
            </label>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari booking ID atau nama customer..."
                  value={searchBooking}
                  onChange={(e) => setSearchBooking(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {searchBooking && (
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl">
                  {filteredBookings.map((booking) => (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => handleBookingSelect(booking)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">#{booking.id}</div>
                          <div className="text-sm text-gray-600">{booking.customer_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(booking.total_amount)}
                          </div>
                          <div className="text-sm text-gray-600">{booking.date}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedBooking && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Booking Dipilih</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">ID:</span>
                      <span className="ml-2 font-medium">#{selectedBooking.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Customer:</span>
                      <span className="ml-2 font-medium">{selectedBooking.customer_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="ml-2 font-medium">{formatCurrency(selectedBooking.total_amount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tanggal:</span>
                      <span className="ml-2 font-medium">{selectedBooking.date}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metode Pembayaran
            </label>
            <select
              value={formData.method}
              onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="">Pilih metode pembayaran</option>
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label} - {method.description}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Pembayaran
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Masukkan jumlah pembayaran"
              required
            />
          </div>

          {/* Reference Number */}
          {selectedMethod?.requires_reference && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Referensi
              </label>
              <input
                type="text"
                value={formData.reference_number}
                onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Masukkan nomor referensi"
                required
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Tambahkan catatan jika diperlukan"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Proses Pembayaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualPaymentModal;
