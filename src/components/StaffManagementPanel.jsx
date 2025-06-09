// src/components/StaffManagementPanel.jsx
import { useNavigate } from 'react-router-dom';

const StaffManagementPanel = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Staff</h2>
      
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-900">👥</span>
          </div>
          <h3 className="text-lg font-semibold text-orange-900 mb-2">Kelola Tim Staff</h3>
          <p className="text-orange-700 mb-4">
            Manajemen staff kasir, operator, dan monitoring performa tim.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/staff/users')}
              className="w-full bg-orange-600 text-gray-900 px-4 py-2 rounded-lg hover:bg-orange-700 transition duration-200"
            >
              Kelola Staff
            </button>
            <button
              onClick={() => navigate('/staff/performance')}
              className="w-full bg-orange-100 text-orange-800 px-4 py-2 rounded-lg hover:bg-orange-200 transition duration-200"
            >
              Lihat Performa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffManagementPanel;
