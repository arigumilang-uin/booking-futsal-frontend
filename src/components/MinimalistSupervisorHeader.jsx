// src/components/MinimalistSupervisorHeader.jsx
// MINIMALIST & MODERN HEADER UNTUK SUPERVISOR
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import NotificationBadge from "./NotificationBadge";
import ProfileSettingsModal from "./ProfileSettingsModal";

const MinimalistSupervisorHeader = () => {
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
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <>
      <header className="bg-white border-b-2 border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto">
          {/* Main Header */}
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left Side - Soccer Brand */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl text-gray-900">⚽</span>
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Panam Soccer Field Management
                </h1>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-sm text-gray-600">Sistem Manajemen Lapangan</span>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {currentTime.toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Soccer Actions */}
            <div className="flex items-center space-x-4">
              {/* System Status */}
              <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <div className="w-2 h-2 bg-gray-800 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500 font-medium">Sistem Aktif</span>
              </div>

              {/* Notifications */}
              <NotificationBadge />

              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-2 transition-all duration-200 border border-gray-200"
                >
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-sm text-white">👤</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{getGreeting()}</p>
                    <p className="text-xs text-gray-600">{user?.name || "Supervisor"}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 text-gray-400 ${showUserMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Soccer User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-green-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-sm font-bold text-gray-900">👤</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-600">{user?.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              ⚽ {user?.role || 'Supervisor Sistem'}
                            </span>
                          </div>
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
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                      >
                        <span className="text-gray-900">🔄</span>
                        <span>Muat Ulang Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileModal(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center space-x-3"
                      >
                        <span className="text-gray-900">⚙️</span>
                        <span>Pengaturan Akun</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                      >
                        <span className="text-red-500">🚪</span>
                        <span>Keluar Sistem</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Time Display - Clean Style */}
          <div className="px-6 pb-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
                  <span className="text-sm">🕐</span>
                  <span className="text-sm font-medium">
                    {currentTime.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })}
                  </span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium">
                  {getGreeting()}, {user?.name?.split(' ')[0] || 'Supervisor'} ⚽
                </span>
              </div>

              <div className="text-xs text-gray-900 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
                🟢 Live • Sistem Aktif
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

export default MinimalistSupervisorHeader;
