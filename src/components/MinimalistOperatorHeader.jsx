// src/components/MinimalistOperatorHeader.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import NotificationBadge from './NotificationBadge';

const MinimalistOperatorHeader = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white shadow-2xl border-b-4 border-green-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Left Side - Brand & Title */}
          <div className="flex items-center space-x-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
              <span className="text-2xl font-bold">⚙️</span>
            </div>
            
            {/* Title & Subtitle */}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-200 via-white to-green-200 bg-clip-text text-transparent">
                Operator Field Center
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-sm text-green-200 font-medium">Field & Operations</span>
                <div className="w-1 h-1 bg-green-300 rounded-full"></div>
                <span className="text-sm text-green-300">
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

          {/* Right Side - User Menu & Notifications */}
          <div className="flex items-center space-x-6">
            {/* Notifications */}
            <div className="relative">
              <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm hover:bg-white/20 transition-all duration-200">
                <NotificationBadge />
              </div>
            </div>

            {/* Field Status Indicator */}
            <div className="hidden md:flex items-center space-x-3 bg-blue-500/20 px-4 py-2 rounded-xl backdrop-blur-sm border border-blue-400/30">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg"></div>
              <div>
                <span className="text-xs text-blue-200 font-medium">Field Status</span>
                <p className="text-xs text-blue-100">All Fields Ready</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-4 bg-white/10 hover:bg-white/20 rounded-xl px-5 py-3 transition-all duration-200 backdrop-blur-sm border border-white/20 shadow-lg"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
                  <span className="text-lg font-bold">⚙️</span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-white">{user?.name || "Operator"}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-green-200 font-medium">Operator Lapangan</span>
                    <div className="w-1 h-1 bg-green-300 rounded-full"></div>
                    <span className="text-xs text-green-300">
                      {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  {/* User Info Header */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <span className="text-2xl">⚙️</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{user?.name || "Operator"}</h3>
                        <p className="text-green-100 text-sm">{user?.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-green-200 font-medium bg-green-400/30 px-2 py-1 rounded-full">
                            Operator Lapangan
                          </span>
                          <span className="text-xs text-green-200 font-medium bg-green-400/30 px-2 py-1 rounded-full">
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
                      className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-green-50 flex items-center space-x-3 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
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
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
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
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
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
                          navigate('/profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-200"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span>⚙️</span>
                        </div>
                        <div>
                          <p className="font-medium">Pengaturan</p>
                          <p className="text-xs text-gray-500">Kelola akun</p>
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
  );
};

export default MinimalistOperatorHeader;
