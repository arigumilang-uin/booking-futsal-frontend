// src/components/MinimalistOperatorHeader.jsx
// MINIMALIST & MODERN HEADER UNTUK OPERATOR - SESUAI TEMA SUPERVISOR/MANAGER
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import NotificationBadge from './NotificationBadge';
import ProfileSettingsModal from './ProfileSettingsModal';

const MinimalistOperatorHeader = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Update time every second for real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <>
      <header className="text-gray-900 shadow-2xl border-b-4" style={{
        background: `linear-gradient(135deg, #1F2937 0%, #1F2937 50%, #374151 100%)`,
        borderBottomColor: '#1F2937'
      }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Left Side - Brand & Title */}
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20" style={{
                background: `linear-gradient(135deg, #1F2937 0%, #1F2937 100%)`
              }}>
                <span className="text-2xl font-bold">⚙️</span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-100 via-white to-gray-100 bg-clip-text text-transparent">
                  Panam Soccer Field - Operator Center
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm text-gray-200 font-medium">Field Operations & Management</span>
                  <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                  <span className="text-sm text-white">
                    {currentTime.toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Modern Controls */}
            <div className="flex items-center space-x-4">
              {/* Real-time Clock */}
              <div className="hidden lg:flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">
                <div className="w-2 h-2 bg-gray-800 rounded-full animate-pulse"></div>
                <div className="text-right">
                  <p className="text-xs text-gray-200 font-medium">Waktu Sekarang</p>
                  <p className="text-sm text-gray-900 font-bold">
                    {currentTime.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Notifications */}
              <div className="relative">
                <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm hover:bg-white/20 transition-all duration-200">
                  <NotificationBadge />
                </div>
              </div>

              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-2 transition-all duration-200 border border-gray-200"
                >
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-sm text-gray-900">⚙️</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{getGreeting()}</p>
                    <p className="text-xs text-gray-600">{user?.name || "Operator"}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 text-gray-400 ${showUserMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    {/* User Info Header */}
                    <div className="bg-gradient-to-r from-gray-800 to-gray-800 p-6 text-gray-900">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                          <span className="text-2xl">⚙️</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{user?.name || "Operator"}</h3>
                          <p className="text-gray-100 text-sm">{user?.email}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs text-gray-200 font-medium bg-gray-800/30 px-2 py-1 rounded-full">
                              Operator Lapangan
                            </span>
                            <span className="text-xs text-gray-200 font-medium bg-gray-800/30 px-2 py-1 rounded-full">
                              Online
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-3">
                      <button
                        onClick={() => {
                          navigate('/staff');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-200"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span>📊</span>
                        </div>
                        <div>
                          <p className="font-medium">Operator Dashboard</p>
                          <p className="text-xs text-gray-500">Akses dashboard utama</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/staff/fields');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center space-x-3 transition-colors duration-200"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span>🏟️</span>
                        </div>
                        <div>
                          <p className="font-medium">Kelola Lapangan</p>
                          <p className="text-xs text-gray-500">Monitor & maintenance</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/staff/bookings');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-purple-50 flex items-center space-x-3 transition-colors duration-200"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span>📅</span>
                        </div>
                        <div>
                          <p className="font-medium">Jadwal Booking</p>
                          <p className="text-xs text-gray-500">Lihat jadwal lapangan</p>
                        </div>
                      </button>

                      <div className="border-t border-gray-200 mt-3 pt-3">
                        <button
                          onClick={() => {
                            setShowProfileModal(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-200"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span>⚙️</span>
                          </div>
                          <div>
                            <p className="font-medium">Pengaturan Profil</p>
                            <p className="text-xs text-gray-500">Kelola akun dan preferensi</p>
                          </div>
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-6 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors duration-200"
                        >
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <span>🚪</span>
                          </div>
                          <div>
                            <p className="font-medium">Keluar</p>
                            <p className="text-xs text-red-500">Logout dari sistem</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Settings Modal */}
      {showProfileModal && (
        <ProfileSettingsModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  );
};

export default MinimalistOperatorHeader;
