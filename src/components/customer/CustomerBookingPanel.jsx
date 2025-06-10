import React, { useState, useEffect } from 'react';
import { getPublicFields } from '../../api/fieldAPI';
import { createBooking } from '../../api/bookingAPI';
import { createPayment } from '../../api/paymentAPI';
import useAuth from '../../hooks/useAuth';
import { Calendar, Clock, MapPin, User, Phone, Mail, MessageSquare } from 'lucide-react';

const CustomerBookingPanel = () => {
  const { user } = useAuth();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Payment method options
  const paymentMethods = [
    { value: 'bank_transfer', label: 'Transfer Bank', description: 'Transfer ke rekening bank' },
    { value: 'cash', label: 'Tunai', description: 'Bayar di tempat' },
    { value: 'ewallet', label: 'E-Wallet', description: 'GoPay, OVO, DANA' },
    { value: 'qris', label: 'QRIS', description: 'Scan QR Code' }
  ];

  const [formData, setFormData] = useState({
    field_id: '',
    date: '',
    start_time: '',
    end_time: '',
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    notes: '',
    payment_method: 'bank_transfer' // Default payment method
  });

  useEffect(() => {
    fetchFields();
  }, []);

  // Update form data when user info is available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const response = await getPublicFields();
      if (response.success) {
        setFields(response.data || []);
      }
    } catch (err) {
      setError('Gagal memuat data lapangan');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };

      // Auto-adjust end_time when start_time changes
      if (name === 'start_time' && value && prev.end_time) {
        const startHour = parseInt(value.split(':')[0]);
        const endHour = parseInt(prev.end_time.split(':')[0]);

        // If end_time is not greater than start_time, auto-set end_time to start_time + 1 hour
        if (endHour <= startHour) {
          const newEndHour = startHour + 1;
          if (newEndHour <= 23) {
            newData.end_time = `${newEndHour.toString().padStart(2, '0')}:00`;
          } else {
            newData.end_time = '23:30'; // Max time
          }
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (!formData.field_id || !formData.date || !formData.start_time || !formData.end_time || !formData.name || !formData.phone) {
        setError('Semua field wajib harus diisi');
        return;
      }

      // Validate field selection
      const selectedField = fields.find(f => f.id === parseInt(formData.field_id));
      if (!selectedField) {
        setError('Lapangan yang dipilih tidak valid');
        return;
      }

      // Validate field price
      if (!selectedField.price || selectedField.price <= 0) {
        setError('Lapangan yang dipilih tidak memiliki harga yang valid. Silakan pilih lapangan lain.');
        return;
      }

      // Note: Field status validation tidak diperlukan karena Public Fields API
      // sudah memfilter hanya field aktif yang dikembalikan

      // Validate time logic
      if (formData.start_time >= formData.end_time) {
        setError('Jam selesai harus lebih besar dari jam mulai');
        return;
      }

      // Calculate duration to ensure it's positive
      const startHour = parseInt(formData.start_time.split(':')[0]);
      const startMinute = parseInt(formData.start_time.split(':')[1]);
      const endHour = parseInt(formData.end_time.split(':')[0]);
      const endMinute = parseInt(formData.end_time.split(':')[1]);

      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      const durationMinutes = endTotalMinutes - startTotalMinutes;

      if (durationMinutes <= 0) {
        setError('Durasi booking harus minimal 1 jam');
        return;
      }

      if (durationMinutes < 60) {
        setError('Durasi booking minimal 1 jam');
        return;
      }

      // Validate date (not in the past)
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setError('Tanggal booking tidak boleh di masa lalu');
        return;
      }

      // Prepare booking data with proper types
      const bookingData = {
        field_id: parseInt(formData.field_id), // Ensure integer
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || user?.email || null,
        notes: formData.notes?.trim() || null
      };

      // Additional validation
      if (isNaN(bookingData.field_id)) {
        setError('Field ID tidak valid');
        return;
      }

      console.log('Sending booking data:', bookingData);
      console.log('Selected field:', selectedField);
      console.log('User context:', user);

      const response = await createBooking(bookingData);
      if (response.success) {
        const booking = response.data;
        console.log('Booking created successfully:', booking);

        // Auto-create payment for the booking
        try {
          const paymentData = {
            method: formData.payment_method || 'bank_transfer', // Use selected method
            amount: booking.total_amount,
            currency: 'IDR'
          };

          const paymentResponse = await createPayment(booking.id, paymentData);
          if (paymentResponse.success) {
            setSuccess(`Booking berhasil dibuat! Payment ID: ${paymentResponse.data.payment_number}. Silakan lakukan pembayaran dan upload bukti di tab Pembayaran.`);
          } else {
            setSuccess('Booking berhasil dibuat! Silakan buat pembayaran di tab Pembayaran.');
          }
        } catch (paymentError) {
          console.error('Error creating payment:', paymentError);
          setSuccess('Booking berhasil dibuat! Silakan buat pembayaran di tab Pembayaran.');
        }

        setFormData({
          field_id: '',
          date: '',
          start_time: '',
          end_time: '',
          name: '',
          phone: '',
          email: '',
          notes: '',
          payment_method: 'bank_transfer'
        });
      } else {
        setError(response.error || response.message || 'Gagal membuat booking');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Gagal membuat booking');
    } finally {
      setSubmitting(false);
    }
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 23; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      times.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return times;
  };

  const generateEndTimeOptions = () => {
    if (!formData.start_time) return generateTimeOptions();

    const startHour = parseInt(formData.start_time.split(':')[0]);
    const startMinute = parseInt(formData.start_time.split(':')[1]);
    const startTotalMinutes = startHour * 60 + startMinute;

    const times = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute of [0, 30]) {
        const totalMinutes = hour * 60 + minute;
        // Only include times that are at least 1 hour after start_time
        if (totalMinutes > startTotalMinutes + 60) {
          times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
      }
    }
    return times;
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
          <Calendar className="w-6 h-6 text-gray-900" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Booking Baru</h2>
          <p className="text-gray-600">Buat reservasi lapangan soccer</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-5 h-5 text-gray-900 mr-2">✅</div>
            <span className="text-gray-900">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-5 h-5 text-red-600 mr-2">❌</div>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Booking Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Field Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <MapPin className="w-4 h-4 text-gray-800" />
                <span>Pilih Lapangan</span>
              </label>
              <select
                name="field_id"
                value={formData.field_id}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-800"
              >
                <option value="">-- Pilih Lapangan --</option>
                {fields.map(field => (
                  <option key={field.id} value={field.id}>
                    {field.name} - Rp {field.price?.toLocaleString('id-ID')}/jam
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Calendar className="w-4 h-4 text-gray-800" />
                <span>Tanggal</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={getMinDate()}
                max={getMaxDate()}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-800"
              />
            </div>
          </div>

          {/* Duration Display */}
          {formData.start_time && formData.end_time && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-800" />
                  <span className="font-semibold text-gray-900">Durasi Booking:</span>
                </div>
                <div className="text-gray-900 font-bold">
                  {(() => {
                    const startHour = parseInt(formData.start_time.split(':')[0]);
                    const startMinute = parseInt(formData.start_time.split(':')[1]);
                    const endHour = parseInt(formData.end_time.split(':')[0]);
                    const endMinute = parseInt(formData.end_time.split(':')[1]);

                    const startTotalMinutes = startHour * 60 + startMinute;
                    const endTotalMinutes = endHour * 60 + endMinute;
                    const durationMinutes = endTotalMinutes - startTotalMinutes;

                    if (durationMinutes > 0) {
                      const hours = Math.floor(durationMinutes / 60);
                      const minutes = durationMinutes % 60;
                      return `${hours} jam ${minutes > 0 ? `${minutes} menit` : ''}`;
                    }
                    return 'Invalid';
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Time Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Clock className="w-4 h-4 text-gray-800" />
                <span>Jam Mulai</span>
              </label>
              <select
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-800"
              >
                <option value="">-- Pilih Jam Mulai --</option>
                {generateTimeOptions().map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Clock className="w-4 h-4 text-gray-800" />
                <span>Jam Selesai</span>
              </label>
              <select
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                required
                disabled={!formData.start_time}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.start_time ? "-- Pilih Jam Mulai Dulu --" : "-- Pilih Jam Selesai --"}
                </option>
                {generateEndTimeOptions().map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <User className="w-4 h-4 text-gray-800" />
                <span>Nama Lengkap</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-800"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Phone className="w-4 h-4 text-gray-800" />
                <span>Nomor Telepon</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-800"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                <Mail className="w-4 h-4 text-gray-800" />
                <span>Email (Opsional)</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-800"
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
              <span>💳</span>
              <span>Metode Pembayaran</span>
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-800"
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label} - {method.description}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              Pilih metode pembayaran yang akan Anda gunakan
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
              <MessageSquare className="w-4 h-4 text-gray-800" />
              <span>Catatan (Opsional)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Tambahkan catatan khusus untuk booking ini..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-800 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || loading}
              className="bg-gradient-to-r from-gray-800 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-gray-900 px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Memproses...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Buat Booking</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data lapangan...</p>
        </div>
      )}
    </div>
  );
};

export default CustomerBookingPanel;
