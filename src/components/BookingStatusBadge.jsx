import React from 'react';

/**
 * Komponen untuk menampilkan status booking dengan informasi auto-completion
 * @param {Object} booking - Data booking
 * @param {boolean} showAutoCompleteInfo - Tampilkan info auto-completion
 * @param {string} size - Ukuran badge (sm, md, lg)
 */
const BookingStatusBadge = ({ 
  booking, 
  showAutoCompleteInfo = false, 
  size = 'md' 
}) => {
  
  // Tentukan style berdasarkan status
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Tentukan label status dalam bahasa Indonesia
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': 
        return 'Menunggu Konfirmasi';
      case 'confirmed': 
        return 'Dikonfirmasi';
      case 'completed': 
        return 'Selesai';
      case 'cancelled': 
        return 'Dibatalkan';
      default: 
        return status;
    }
  };

  // Tentukan ukuran badge
  const getSizeClasses = (size) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default: // md
        return 'px-3 py-1 text-sm';
    }
  };

  // Cek apakah booking akan auto-complete dalam waktu dekat
  const isNearCompletion = () => {
    if (booking.status !== 'confirmed') return false;

    try {
      const endTime = new Date(`${booking.date}T${booking.end_time}`);
      const now = new Date();
      const timeDiff = endTime - now;

      // Jika kurang dari 30 menit lagi
      return timeDiff > 0 && timeDiff < 30 * 60 * 1000;
    } catch (error) {
      console.error('Error calculating completion time:', error);
      return false;
    }
  };

  // Cek apakah booking sudah melewati waktu berakhir
  const isPastEndTime = () => {
    if (booking.status !== 'confirmed') return false;

    try {
      const endTime = new Date(`${booking.date}T${booking.end_time}`);
      const now = new Date();
      return now > endTime;
    } catch (error) {
      console.error('Error calculating past end time:', error);
      return false;
    }
  };

  // Hitung waktu tersisa sampai auto-completion
  const getTimeUntilCompletion = () => {
    if (booking.status !== 'confirmed') return null;

    try {
      const endTime = new Date(`${booking.date}T${booking.end_time}`);
      const gracePeriodEnd = new Date(endTime.getTime() + (15 * 60 * 1000)); // +15 menit grace period
      const now = new Date();
      const timeDiff = gracePeriodEnd - now;

      if (timeDiff <= 0) return 'Akan diselesaikan segera';

      const minutes = Math.floor(timeDiff / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      if (hours > 0) {
        return `${hours}j ${remainingMinutes}m lagi`;
      } else {
        return `${remainingMinutes}m lagi`;
      }
    } catch (error) {
      console.error('Error calculating time until completion:', error);
      return null;
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Badge Status Utama */}
      <span className={`inline-flex items-center rounded-full font-medium border ${getStatusStyle(booking.status)} ${getSizeClasses(size)}`}>
        {getStatusLabel(booking.status)}
      </span>

      {/* Info Auto-Complete untuk booking yang akan selesai */}
      {showAutoCompleteInfo && isNearCompletion() && (
        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
          <div className="flex items-center space-x-1">
            <span>⏰</span>
            <span>Auto-complete: {getTimeUntilCompletion()}</span>
          </div>
        </div>
      )}

      {/* Info untuk booking yang sudah melewati waktu berakhir */}
      {showAutoCompleteInfo && isPastEndTime() && booking.status === 'confirmed' && (
        <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
          <div className="flex items-center space-x-1">
            <span>⏳</span>
            <span>Menunggu auto-completion sistem</span>
          </div>
        </div>
      )}

      {/* Info jika sudah auto-completed */}
      {booking.status === 'completed' && booking.completed_by === null && (
        <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
          <div className="flex items-center space-x-1">
            <span>✅</span>
            <span>Otomatis diselesaikan sistem</span>
          </div>
        </div>
      )}

      {/* Info jika manual completion */}
      {booking.status === 'completed' && booking.completed_by !== null && (
        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
          <div className="flex items-center space-x-1">
            <span>👤</span>
            <span>Diselesaikan manual</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingStatusBadge;
