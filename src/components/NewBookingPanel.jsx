// src/components/NewBookingPanel.jsx
import { useNavigate } from 'react-router-dom';

const NewBookingPanel = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Baru</h2>
      
      <div className="bg-gradient-to-br from-blue-50 to-gray-100 p-6 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white">➕</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Buat Booking Lapangan</h3>
          <p className="text-gray-500 mb-4">
            Pilih lapangan, tanggal, dan waktu yang Anda inginkan untuk bermain soccer.
          </p>
          <button
            onClick={() => navigate('/customer/booking/new')}
            className="bg-gray-800 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-500 transition duration-200 font-medium"
          >
            Mulai Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewBookingPanel;
