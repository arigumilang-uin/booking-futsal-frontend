// src/components/FieldAvailabilityPanel.jsx
import { useNavigate } from 'react-router-dom';

const FieldAvailabilityPanel = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Ketersediaan Lapangan</h2>
      
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white">🏟️</span>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">Cek Ketersediaan Lapangan</h3>
          <p className="text-green-700 mb-4">
            Lihat jadwal ketersediaan semua lapangan futsal dan pilih waktu yang sesuai untuk booking Anda.
          </p>
          <button
            onClick={() => navigate('/customer/fields')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
          >
            Lihat Ketersediaan
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldAvailabilityPanel;
