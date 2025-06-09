// src/components/CustomerProfilePanel.jsx
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const CustomerProfilePanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profil Saya</h2>
      
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-900">👤</span>
          </div>
          <h3 className="text-lg font-semibold text-orange-900 mb-2">Kelola Profil Anda</h3>
          <p className="text-orange-700 mb-4">
            Update informasi pribadi, preferensi, dan pengaturan akun Anda.
          </p>
          
          <div className="bg-white p-4 rounded-lg mb-4">
            <div className="text-left">
              <p className="text-sm text-gray-600">Nama Lengkap</p>
              <p className="font-medium text-gray-900">{user?.name || 'Customer'}</p>
            </div>
            <div className="text-left mt-3">
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{user?.email || 'customer@example.com'}</p>
            </div>
            <div className="text-left mt-3">
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-medium text-gray-900">Customer</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/customer/profile')}
            className="bg-orange-600 text-gray-900 px-6 py-3 rounded-lg hover:bg-orange-700 transition duration-200 font-medium"
          >
            Edit Profil
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfilePanel;
