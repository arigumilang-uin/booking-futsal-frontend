// src/pages/customer/Booking/BookingForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPublicFields, checkFieldAvailability } from '../../../api/fieldAPI';
import { createBooking } from '../../../api/bookingAPI';
import useAuth from '../../../hooks/useAuth';

const BookingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const selectedField = location.state?.selectedField;

  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    fieldId: selectedField?.id || '',
    date: '',
    timeSlot: '',
    duration: 1,
    notes: ''
  });

  const timeSlots = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
    '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00',
    '20:00-21:00', '21:00-22:00'
  ];

  const [availableSlots, setAvailableSlots] = useState(timeSlots); // Initialize dengan default slots

  useEffect(() => {
    loadFields();
  }, []);

  useEffect(() => {
    if (formData.fieldId && formData.date) {
      checkAvailability();
    } else {
      // Reset to default slots when field or date is cleared
      setAvailableSlots(timeSlots);
    }
  }, [formData.fieldId, formData.date]);

  const loadFields = async () => {
    try {
      setLoading(true);
      console.log('Loading fields...');
      const response = await getPublicFields();
      console.log('Fields response:', response);
      if (response.success) {
        console.log('Fields loaded:', response.data);
        setFields(response.data);
      } else {
        console.log('Failed to load fields:', response);
        setError('Gagal memuat data lapangan');
      }
    } catch (error) {
      console.error('Error loading fields:', error);
      setError('Gagal memuat data lapangan');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    try {
      setCheckingAvailability(true);
      console.log('Checking availability for field:', formData.fieldId, 'date:', formData.date);
      const response = await checkFieldAvailability(formData.fieldId, formData.date);
      console.log('Availability response:', response);

      if (response.success && response.data && response.data.availability) {
        // Extract available time slots from backend response
        const available = response.data.availability
          .filter(slot => slot.available)
          .map(slot => `${slot.start_time}-${slot.end_time}`);
        console.log('Available slots from API:', available);
        setAvailableSlots(available.length > 0 ? available : timeSlots);
      } else {
        console.log('No availability data, using default slots');
        setAvailableSlots(timeSlots); // Fallback to all slots
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      console.log('API error, using default slots');
      setAvailableSlots(timeSlots); // Fallback to all slots
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Form input changed:', name, '=', value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fieldId || !formData.date || !formData.timeSlot) {
      setError('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Parse time slot to get start_time and end_time
      const [startTime] = formData.timeSlot.split('-');

      // Calculate actual end time based on duration
      const startHour = parseInt(startTime.split(':')[0]);
      const actualEndHour = startHour + formData.duration;
      const actualEndTime = `${actualEndHour.toString().padStart(2, '0')}:00`;

      const bookingData = {
        field_id: parseInt(formData.fieldId),
        date: formData.date,
        start_time: startTime,
        end_time: actualEndTime,
        name: user?.name || 'Customer', // Use user name from auth context
        phone: user?.phone || '081234567890', // Use user phone from auth context
        email: user?.email, // Optional, will use user email from token
        notes: formData.notes || ''
      };

      console.log('Sending booking data:', bookingData); // Debug log

      const response = await createBooking(bookingData);

      if (response.success) {
        setSuccess('Booking berhasil dibuat! Redirecting...');
        console.log('Booking created successfully:', response.data);

        // Reset form untuk memungkinkan booking baru
        setFormData({
          fieldId: '',
          date: '',
          timeSlot: '',
          duration: 1,
          notes: ''
        });

        setTimeout(() => {
          navigate('/bookings');
        }, 2000);
      } else {
        setError(response.error || 'Gagal membuat booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.response?.data?.error || 'Terjadi kesalahan saat membuat booking');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedFieldData = fields.find(f => f.id === parseInt(formData.fieldId));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Booking Lapangan</h1>
            <p className="text-gray-600 mt-1">Isi form di bawah untuk membuat booking baru</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Lapangan *
              </label>
              <select
                name="fieldId"
                value={formData.fieldId}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Pilih lapangan...</option>
                {fields.map(field => (
                  <option key={field.id} value={field.id}>
                    {field.name} - {field.type} (Rp {field.price_per_hour?.toLocaleString()}/jam)
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waktu *
              </label>
              <select
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.fieldId || !formData.date || checkingAvailability}
              >
                <option value="">
                  {checkingAvailability ? 'Mengecek ketersediaan...' : 'Pilih waktu...'}
                </option>
                {availableSlots.map(slot => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {!formData.fieldId || !formData.date ? (
                <p className="text-sm text-gray-500 mt-1">Pilih lapangan dan tanggal terlebih dahulu</p>
              ) : checkingAvailability ? (
                <p className="text-sm text-blue-500 mt-1">🔄 Mengecek ketersediaan waktu...</p>
              ) : (
                <p className="text-sm text-green-500 mt-1">✅ {availableSlots.length} slot waktu tersedia</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durasi (jam)
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 jam</option>
                <option value={2}>2 jam</option>
                <option value={3}>3 jam</option>
                <option value={4}>4 jam</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan (opsional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Tambahkan catatan khusus untuk booking ini..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Booking Summary */}
            {selectedFieldData && formData.timeSlot && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Ringkasan Booking</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Lapangan:</strong> {selectedFieldData.name}</p>
                  <p><strong>Tanggal:</strong> {formData.date}</p>
                  <p><strong>Waktu:</strong> {formData.timeSlot}</p>
                  <p><strong>Durasi:</strong> {formData.duration} jam</p>
                  <p><strong>Total Biaya:</strong> Rp {(selectedFieldData.price_per_hour * formData.duration).toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/bookings')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.fieldId || !formData.date || !formData.timeSlot}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Memproses...' : 'Buat Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
