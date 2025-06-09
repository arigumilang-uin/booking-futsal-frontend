// src/components/BookingManagementPanel.jsx
import { useNavigate } from 'react-router-dom';

const BookingManagementPanel = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Booking</h2>
      
      <div className="bg-gradient-to-br from-blue-50 to-gray-100 p-6 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white">📅</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Kelola Booking Lapangan</h3>
          <p className="text-gray-500 mb-4">
            Akses halaman manajemen booking untuk melihat, mengkonfirmasi, dan mengelola semua reservasi lapangan.
          </p>
          <button
            onClick={() => navigate('/staff/booking')}
            className="bg-gray-800 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-500 transition duration-200 font-medium"
          >
            Buka Kelola Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingManagementPanel;
