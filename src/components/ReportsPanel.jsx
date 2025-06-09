// src/components/ReportsPanel.jsx
import { useNavigate } from 'react-router-dom';

const ReportsPanel = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Laporan Bisnis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Laporan Harian</h3>
            <p className="text-red-700 mb-4">
              Ringkasan aktivitas dan pendapatan harian.
            </p>
            <button
              onClick={() => navigate('/staff/reports/daily')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
            >
              Lihat Laporan
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">📈</span>
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Laporan Bulanan</h3>
            <p className="text-blue-700 mb-4">
              Analisis performa bisnis bulanan.
            </p>
            <button
              onClick={() => navigate('/staff/reports/monthly')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Lihat Laporan
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Laporan Keuangan</h3>
            <p className="text-green-700 mb-4">
              Detail pendapatan dan transaksi.
            </p>
            <button
              onClick={() => navigate('/staff/reports/financial')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
            >
              Lihat Laporan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPanel;
