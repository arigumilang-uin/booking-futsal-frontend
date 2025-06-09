// src/components/BusinessAnalyticsPanel.jsx
import { useNavigate } from 'react-router-dom';

const BusinessAnalyticsPanel = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analitik Bisnis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-gray-100 p-6 rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">📈</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Laporan Pendapatan</h3>
            <p className="text-gray-500 mb-4">
              Analisis pendapatan harian, mingguan, dan bulanan dari booking lapangan.
            </p>
            <button
              onClick={() => navigate('/staff/reports/revenue')}
              className="bg-gray-800 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-500 transition duration-200"
            >
              Lihat Laporan
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-gray-100 p-6 rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">👥</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Analisis Customer</h3>
            <p className="text-gray-500 mb-4">
              Data customer, tingkat retensi, dan pola booking pelanggan.
            </p>
            <button
              onClick={() => navigate('/staff/reports/customers')}
              className="bg-gray-800 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-500 transition duration-200"
            >
              Lihat Analisis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessAnalyticsPanel;
