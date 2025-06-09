// src/components/MinimalistCustomerHeader.jsx
// MINIMALIST & MODERN HEADER UNTUK CUSTOMER - TEMA EMERALD/TEAL
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import NotificationBadge from './NotificationBadge';
import ProfileSettingsModal from './ProfileSettingsModal';

const MinimalistCustomerHeader = () => {
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

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 shadow-2xl border-b-4 border-emerald-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left Side - Branding & Time */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">⚽</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">FutsalPro</h1>
                  <p className="text-emerald-100 text-sm font-medium">Customer Portal</p>
                </div>
              </div>

              {/* Real-time Clock */}
              <div className="hidden lg:flex items-center space-x-4 bg-emerald-500/30 px-4 py-2 rounded-xl border border-emerald-400/50 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-white font-bold text-lg">{formatTime(currentTime)}</div>
                  <div className="text-emerald-100 text-xs">{formatDate(currentTime)}</div>
                </div>
              </div>
            </div>

            {/* Right Side - Customer Actions */}
            <div className="flex items-center space-x-4">
              {/* Customer Status */}
              <div className="hidden md:flex items-center space-x-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-emerald-700 font-medium">Customer Aktif</span>
              </div>

              {/* Notifications */}
              <NotificationBadge />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 bg-emerald-500/20 hover:bg-emerald-500/30 px-4 py-2 rounded-xl border border-emerald-400/50 transition-all duration-200 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-white font-semibold text-sm">
                      {user?.name || 'Customer'}
                    </div>
                    <div className="text-emerald-100 text-xs">
                      {user?.email || 'customer@example.com'}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    {/* User Info Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-emerald-600 font-bold text-2xl">
                            {user?.name?.charAt(0)?.toUpperCase() || 'C'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg">
                            {user?.name || 'Customer'}
                          </h3>
                          <p className="text-emerald-100 text-sm">
                            {user?.email || 'customer@example.com'}
                          </p>
                          <span className="text-xs text-emerald-200 bg-emerald-400/30 px-2 py-1 rounded-full border border-emerald-300">
                            Customer
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          window.location.reload();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 flex items-center space-x-3"
                      >
                        <span className="text-emerald-500">🔄</span>
                        <span>Muat Ulang Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileModal(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 flex items-center space-x-3"
                      >
                        <span className="text-emerald-500">⚙️</span>
                        <span>Pengaturan Akun</span>
                      </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="border-t border-gray-200 py-2">
                      <button
                        onClick={() => {
                          navigate('/customer/booking/new');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 flex items-center space-x-3"
                      >
                        <span className="text-emerald-500">📅</span>
                        <span>Booking Baru</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/customer/bookings');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 flex items-center space-x-3"
                      >
                        <span className="text-emerald-500">📋</span>
                        <span>Riwayat Booking</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/customer/fields');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 flex items-center space-x-3"
                      >
                        <span className="text-emerald-500">🏟️</span>
                        <span>Lihat Lapangan</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-200 py-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                      >
                        <span className="text-red-500">🚪</span>
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200">
                🟢 Live • Customer Portal
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default MinimalistCustomerHeader;
